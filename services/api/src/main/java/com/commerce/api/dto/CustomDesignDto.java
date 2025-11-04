package com.commerce.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CustomDesignDto(
    Long id,
    Long userId,
    String designName,
    String productType,
    Long baseProductId,
    String designData,
    String thumbnailUrl,
    String[] previewImages,
    Integer quantity,
    BigDecimal unitPrice,
    BigDecimal totalPrice,
    String size,
    String color,
    String status,
    Integer creditsUsed,
    LocalDateTime createdAt
) {}
