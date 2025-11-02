package com.commerce.api.dto;

import java.math.BigDecimal;

public record DesignCreditDto(
    Long id,
    Long userId,
    Integer currentBalance,
    Integer totalEarned,
    Integer totalUsed,
    String membershipTier,
    BigDecimal tierDiscountPercentage
) {}

