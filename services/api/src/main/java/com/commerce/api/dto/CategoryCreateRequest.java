package com.commerce.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryCreateRequest(
    @NotBlank String name,
    @NotBlank String slug,
    String description,
    Long parentId,
    String imageUrl,
    Integer displayOrder
) {}

