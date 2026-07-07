package com.commerce.monorepo.service.payment;

import com.commerce.monorepo.config.IyzicoProperties;
import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.dto.OrderItemDto;
import com.commerce.monorepo.dto.payment.CardPaymentCallbackRequest;
import com.commerce.monorepo.dto.payment.CardPaymentInitRequest;
import com.commerce.monorepo.dto.payment.CardPaymentInitResponse;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.ProductVariantRepository;
import com.iyzipay.Options;
import com.iyzipay.model.BasketItem;
import com.iyzipay.model.BasketItemType;
import com.iyzipay.model.CheckoutForm;
import com.iyzipay.model.CheckoutFormInitialize;
import com.iyzipay.model.Currency;
import com.iyzipay.model.Locale;
import com.iyzipay.model.PaymentGroup;
import com.iyzipay.model.Status;
import com.iyzipay.request.CreateCheckoutFormInitializeRequest;
import com.iyzipay.request.RetrieveCheckoutFormRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Kart ile ödeme servisi — sağlayıcıdan bağımsız isimlendirilmiştir (DTO'lar, Order
 * kolonları, endpoint yolları "iyzico" ismini taşımaz), çünkü ödeme sağlayıcısı
 * PayTR'ye geçiş sürecindedir. Bu sınıfın İÇİNDEKİ gerçek entegrasyon şu an hâlâ
 * iyzico SDK'sını kullanıyor — PayTR'nin gerçek API bilgileri (merchant_id/key/salt)
 * elde edilip sandbox'ta test edildikten sonra bu implementasyon PayTR'nin
 * iFrame API'sine göre güncellenecek (dış görünen sınıf/DTO isimleri değişmeyecek).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CardPaymentService {

    private final IyzicoProperties properties;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final com.commerce.monorepo.service.EmailService emailService;

    @Transactional
    public CardPaymentInitResponse initCheckout(CardPaymentInitRequest req) {
        Order order = orderRepository.findByIdWithItems(req.getOrderId())
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING || order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BaseException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        }

        String callback = StringUtils.hasText(req.getCallbackUrl())
                ? req.getCallbackUrl()
                : properties.getCallbackUrl();

        CreateCheckoutFormInitializeRequest request = new CreateCheckoutFormInitializeRequest();
        request.setLocale("tr".equalsIgnoreCase(properties.getLocale()) ? Locale.TR.getValue() : Locale.EN.getValue());
        request.setConversationId(order.getOrderNumber());
        request.setPrice(price(order.getTotal()));
        request.setPaidPrice(price(order.getTotal()));
        request.setCurrency(Currency.TRY.name());
        request.setBasketId(order.getOrderNumber());
        request.setPaymentGroup(PaymentGroup.PRODUCT.name());
        request.setCallbackUrl(callback);

        // Buyer
        var buyer = new com.iyzipay.model.Buyer();
        buyer.setId(String.valueOf(order.getUser().getId()));
        buyer.setName(extractName(order.getShippingAddress()));
        buyer.setSurname(extractSurname(order.getShippingAddress()));
        // Guest user'larda email null olabilir
        String buyerEmail = order.getUser().getEmail() != null
                ? order.getUser().getEmail()
                : order.getUser().getGuestEmail();
        buyer.setEmail(buyerEmail);
        buyer.setGsmNumber(extractPhone(order.getShippingAddress()));
        // TCKN artık müşteriden toplanmıyor (KVKK kapsamını daraltmak için) —
        // ödeme sağlayıcısı API'si bu alanı zorunlu kıldığından sabit bir placeholder gönderiyoruz.
        buyer.setIdentityNumber("11111111111");
        buyer.setRegistrationAddress(extractAddress(order.getShippingAddress()));
        buyer.setCity(safe(order.getShippingAddress() != null ? order.getShippingAddress().getCity() : null));
        buyer.setCountry(safe(order.getShippingAddress() != null ? order.getShippingAddress().getCountry() : "Turkey"));
        request.setBuyer(buyer);

        // Addresses
        request.setShippingAddress(buildAddress("Shipping", order.getShippingAddress()));
        request.setBillingAddress(buildAddress("Billing", order.getBillingAddress()));

        // Basket items
        List<BasketItem> items = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            BasketItem bi = new BasketItem();
            bi.setId(String.valueOf(item.getProduct().getId()));
            bi.setName(item.getProduct().getName());
            bi.setCategory1("Default");
            bi.setItemType(BasketItemType.PHYSICAL.name());
            bi.setPrice(price(item.getTotalPrice()));
            items.add(bi);
        }
        request.setBasketItems(items);

        CheckoutFormInitialize response = CheckoutFormInitialize.create(request, options());
        if (response == null || !Status.SUCCESS.getValue().equalsIgnoreCase(response.getStatus())) {
            String errorMsg = response != null
                    ? String.format("Ödeme sağlayıcısı hatası: %s (Status: %s, Error Code: %s)",
                        response.getErrorMessage(),
                        response.getStatus(),
                        response.getErrorCode())
                    : "Bilinmeyen ödeme sağlayıcısı hatası (response null)";
            log.error("Kart ödeme başlatma başarısız — sipariş {}: {}", order.getId(), errorMsg);
            throw new BaseException(ErrorCode.PAYMENT_INIT_FAILED, errorMsg);
        }

        order.setPaymentStatus(PaymentStatus.INITIATED);
        order.setPaymentToken(response.getToken());
        order.setPaymentReference(response.getConversationId());
        orderRepository.save(order);

        return CardPaymentInitResponse.builder()
                .token(response.getToken())
                .paymentPageUrl(response.getPaymentPageUrl())
                .conversationId(response.getConversationId())
                .orderNumber(order.getOrderNumber())
                .expiresAt(String.valueOf(response.getTokenExpireTime()))
                .build();
    }

    @Transactional
    public OrderDto handleCallback(CardPaymentCallbackRequest req) {
        RetrieveCheckoutFormRequest request = new RetrieveCheckoutFormRequest();
        request.setLocale(Locale.TR.getValue());
        request.setToken(req.getToken());

        CheckoutForm checkoutForm = CheckoutForm.retrieve(request, options());
        if (checkoutForm == null) {
            throw new BaseException(ErrorCode.PAYMENT_CALLBACK_INVALID, "Ödeme sağlayıcısı checkout form boş döndü");
        }

        String conversationId = checkoutForm.getConversationId();
        Order order = orderRepository.findByOrderNumber(conversationId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return mapToDto(order);
        }

        if (!Status.SUCCESS.getValue().equalsIgnoreCase(checkoutForm.getStatus())) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.PENDING);
            orderRepository.save(order);

            // Ödeme başarısız emaili
            emailService.sendPaymentFailedEmail(order, checkoutForm.getErrorMessage());

            throw new BaseException(ErrorCode.PAYMENT_CALLBACK_INVALID, checkoutForm.getErrorMessage());
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.PAID);
        order.setPaymentId(checkoutForm.getPaymentId());
        order.setPaymentToken(req.getToken());
        orderRepository.save(order);

        // Ödeme başarılı emaili
        emailService.sendPaymentSuccessEmail(order);

        return mapToDto(order);
    }

    private Options options() {
        Options options = new Options();
        options.setApiKey(properties.getApiKey());
        options.setSecretKey(properties.getSecretKey());
        options.setBaseUrl(properties.getBaseUrl());
        return options;
    }

    private BigDecimal price(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private com.iyzipay.model.Address buildAddress(String label, Address address) {
        com.iyzipay.model.Address addr = new com.iyzipay.model.Address();
        addr.setContactName(extractName(address));
        addr.setCity(safe(address != null ? address.getCity() : null));
        addr.setCountry(safe(address != null ? address.getCountry() : "Turkey"));
        addr.setAddress(extractAddress(address));
        addr.setZipCode(safe(address != null ? address.getPostalCode() : null));
        return addr;
    }

    private String extractAddress(Address a) {
        if (a == null) return "";
        return String.join(" ",
                safe(a.getAddressLine()),
                safe(a.getDistrict()),
                safe(a.getCity()),
                safe(a.getCountry()));
    }

    private String extractPhone(Address a) {
        return a != null && StringUtils.hasText(a.getPhone()) ? a.getPhone() : "+905000000000";
    }

    private String extractName(Address a) {
        if (a == null || !StringUtils.hasText(a.getFullName())) {
            return "Musteri";
        }
        String[] parts = a.getFullName().trim().split("\\s+");
        return parts.length > 0 ? parts[0] : a.getFullName();
    }

    private String extractSurname(Address a) {
        if (a == null || !StringUtils.hasText(a.getFullName())) {
            return "Soyad";
        }
        String[] parts = a.getFullName().trim().split("\\s+");
        return parts.length > 1 ? parts[parts.length - 1] : "Soyad";
    }

    private String safe(String v) {
        return v == null ? "" : v;
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUser().getId());
        dto.setUserEmail(order.getUser().getEmail());
        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setShippingCost(order.getShippingCost());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setPaymentId(order.getPaymentId());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setBillingAddress(order.getBillingAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setItems(order.getItems().stream().map(it -> {
                    OrderItemDto itemDto = new OrderItemDto();
                    itemDto.setId(it.getId());
                    itemDto.setProductId(it.getProduct().getId());
                    itemDto.setProductName(it.getProduct().getName());
                    itemDto.setQuantity(it.getQuantity());
                    itemDto.setUnitPrice(it.getUnitPrice());
                    itemDto.setTotalPrice(it.getTotalPrice());

                    // Variant bilgilerini ekle
                    Long variantId = it.getProductVariantId();
                    if (variantId != null) {
                        ProductVariant variant = productVariantRepository.findById(variantId)
                                .orElse(null);
                        if (variant != null) {
                            itemDto.setVariantId(variant.getId());
                            itemDto.setVariantName(variant.getName());
                            itemDto.setSize(variant.getSize());
                            itemDto.setColor(variant.getColor());
                        }
                    }

                    return itemDto;
                }).toList());
        return dto;
    }
}
