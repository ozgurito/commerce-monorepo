package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.Address;
import com.commerce.monorepo.entity.OrderStatus;
import com.commerce.monorepo.entity.PaymentMethod;
import com.commerce.monorepo.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private List<OrderItemDto> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private BigDecimal total;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String paymentId;
    private Address shippingAddress;
    private Address billingAddress;
    private String couponCode;
    private BigDecimal discountAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String trackingNumber;
    private String shippingCarrier;
}