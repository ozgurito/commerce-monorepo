package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyCouponResponse {
    private boolean success;
    private String message;
    private String couponCode;
    private DiscountType discountType;
    private BigDecimal discountAmount;
    private BigDecimal originalTotal;
    private BigDecimal newTotal;
}

