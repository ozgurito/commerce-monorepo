package com.commerce.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductDto(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        Integer stock,
        LocalDateTime createdAt,
        String sku,
        Boolean isActive,
        Boolean isFeatured,
        Long categoryId,
        String categoryName,
        Double averageRating,
        Integer totalReviews
) {
}