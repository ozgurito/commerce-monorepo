package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Kupon yönetimi API'leri")
public class CouponController {

    private final CouponService couponService;

    // ========== PUBLIC ENDPOINTS ==========

    @GetMapping("/validate/{code}")
    @RateLimit(key = "coupon:validate", limit = 10, windowSeconds = 60)
    @Operation(summary = "Kupon kodunu doğrula", description = "Kupon kodunun geçerli olup olmadığını kontrol eder")
    public ResponseEntity<CouponDto> validateCoupon(@PathVariable String code) {
        return ResponseEntity.ok(couponService.getCouponByCode(code));
    }

    @GetMapping("/valid")
    @RateLimit(key = "coupon:valid", limit = 10, windowSeconds = 60)
    @Operation(summary = "Geçerli kuponları listele", description = "Şu an geçerli olan tüm kuponları listeler")
    public ResponseEntity<List<CouponDto>> getValidCoupons() {
        return ResponseEntity.ok(couponService.getValidCoupons());
    }

    @PostMapping("/apply")
    @RateLimit(key = "coupon:apply", limit = 5, windowSeconds = 60)
    @Operation(summary = "Kuponu sepete uygula", description = "Kupon kodunu sepete uygular ve indirim hesaplar")
    public ResponseEntity<ApplyCouponResponse> applyCoupon(@Valid @RequestBody ApplyCouponRequest request) {
        return ResponseEntity.ok(couponService.applyCouponToCart(request));
    }

    // ========== ADMIN ENDPOINTS ==========

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tüm kuponları listele (Admin)", description = "Sayfalanmış kupon listesi")
    @Parameters({
        @Parameter(name = "page", description = "Sayfa numarası (0'dan başlar)", example = "0"),
        @Parameter(name = "size", description = "Sayfa başına kayıt sayısı", example = "20"),
        @Parameter(name = "sort", description = "Sıralama (örn: createdAt,desc veya id,asc)", example = "createdAt,desc")
    })
    public ResponseEntity<Page<CouponDto>> getAllCoupons(
            @ParameterObject
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(couponService.getAllCoupons(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kupon detayı (Admin)")
    public ResponseEntity<CouponDto> getCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCoupon(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Yeni kupon oluştur (Admin)")
    public ResponseEntity<CouponDto> createCoupon(@Valid @RequestBody CouponCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.createCoupon(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kuponu güncelle (Admin)")
    public ResponseEntity<CouponDto> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponUpdateRequest request) {
        return ResponseEntity.ok(couponService.updateCoupon(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kuponu sil (Admin)")
    public ResponseEntity<Map<String, String>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(Map.of("message", "Kupon silindi"));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kuponu deaktif et (Admin)")
    public ResponseEntity<CouponDto> deactivateCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.deactivateCoupon(id));
    }
}

