package com.commerce.monorepo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", indexes = {
    @Index(name = "idx_coupons_code", columnList = "code"),
    @Index(name = "idx_coupons_active", columnList = "is_active")
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class Coupon extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "minimum_order_amount", precision = 10, scale = 2)
    private BigDecimal minimumOrderAmount = BigDecimal.ZERO;

    @Column(name = "maximum_discount_amount", precision = 10, scale = 2)
    private BigDecimal maximumDiscountAmount;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "usage_limit_per_user")
    private Integer usageLimitPerUser = 1;

    @Column(name = "used_count")
    private Integer usedCount = 0;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "applicable_category_ids", columnDefinition = "BIGINT[]")
    private Long[] applicableCategoryIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "applicable_product_ids", columnDefinition = "BIGINT[]")
    private Long[] applicableProductIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "excluded_product_ids", columnDefinition = "BIGINT[]")
    private Long[] excludedProductIds;

    @Column(name = "first_order_only")
    private Boolean firstOrderOnly = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // ========== HELPER METHODS ==========

    /**
     * Kuponun geçerli olup olmadığını kontrol eder
     */
    public boolean isValid() {
        if (!isActive) return false;
        
        LocalDateTime now = LocalDateTime.now();
        
        // Başlangıç tarihi kontrolü
        if (startsAt != null && now.isBefore(startsAt)) return false;
        
        // Bitiş tarihi kontrolü
        if (expiresAt != null && now.isAfter(expiresAt)) return false;
        
        // Kullanım limiti kontrolü
        if (usageLimit != null && usedCount >= usageLimit) return false;
        
        return true;
    }

    /**
     * Kuponun süresi dolmuş mu?
     */
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Kullanım limiti dolmuş mu?
     */
    public boolean isUsageLimitReached() {
        return usageLimit != null && usedCount >= usageLimit;
    }

    /**
     * Kullanım sayısını artır
     */
    public void incrementUsedCount() {
        this.usedCount = (this.usedCount == null ? 0 : this.usedCount) + 1;
    }
}

