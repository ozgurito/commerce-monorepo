package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.DiscountType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CouponCreateRequest(
    @NotBlank(message = "Kupon kodu gerekli")
    @Size(min = 3, max = 50, message = "Kupon kodu 3-50 karakter olmalı")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Kupon kodu sadece büyük harf ve rakam içerebilir")
    String code,
    
    String description,
    
    @NotNull(message = "İndirim tipi gerekli")
    DiscountType discountType,
    
    @NotNull(message = "İndirim değeri gerekli")
    @DecimalMin(value = "0", message = "İndirim değeri negatif olamaz")
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
    
    Boolean firstOrderOnly
) {
    public CouponCreateRequest {
        if (minimumOrderAmount == null) minimumOrderAmount = BigDecimal.ZERO;
        if (usageLimitPerUser == null) usageLimitPerUser = 1;
        if (firstOrderOnly == null) firstOrderOnly = false;
        if (startsAt == null) startsAt = LocalDateTime.now();
    }
}

