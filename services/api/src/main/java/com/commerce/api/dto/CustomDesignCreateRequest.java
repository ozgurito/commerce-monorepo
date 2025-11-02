package com.commerce.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CustomDesignCreateRequest(
    @NotBlank String designName,
    @NotBlank String productType,
    Long baseProductId,
    @NotBlank String designData,
    String thumbnailUrl,
    String[] previewImages,
    @NotNull @Min(1) Integer quantity,
    @NotNull @DecimalMin("0.00") BigDecimal unitPrice,
    String size,
    String color
) {}

