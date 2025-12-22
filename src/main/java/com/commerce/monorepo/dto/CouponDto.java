package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDto {
    private Long id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumOrderAmount;
    private BigDecimal maximumDiscountAmount;
    private Integer usageLimit;
    private Integer usageLimitPerUser;
    private Integer usedCount;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private Boolean firstOrderOnly;
    private Boolean isActive;
    private Boolean isValid;
    private LocalDateTime createdAt;
}

