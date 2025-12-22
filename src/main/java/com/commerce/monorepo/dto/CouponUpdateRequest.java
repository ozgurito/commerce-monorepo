package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CouponUpdateRequest(
    String description,
    DiscountType discountType,
    
    @DecimalMin(value = "0.01", message = "İndirim değeri 0'dan büyük olmalı")
    BigDecimal discountValue,
    
    @DecimalMin(value = "0", message = "Minimum sipariş tutarı negatif olamaz")
    BigDecimal minimumOrderAmount,
    
    BigDecimal maximumDiscountAmount,
    
    @Min(value = 1, message = "Kullanım limiti en az 1 olmalı")
    Integer usageLimit,
    
    @Min(value = 1, message = "Kullanıcı başına limit en az 1 olmalı")
    Integer usageLimitPerUser,
    
    LocalDateTime startsAt,
    LocalDateTime expiresAt,
    
    List<Long> applicableCategoryIds,
    List<Long> applicableProductIds,
    List<Long> excludedProductIds,
    
    Boolean firstOrderOnly,
    Boolean isActive
) {}

