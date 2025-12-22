package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    // ========== ADMIN METHODS ==========

    /**
     * Yeni kupon oluştur (Admin)
     */
    public CouponDto createCoupon(CouponCreateRequest request) {
        // Kod benzersizlik kontrolü
        if (couponRepository.existsByCode(request.code().toUpperCase())) {
            throw new BaseException(ErrorCode.COUPON_CODE_EXISTS);
        }

        // FREE_SHIPPING için discountValue 0 olabilir, diğerleri için > 0 olmalı
        if (request.discountType() != DiscountType.FREE_SHIPPING && 
            (request.discountValue() == null || request.discountValue().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR, "İndirim değeri 0'dan büyük olmalı");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(request.code().toUpperCase());
        coupon.setDescription(request.description());
        coupon.setDiscountType(request.discountType());
        // FREE_SHIPPING için discountValue null ise 0 olarak ayarla
        coupon.setDiscountValue(request.discountType() == DiscountType.FREE_SHIPPING && 
            (request.discountValue() == null || request.discountValue().compareTo(BigDecimal.ZERO) == 0) 
            ? BigDecimal.ZERO : request.discountValue());
        coupon.setMinimumOrderAmount(request.minimumOrderAmount());
        coupon.setMaximumDiscountAmount(request.maximumDiscountAmount());
        coupon.setUsageLimit(request.usageLimit());
        coupon.setUsageLimitPerUser(request.usageLimitPerUser());
        coupon.setStartsAt(request.startsAt());
        coupon.setExpiresAt(request.expiresAt());
        coupon.setFirstOrderOnly(request.firstOrderOnly());
        coupon.setIsActive(true);
        coupon.setUsedCount(0);

        // Array alanları
        if (request.applicableCategoryIds() != null && !request.applicableCategoryIds().isEmpty()) {
            coupon.setApplicableCategoryIds(request.applicableCategoryIds().toArray(new Long[0]));
        }
        if (request.applicableProductIds() != null && !request.applicableProductIds().isEmpty()) {
            coupon.setApplicableProductIds(request.applicableProductIds().toArray(new Long[0]));
        }
        if (request.excludedProductIds() != null && !request.excludedProductIds().isEmpty()) {
            coupon.setExcludedProductIds(request.excludedProductIds().toArray(new Long[0]));
        }

        coupon = couponRepository.save(coupon);
        log.info("Coupon created: {}", coupon.getCode());
        
        return mapToDto(coupon);
    }

    /**
     * Kuponu güncelle (Admin)
     */
    public CouponDto updateCoupon(Long id, CouponUpdateRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.COUPON_NOT_FOUND));

        if (request.description() != null) coupon.setDescription(request.description());
        if (request.discountType() != null) coupon.setDiscountType(request.discountType());
        if (request.discountValue() != null) coupon.setDiscountValue(request.discountValue());
        if (request.minimumOrderAmount() != null) coupon.setMinimumOrderAmount(request.minimumOrderAmount());
        if (request.maximumDiscountAmount() != null) coupon.setMaximumDiscountAmount(request.maximumDiscountAmount());
        if (request.usageLimit() != null) coupon.setUsageLimit(request.usageLimit());
        if (request.usageLimitPerUser() != null) coupon.setUsageLimitPerUser(request.usageLimitPerUser());
        if (request.startsAt() != null) coupon.setStartsAt(request.startsAt());
        if (request.expiresAt() != null) coupon.setExpiresAt(request.expiresAt());
        if (request.firstOrderOnly() != null) coupon.setFirstOrderOnly(request.firstOrderOnly());
        if (request.isActive() != null) coupon.setIsActive(request.isActive());

        // Array alanları
        if (request.applicableCategoryIds() != null) {
            coupon.setApplicableCategoryIds(request.applicableCategoryIds().isEmpty() ? null : 
                    request.applicableCategoryIds().toArray(new Long[0]));
        }
        if (request.applicableProductIds() != null) {
            coupon.setApplicableProductIds(request.applicableProductIds().isEmpty() ? null : 
                    request.applicableProductIds().toArray(new Long[0]));
        }
        if (request.excludedProductIds() != null) {
            coupon.setExcludedProductIds(request.excludedProductIds().isEmpty() ? null : 
                    request.excludedProductIds().toArray(new Long[0]));
        }

        coupon = couponRepository.save(coupon);
        log.info("Coupon updated: {}", coupon.getCode());
        
        return mapToDto(coupon);
    }

    /**
     * Kuponu sil (Admin)
     */
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.COUPON_NOT_FOUND));
        
        couponRepository.delete(coupon);
        log.info("Coupon deleted: {}", coupon.getCode());
    }

    /**
     * Kuponu deaktif et (Admin)
     */
    public CouponDto deactivateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.COUPON_NOT_FOUND));
        
        coupon.setIsActive(false);
        coupon = couponRepository.save(coupon);
        log.info("Coupon deactivated: {}", coupon.getCode());
        
        return mapToDto(coupon);
    }

    /**
     * Tüm kuponları listele (Admin)
     */
    @Transactional(readOnly = true)
    public Page<CouponDto> getAllCoupons(Pageable pageable) {
        return couponRepository.findAll(pageable).map(this::mapToDto);
    }

    /**
     * Kupon detayı (Admin)
     */
    @Transactional(readOnly = true)
    public CouponDto getCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.COUPON_NOT_FOUND));
        return mapToDto(coupon);
    }

    // ========== USER METHODS ==========

    /**
     * Kupon kodu ile kupon bilgisi al (Public)
     */
    @Transactional(readOnly = true)
    public CouponDto getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code.toUpperCase())
                .orElseThrow(() -> new BaseException(ErrorCode.COUPON_NOT_FOUND));
        return mapToDto(coupon);
    }

    /**
     * Kuponu sepete uygula
     */
    public ApplyCouponResponse applyCouponToCart(ApplyCouponRequest request) {
        User user = getCurrentUser();
        
        // Kuponu bul
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(request.code().toUpperCase())
                .orElseThrow(() -> new BaseException(ErrorCode.COUPON_NOT_FOUND));

        // Kullanıcının sepetini bul
        Cart cart = cartRepository.findByUserIdAndStatus(user.getId(), CartStatus.ACTIVE)
                .orElseThrow(() -> new BaseException(ErrorCode.CART_NOT_FOUND));

        // Sepet toplamını hesapla
        BigDecimal cartTotal = calculateCartTotal(cart);

        // Kupon validasyonları
        validateCoupon(coupon, user, cartTotal);

        // İndirim hesapla
        BigDecimal discountAmount = calculateDiscount(coupon, cartTotal);

        // Yeni toplam
        BigDecimal newTotal = cartTotal.subtract(discountAmount);
        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            newTotal = BigDecimal.ZERO;
        }

        log.info("Coupon {} applied to cart. Discount: {}", coupon.getCode(), discountAmount);

        return ApplyCouponResponse.builder()
                .success(true)
                .message("Kupon başarıyla uygulandı")
                .couponCode(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountAmount(discountAmount)
                .originalTotal(cartTotal)
                .newTotal(newTotal)
                .build();
    }

    /**
     * Kuponu siparişe uygula (Order creation sırasında çağrılır)
     */
    public BigDecimal applyCouponToOrder(Order order, String couponCode) {
        if (couponCode == null || couponCode.isBlank()) {
            return BigDecimal.ZERO;
        }

        User user = order.getUser();
        
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(couponCode.toUpperCase())
                .orElseThrow(() -> new BaseException(ErrorCode.COUPON_NOT_FOUND));

        // Validasyonlar
        validateCoupon(coupon, user, order.getSubtotal());

        // İndirim hesapla
        BigDecimal discountAmount = calculateDiscount(coupon, order.getSubtotal());

        // Order'a kupon bilgilerini ekle
        order.setCoupon(coupon);
        order.setCouponCode(coupon.getCode());
        order.setDiscountAmount(discountAmount);

        // Kupon kullanımını kaydet
        CouponUsage usage = new CouponUsage();
        usage.setCoupon(coupon);
        usage.setUser(user);
        usage.setOrder(order);
        usage.setDiscountAmount(discountAmount);
        usage.setUsedAt(LocalDateTime.now());
        couponUsageRepository.save(usage);

        // Kupon kullanım sayısını artır
        coupon.incrementUsedCount();
        couponRepository.save(coupon);

        log.info("Coupon {} applied to order {}. Discount: {}", 
            coupon.getCode(), order.getOrderNumber(), discountAmount);

        return discountAmount;
    }

    /**
     * Geçerli kuponları listele (Public)
     */
    @Transactional(readOnly = true)
    public List<CouponDto> getValidCoupons() {
        return couponRepository.findValidCoupons(LocalDateTime.now())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ========== HELPER METHODS ==========

    private void validateCoupon(Coupon coupon, User user, BigDecimal orderTotal) {
        // Kupon geçerli mi?
        if (!coupon.isValid()) {
            if (coupon.isExpired()) {
                throw new BaseException(ErrorCode.COUPON_EXPIRED);
            }
            if (coupon.isUsageLimitReached()) {
                throw new BaseException(ErrorCode.COUPON_USAGE_LIMIT_REACHED);
            }
            throw new BaseException(ErrorCode.COUPON_INVALID);
        }

        // Minimum sipariş tutarı kontrolü
        if (coupon.getMinimumOrderAmount() != null && 
            orderTotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new BaseException(ErrorCode.COUPON_MINIMUM_NOT_MET,
                "Minimum sipariş tutarı: " + coupon.getMinimumOrderAmount() + " TL");
        }

        // Kullanıcı başına limit kontrolü
        if (coupon.getUsageLimitPerUser() != null) {
            int userUsageCount = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), user.getId());
            if (userUsageCount >= coupon.getUsageLimitPerUser()) {
                throw new BaseException(ErrorCode.COUPON_USER_LIMIT_REACHED);
            }
        }

        // İlk sipariş kontrolü
        if (Boolean.TRUE.equals(coupon.getFirstOrderOnly())) {
            long userOrderCount = orderRepository.countByUserId(user.getId());
            if (userOrderCount > 0) {
                throw new BaseException(ErrorCode.COUPON_FIRST_ORDER_ONLY);
            }
        }
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderTotal) {
        BigDecimal discount;

        switch (coupon.getDiscountType()) {
            case PERCENTAGE:
                discount = orderTotal.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                // Maximum indirim limiti
                if (coupon.getMaximumDiscountAmount() != null && 
                    discount.compareTo(coupon.getMaximumDiscountAmount()) > 0) {
                    discount = coupon.getMaximumDiscountAmount();
                }
                break;
                
            case FIXED_AMOUNT:
                discount = coupon.getDiscountValue();
                // İndirim sipariş tutarından fazla olamaz
                if (discount.compareTo(orderTotal) > 0) {
                    discount = orderTotal;
                }
                break;
                
            case FREE_SHIPPING:
                // Kargo ücreti sıfırlanır (bu order service'de handle edilecek)
                discount = BigDecimal.ZERO;
                break;
                
            default:
                discount = BigDecimal.ZERO;
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateCartTotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProduct().getPrice();
                    if (item.getProductVariant() != null && item.getProductVariant().getPriceModifier() != null) {
                        price = price.add(item.getProductVariant().getPriceModifier());
                    }
                    return price.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
    }

    private CouponDto mapToDto(Coupon coupon) {
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minimumOrderAmount(coupon.getMinimumOrderAmount())
                .maximumDiscountAmount(coupon.getMaximumDiscountAmount())
                .usageLimit(coupon.getUsageLimit())
                .usageLimitPerUser(coupon.getUsageLimitPerUser())
                .usedCount(coupon.getUsedCount())
                .startsAt(coupon.getStartsAt())
                .expiresAt(coupon.getExpiresAt())
                .firstOrderOnly(coupon.getFirstOrderOnly())
                .isActive(coupon.getIsActive())
                .isValid(coupon.isValid())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}

