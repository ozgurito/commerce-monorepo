package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.ProductImageRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.ProductVariantRepository;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.dao.OptimisticLockingFailureException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final CouponService couponService;
    private final ShippingService shippingService;

    /**
     * Authenticated kullanıcı için sipariş oluşturur.
     * Optimistic locking hatası yakalar, kullanıcı dostu mesaj döner.
     */
    @Transactional
    public OrderDto createOrderForUser(User user, CreateOrderRequest request) {
        try {
            return doCreateOrder(user, request);
        } catch (OptimisticLockingFailureException e) {
            throw new BaseException(ErrorCode.INSUFFICIENT_STOCK,
                    "Ürün stoku başka bir kullanıcı tarafından güncellendi. Lütfen tekrar deneyin.");
        }
    }

    /**
     * Güvenlik context'inden kullanıcıyı alarak sipariş oluşturur.
     */
    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        try {
            return doCreateOrder(user, request);
        } catch (OptimisticLockingFailureException e) {
            throw new BaseException(ErrorCode.INSUFFICIENT_STOCK,
                    "Ürün stoku başka bir kullanıcı tarafından güncellendi. Lütfen tekrar deneyin.");
        }
    }

    /**
     * Gerçek sipariş oluşturma mantığı — her iki public metot buraya delege eder.
     */
    private OrderDto doCreateOrder(User user, CreateOrderRequest request) {

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateUniqueOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.WAITING);
        
        // STOK KONTROLÜ VE REZERVASYON
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemRequest itemReq : request.getItems()) {
            // Variant bul
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new BaseException(ErrorCode.VARIANT_NOT_FOUND));
            
            // productId verilmişse, variant'ın bu ürüne ait olduğunu doğrula
            if (itemReq.getProductId() != null && 
                !variant.getProduct().getId().equals(itemReq.getProductId())) {
                throw new BaseException(ErrorCode.VARIANT_NOT_FOUND, 
                    "Variant bu ürüne ait değil");
            }
            
            // STOK KONTROLÜ
            // Variant stoğu 0 veya null ise ürün stoğunu kontrol et (fallback)
            int effectiveStock = (variant.getStock() != null && variant.getStock() > 0)
                    ? variant.getStock()
                    : variant.getProduct().getStock();
            if (effectiveStock < itemReq.getQuantity()) {
                throw new BaseException(ErrorCode.INSUFFICIENT_STOCK,
                    String.format("Ürün: %s, Mevcut stok: %d, İstenen: %d",
                        variant.getProduct().getName(), effectiveStock, itemReq.getQuantity()));
            }

            // STOK DÜŞÜR
            // Variant stoğu gerçekse variant'ı düşür, 0 ise ürün stoğunu düşür
            int updated;
            if (variant.getStock() != null && variant.getStock() > 0) {
                updated = productVariantRepository.decreaseStock(variant.getId(), itemReq.getQuantity());
            } else {
                // Variant stoğu 0 — ürün stoğunu düşür
                variant.getProduct().setStock(variant.getProduct().getStock() - itemReq.getQuantity());
                updated = 1; // manuel güncellendi
            }
            if (updated == 0) {
                throw new BaseException(ErrorCode.INSUFFICIENT_STOCK, 
                    "Stok güncellenemedi, başka bir kullanıcı ürünü satın almış olabilir");
            }
            
            // OrderItem oluştur
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(variant.getProduct());
            orderItem.setProductVariantId(variant.getId());
            orderItem.setQuantity(itemReq.getQuantity());
            
            // Fiyat hesaplama: base price + price modifier
            BigDecimal unitPrice = variant.getProduct().getPrice();
            if (variant.getPriceModifier() != null) {
                unitPrice = unitPrice.add(variant.getPriceModifier());
            }
            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            orderItem.setOrder(order);
            orderItems.add(orderItem);
            
            subtotal = subtotal.add(orderItem.getTotalPrice());
        }
        
        // Order'ı kaydet (cascade ile items da kaydedilecek)
        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setTax(BigDecimal.ZERO); // Fiyatlar KDV dahil — ek hesaplama yok
        
        // Kargo ücreti — ShippingService hesaplar (300₺ üzeri ücretsiz)
        BigDecimal shippingCost = shippingService.calculate(subtotal);
        order.setShippingCost(shippingCost);
        
        // Ödeme yöntemi set et
        if (request.getPaymentMethod() != null) {
            order.setPaymentMethod(request.getPaymentMethod());
        }
        
        // Kupon uygula (varsa)
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discountAmount = couponService.applyCouponToOrder(order, request.getCouponCode());
        }
        order.setDiscountAmount(discountAmount);

        // Not: Kupon kargoyu ETKİLEMEZ. Kargo yalnızca ara toplam (1000₺) kuralına bağlıdır.
        // Eski FREE_SHIPPING kupon → kargo sıfırlama mantığı kaldırıldı (frontend/backend sapması olmasın).

        // Toplam = Subtotal + Tax + Shipping - Discount
        BigDecimal total = subtotal
            .add(order.getTax())
            .add(order.getShippingCost())
            .subtract(discountAmount);
        
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }
        order.setTotal(total);
        
        // Adres bilgileri
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setNotes(request.getNotes());
        
        order = orderRepository.save(order);
        
        // Order'ı items ile birlikte yeniden yükle (variant bilgileri için gerekli)
        order = orderRepository.findByIdWithItems(order.getId())
                .orElse(order);
        
        // Sipariş onay emaili
        emailService.sendOrderConfirmationEmail(order);
        
        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BaseException(ErrorCode.ORDER_FORBIDDEN);
        }

        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> listMyOrders(Pageable pageable) {
        User currentUser = getCurrentUser();
        return orderRepository.findByUserId(currentUser.getId(), pageable)
                .map(this::mapToDto);
    }

    public OrderDto updateStatus(Long orderId, OrderStatus newStatus) {
        // JOIN FETCH ile items + user birlikte yükle — lazy init hatasını önler
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        // user ayrıca lazy — Id üzerinden yeterli
        if (order.getUser() == null) {
            throw new BaseException(ErrorCode.ORDER_NOT_FOUND);
        }

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // DTO'yu transaction içindeyken üret
        OrderDto dto = mapToDto(savedOrder);

        // Async email — DTO'dan türetilmiş değerleri kullan (entity değil)
        emailService.sendOrderStatusUpdateEmail(savedOrder);

        return dto;
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BaseException(ErrorCode.ORDER_FORBIDDEN);
        }
        
        // Sadece PENDING veya PAID durumunda iptal edilebilir
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new BaseException(ErrorCode.ORDER_NOT_CANCELABLE);
        }
        
        // STOK GERİ KOYMA
        for (OrderItem item : order.getItems()) {
            if (item.getProductVariantId() != null) {
                // Variant varsa variant stokunu artır
                productVariantRepository.increaseStock(item.getProductVariantId(), item.getQuantity());
            } else {
                // Variant yoksa product stokunu artır (geriye dönük uyumluluk)
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        
        return mapToDto(order);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean isValid = switch(current) {
            case PENDING -> next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.PROCESSING || next == OrderStatus.REFUNDED;
            case PROCESSING -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            default -> false;
        };

        if (!isValid) {
            throw new BaseException(ErrorCode.ORDER_INVALID_STATUS);
        }
    }

    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND))
                .getId();
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
    }

    private String generateUniqueOrderNumber() {
        LocalDateTime now = LocalDateTime.now();
        String timestamp = now.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String millis = String.format("%03d", now.getNano() / 1_000_000);
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return "ORD-" + timestamp + "-" + millis + "-" + uuid;
    }

    /**
     * Public wrapper — BankTransferPaymentService ve GuestOrderController gibi
     * dış servisler tarafından çağrılabilir.
     */
    public OrderDto mapToDtoPublic(Order order) {
        return mapToDto(order);
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUser().getId());

        // Guest user'larda email null olabilir — guestEmail fallback
        String userEmail = order.getUser().getEmail() != null
                ? order.getUser().getEmail()
                : order.getUser().getGuestEmail();
        dto.setUserEmail(userEmail);

        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setShippingCost(order.getShippingCost());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentId(order.getIyzicoPaymentId());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setBillingAddress(order.getBillingAddress());
        dto.setCouponCode(order.getCouponCode());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setTrackingNumber(order.getTrackingNumber());
        dto.setShippingCarrier(order.getShippingCarrier());

        // N+1 önleme: tüm product ID'leri toplayıp tek sorguda görsel + variant çek
        List<Long> productIds = order.getItems().stream()
                .filter(item -> item.getProduct() != null)
                .map(item -> item.getProduct().getId())
                .collect(Collectors.toList());
        List<Long> variantIds = order.getItems().stream()
                .map(OrderItem::getProductVariantId)
                .filter(id -> id != null)
                .collect(Collectors.toList());

        // productId → birincil görsel URL (repository üzerinden güvenli fetch)
        Map<Long, String> imageMap = new java.util.HashMap<>();
        for (Long pid : productIds) {
            List<ProductImage> imgs = productImageRepository.findByProductIdOrderByDisplayOrder(pid);
            if (!imgs.isEmpty()) {
                imgs.stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .or(() -> imgs.stream().findFirst())
                    .ifPresent(img -> imageMap.put(pid, img.getImageUrl()));
            }
        }

        Map<Long, ProductVariant> variantMap = productVariantRepository.findAllById(variantIds)
                .stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        dto.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemDto itemDto = new OrderItemDto();
                    itemDto.setId(item.getId());
                    Product p = item.getProduct();
                    itemDto.setProductId(p != null ? p.getId() : null);
                    itemDto.setProductName(p != null ? p.getName() : "Silinmiş Ürün");
                    itemDto.setSku(p != null ? p.getSku() : null);
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setUnitPrice(item.getUnitPrice());
                    itemDto.setTotalPrice(item.getTotalPrice());
                    itemDto.setImageUrl(p != null ? imageMap.get(p.getId()) : null);

                    if (item.getProductVariantId() != null) {
                        ProductVariant variant = variantMap.get(item.getProductVariantId());
                        if (variant != null) {
                            itemDto.setVariantId(variant.getId());
                            itemDto.setVariantName(variant.getName());
                            itemDto.setSize(variant.getSize());
                            itemDto.setColor(variant.getColor());
                        }
                    }

                    return itemDto;
                })
                .collect(Collectors.toList()));

        return dto;
    }
}
