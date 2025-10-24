package com.commerce.api.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ProductDto(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer stock,
        OffsetDateTime createdAt
) {}
