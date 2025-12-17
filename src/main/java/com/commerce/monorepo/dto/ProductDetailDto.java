package com.commerce.monorepo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductDetailDto(
    Long id,
    String name,
    String slug,
    String description,
    String shortDescription,
    BigDecimal price,
    BigDecimal comparePrice,
    Integer stock,
    String sku,
    Boolean isActive,
    Boolean isFeatured,
    Boolean allowReviews,
    Long categoryId,
    String categoryName,
    List<ProductImageDto> images,
    List<ProductVariantDto> variants,
    Double averageRating,
    Integer totalReviews,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    String fitType,
    String fabricComposition,
    String careInstructions,
    String modelInfo,
    String sizeGuide,
    String material,
    String season,
    String originCountry,
    String gender,
    String ageGroup
) {}

