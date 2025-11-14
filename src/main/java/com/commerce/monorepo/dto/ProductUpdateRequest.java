package com.commerce.monorepo.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductUpdateRequest(
        String name,
        String description,
        @DecimalMin(value = "0.00") BigDecimal price,
        @Min(0) Integer stock,
        String sku,
        Long categoryId
) {}
