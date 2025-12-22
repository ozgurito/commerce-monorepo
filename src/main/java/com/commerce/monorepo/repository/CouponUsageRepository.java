package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    List<CouponUsage> findByCouponId(Long couponId);
    
    List<CouponUsage> findByUserId(Long userId);
    
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId AND cu.user.id = :userId")
    int countByCouponIdAndUserId(@Param("couponId") Long couponId, @Param("userId") Long userId);
    
    boolean existsByCouponIdAndUserId(Long couponId, Long userId);
    
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    int countByCouponId(@Param("couponId") Long couponId);
}

