package com.commerce.monorepo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Integer availableStock;
    private Long variantId;
    private String variantName;    // "M - Mavi" gibi
    private String size;           // "M", "L", "XL"
    private String color;          // "Mavi", "Kırmızı"
}