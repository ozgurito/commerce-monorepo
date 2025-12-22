package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);
    
    Optional<Coupon> findByCodeAndIsActiveTrue(String code);
    
    boolean existsByCode(String code);
    
    Page<Coupon> findByIsActiveTrue(Pageable pageable);
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
           "AND (c.startsAt IS NULL OR c.startsAt <= :now) " +
           "AND (c.expiresAt IS NULL OR c.expiresAt > :now) " +
           "AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    List<Coupon> findValidCoupons(@Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
           "AND c.expiresAt IS NOT NULL AND c.expiresAt < :now")
    List<Coupon> findExpiredCoupons(@Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Coupon c WHERE c.code LIKE %:keyword% OR c.description LIKE %:keyword%")
    Page<Coupon> searchCoupons(@Param("keyword") String keyword, Pageable pageable);
}

