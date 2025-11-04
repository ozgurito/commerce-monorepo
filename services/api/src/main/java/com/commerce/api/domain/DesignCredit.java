package com.commerce.api.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "design_credits")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DesignCredit extends BaseEntity {
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "current_balance", nullable = false)
    private Integer currentBalance = 0;
    
    @Column(name = "total_earned", nullable = false)
    private Integer totalEarned = 0;
    
    @Column(name = "total_used", nullable = false)
    private Integer totalUsed = 0;
    
    @Column(name = "total_expired", nullable = false)
    private Integer totalExpired = 0;
    
    @Column(name = "membership_tier", length = 50)
    private String membershipTier = "free";
    
    @Column(name = "tier_discount_percentage", precision = 5, scale = 2)
    private BigDecimal tierDiscountPercentage = BigDecimal.ZERO;
}

