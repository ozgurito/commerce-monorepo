package com.commerce.monorepo.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductUpdateRequest(
        String name,
        String description,
        @DecimalMin(value = "0.00") BigDecimal price,
        @Min(0) Integer stock,
        String sku,
        Long categoryId,
        Boolean isActive,
        Boolean isFeatured,
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
