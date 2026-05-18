package com.commerce.monorepo.dto;

import java.math.BigDecimal;

public record MonthlyStatDto(
    int year,
    int month,
    long orderCount,
    BigDecimal revenue
) {}
