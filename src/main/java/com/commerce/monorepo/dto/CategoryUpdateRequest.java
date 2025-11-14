package com.commerce.monorepo.dto;

public record CategoryUpdateRequest(
    String name,
    String slug,
    String description,
    String imageUrl,
    Integer displayOrder,
    Boolean isActive
) {}

