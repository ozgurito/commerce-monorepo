package com.commerce.api.dto;

import java.math.BigDecimal;

public record ProductVariantDto(
    Long id,
    String name,
    String variantType,
    String size,
    String color,
    String colorHex,
    String sku,
    BigDecimal priceModifier,
    Integer stock,
    Boolean isActive
) {}

