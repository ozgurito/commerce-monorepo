package com.commerce.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductUpdateRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 10_000) String description,
        @NotNull @DecimalMin(value = "0.00") BigDecimal price,
        @NotNull @Min(0) Integer stock
) {}
