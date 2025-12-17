package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.ProductVariantRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

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
            if (variant.getStock() == null || variant.getStock() < itemReq.getQuantity()) {
                throw new BaseException(ErrorCode.INSUFFICIENT_STOCK, 
                    String.format("Ürün: %s, Mevcut stok: %d, İstenen: %d", 
                        variant.getProduct().getName(), 
                        variant.getStock() != null ? variant.getStock() : 0, 
                        itemReq.getQuantity()));
            }
            
            // STOK DÜŞÜR (optimistic locking ile)
            int updated = productVariantRepository.decreaseStock(variant.getId(), itemReq.getQuantity());
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
        order.setTax(subtotal.multiply(BigDecimal.valueOf(0.20))); // %20 KDV
        order.setShippingCost(BigDecimal.valueOf(29.99)); // Sabit kargo
        order.setTotal(subtotal.add(order.getTax()).add(order.getShippingCost()));
        
        // Adres bilgileri
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setNotes(request.getNotes());
        
        order = orderRepository.save(order);
        
        // Order'ı items ile birlikte yeniden yükle (variant bilgileri için gerekli)
        order = orderRepository.findByIdWithItems(order.getId())
                .orElse(order);
        
        return mapToDto(order);
    }

    public OrderDto getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BaseException(ErrorCode.ORDER_FORBIDDEN);
        }

        return mapToDto(order);
    }

    public List<OrderDto> listMyOrders() {
        User currentUser = getCurrentUser();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> listMyOrders(Pageable pageable) {
        User currentUser = getCurrentUser();
        return orderRepository.findByUserId(currentUser.getId(), pageable)
                .map(this::mapToDto);
    }

    public OrderDto updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        return mapToDto(orderRepository.save(order));
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
            throw new BaseException(ErrorCode.REVIEWS_NOT_ALLOWED);
        }
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
        dto.setPaymentId(order.getIyzicoPaymentId());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setBillingAddress(order.getBillingAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        dto.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemDto itemDto = new OrderItemDto();
                    itemDto.setId(item.getId());
                    itemDto.setProductId(item.getProduct().getId());
                    itemDto.setProductName(item.getProduct().getName());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setUnitPrice(item.getUnitPrice());
                    itemDto.setTotalPrice(item.getTotalPrice());
                    
                    // Variant bilgilerini ekle
                    if (item.getProductVariantId() != null) {
                        ProductVariant variant = productVariantRepository.findById(item.getProductVariantId())
                                .orElse(null);
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
