package com.commerce.api.dto;

import com.commerce.api.domain.Address;
import com.commerce.api.domain.OrderStatus;
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
    private Address shippingAddress;
    private Address billingAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}