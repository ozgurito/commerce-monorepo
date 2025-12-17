package com.commerce.monorepo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private BigDecimal productPrice;
    private String productImageUrl;
    private Boolean inStock;
    private LocalDateTime addedAt;
}

