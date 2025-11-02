package com.commerce.api.dto;

import java.time.LocalDateTime;

public record CategoryDto(
    Long id,
    String name,
    String slug,
    String description,
    Long parentId,
    String imageUrl,
    Integer displayOrder,
    Boolean isActive,
    LocalDateTime createdAt
) {}

