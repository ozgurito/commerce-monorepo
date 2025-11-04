package com.commerce.api.dto;

import java.math.BigDecimal;

public record CustomDesignUpdateRequest(
    String designName,
    String designData,
    String thumbnailUrl,
    String[] previewImages,
    Integer quantity,
    String size,
    String color
) {}

