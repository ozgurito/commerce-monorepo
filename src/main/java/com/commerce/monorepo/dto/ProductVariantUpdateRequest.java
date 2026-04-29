package com.commerce.monorepo.dto;

import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

public record ProductVariantUpdateRequest(
        String name,
        String size,
        String color,
        String colorHex,
        String sku,
        BigDecimal priceModifier,
        @Min(0) Integer stock,
        Boolean isActive
) {}
