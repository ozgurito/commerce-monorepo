package com.commerce.api.dto;

import com.commerce.api.domain.CartStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    private Long userId;
    private List<CartItemDto> items;
    private CartStatus status;
    private BigDecimal totalAmount;
    private Integer itemCount;
}