package com.commerce.monorepo.dto;

public record ProductImageDto(
    Long id,
    String imageUrl,
    String altText,
    Integer displayOrder,
    Boolean isPrimary
) {}

