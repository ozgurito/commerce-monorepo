package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.LowStockAlertDto;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTaskService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final EmailService emailService;

    @Value("${app.admin.email:admin@yourstore.com}")
    private String adminEmail;

    // ========== TOKEN TEMİZLEME ==========

    /**
     * Süresi dolmuş password reset token'larını temizle
     * Her gün gece 02:00'de çalışır
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupExpiredPasswordResetTokens() {
        log.info("Starting cleanup of expired password reset tokens...");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            int deleted = passwordResetTokenRepository.deleteExpiredTokens(now);
            log.info("Cleaned up {} expired password reset tokens", deleted);
        } catch (Exception e) {
            log.error("Error cleaning up password reset tokens: {}", e.getMessage(), e);
        }
    }

    /**
     * Süresi dolmuş refresh token'larını temizle
     * Her gün gece 02:30'da çalışır
     */
    @Scheduled(cron = "0 30 2 * * *")
    @Transactional
    public void cleanupExpiredRefreshTokens() {
        log.info("Starting cleanup of expired refresh tokens...");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            int deleted = refreshTokenRepository.deleteByExpiryDateBefore(now);
            log.info("Cleaned up {} expired refresh tokens", deleted);
        } catch (Exception e) {
            log.error("Error cleaning up refresh tokens: {}", e.getMessage(), e);
        }
    }

    // ========== STOK UYARILARI ==========

    /**
     * Düşük stoklu ürünleri kontrol et ve admin'e email gönder
     * Her gün sabah 09:00'da çalışır
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void checkLowStockProducts() {
        log.info("Checking for low stock products...");
        
        try {
            List<Product> lowStockProducts = productRepository.findLowStockProductsWithCategory();
            
            if (lowStockProducts.isEmpty()) {
                log.info("No low stock products found");
                return;
            }
            
            log.warn("Found {} products with low stock", lowStockProducts.size());
            
            // Her düşük stoklu ürün için alert gönder
            for (Product product : lowStockProducts) {
                // Email gönder
                emailService.sendLowStockAlertEmail(
                        adminEmail,
                        product.getName(),
                        product.getStock(),
                        product.getLowStockThreshold()
                );
                
                log.warn("Low stock alert: {} - Stock: {}/{}", 
                        product.getName(), 
                        product.getStock(), 
                        product.getLowStockThreshold());
            }
        } catch (Exception e) {
            log.error("Error checking low stock products: {}", e.getMessage(), e);
        }
    }

    /**
     * Stok tükenen ürünleri deaktif et (opsiyonel)
     * Her saat başı çalışır
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void handleOutOfStockProducts() {
        log.debug("Checking for out of stock products...");
        
        // Bu özellik opsiyonel - aktif etmek için uncomment et
        /*
        try {
            List<Product> outOfStock = productRepository.findByStockLessThanEqualAndIsActiveTrue(0);
            
            for (Product product : outOfStock) {
                product.setIsActive(false);
                productRepository.save(product);
                log.info("Deactivated out of stock product: {}", product.getName());
            }
        } catch (Exception e) {
            log.error("Error handling out of stock products: {}", e.getMessage(), e);
        }
        */
    }

    // ========== SEPET TEMİZLEME ==========

    /**
     * 7 günden eski terk edilmiş sepetleri temizle
     * Her gün gece 03:00'da çalışır
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupAbandonedCarts() {
        log.info("Starting cleanup of abandoned carts...");
        
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
            
            // 7 günden eski aktif sepetleri bul
            List<Cart> abandonedCarts = cartRepository.findByStatusAndUpdatedAtBefore(
                    CartStatus.ACTIVE, cutoffDate);
            
            int count = 0;
            for (Cart cart : abandonedCarts) {
                // Sepet öğelerini sil
                List<CartItem> items = cart.getItems();
                if (items != null && !items.isEmpty()) {
                    cartItemRepository.deleteAll(items);
                }
                // Sepet durumunu güncelle
                cart.setStatus(CartStatus.ABANDONED);
                cartRepository.save(cart);
                count++;
            }
            
            log.info("Marked {} abandoned carts", count);
        } catch (Exception e) {
            log.error("Error cleaning up abandoned carts: {}", e.getMessage(), e);
        }
    }

    // ========== KUPON YÖNETİMİ ==========

    /**
     * Süresi dolmuş kuponları deaktif et
     * Her gün gece 00:05'te çalışır
     */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void deactivateExpiredCoupons() {
        log.info("Checking for expired coupons...");
        
        try {
            List<Coupon> expiredCoupons = couponRepository.findExpiredCoupons(LocalDateTime.now());
            
            for (Coupon coupon : expiredCoupons) {
                coupon.setIsActive(false);
                couponRepository.save(coupon);
                log.info("Deactivated expired coupon: {}", coupon.getCode());
            }
            
            if (!expiredCoupons.isEmpty()) {
                log.info("Deactivated {} expired coupons", expiredCoupons.size());
            }
        } catch (Exception e) {
            log.error("Error deactivating expired coupons: {}", e.getMessage(), e);
        }
    }

    // ========== MANUEL TETİKLEME İÇİN PUBLIC METODLAR ==========

    /**
     * Manuel olarak düşük stok kontrolü yap
     */
    @Transactional(readOnly = true)
    public List<LowStockAlertDto> getLowStockAlerts() {
        List<Product> lowStockProducts = productRepository.findLowStockProductsWithCategory();
        
        return lowStockProducts.stream()
                .map(product -> LowStockAlertDto.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .sku(product.getSku())
                        .currentStock(product.getStock())
                        .threshold(product.getLowStockThreshold())
                        .categoryName(product.getCategory() != null ? 
                                product.getCategory().getName() : "Uncategorized")
                        .alertTime(LocalDateTime.now())
                        .build())
                .toList();
    }

    /**
     * Tüm temizlik görevlerini manuel çalıştır
     */
    public void runAllCleanupTasks() {
        log.info("Running all cleanup tasks manually...");
        cleanupExpiredPasswordResetTokens();
        cleanupExpiredRefreshTokens();
        cleanupAbandonedCarts();
        deactivateExpiredCoupons();
        log.info("All cleanup tasks completed");
    }
}

