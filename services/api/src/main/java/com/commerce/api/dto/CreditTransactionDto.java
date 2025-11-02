package com.commerce.api.dto;

import java.time.LocalDateTime;

public record CreditTransactionDto(
    Long id,
    Integer amount,
    String type,
    String description,
    Integer balanceAfter,
    LocalDateTime createdAt
) {}

