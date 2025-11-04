package com.commerce.api.dto;

public record CategoryUpdateRequest(
    String name,
    String slug,
    String description,
    String imageUrl,
    Integer displayOrder,
    Boolean isActive
) {}

