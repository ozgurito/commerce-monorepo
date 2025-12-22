package com.commerce.monorepo.dto;

import jakarta.validation.constraints.NotBlank;

public record ApplyCouponRequest(
    @NotBlank(message = "Kupon kodu gerekli")
    String code
) {}

