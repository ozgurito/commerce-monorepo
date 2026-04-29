package com.commerce.monorepo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductVariantCreateRequest(
        @NotBlank String name,
        @NotBlank String variantType,
        String size,
        String color,
        String colorHex,
        String sku,
        BigDecimal priceModifier,
        @NotNull @Min(0) Integer stock
) {}
