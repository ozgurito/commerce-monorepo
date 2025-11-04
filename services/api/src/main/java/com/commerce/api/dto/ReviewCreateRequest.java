package com.commerce.api.dto;

import jakarta.validation.constraints.*;

public record ReviewCreateRequest(
    @NotNull Long productId,
    @NotNull @Min(1) @Max(5) Integer rating,
    @NotBlank @Size(max = 200) String title,
    @NotBlank String comment,
    String[] images
) {}

