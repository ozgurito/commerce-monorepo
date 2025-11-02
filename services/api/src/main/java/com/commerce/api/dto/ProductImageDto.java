package com.commerce.api.dto;

public record ProductImageDto(
    Long id,
    String imageUrl,
    String altText,
    Integer displayOrder,
    Boolean isPrimary
) {}

