package com.commerce.monorepo.scheduler;

import com.commerce.monorepo.service.OrderCleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Paket 6 — Pending Payment Cleanup scheduled runner.
 *
 * Belirli aralıklarla (varsayılan 5 dakika, order.cleanup.fixed-delay-ms ile yapılandırılır)
 * OrderCleanupService.cleanupExpiredPendingOrders() çağrılır.
 *
 * order.cleanup.enabled=false ile tamamen devre dışı bırakılabilir (bean hiç oluşturulmaz).
 *
 * Not: @EnableScheduling zaten config/SchedulingConfig.java içinde mevcut — burada tekrar eklenmedi.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "order.cleanup.enabled", havingValue = "true", matchIfMissing = true)
public class OrderCleanupScheduler {

    private final OrderCleanupService orderCleanupService;

    @Scheduled(fixedDelayString = "${order.cleanup.fixed-delay-ms:300000}")
    public void cleanupExpiredPendingOrders() {
        try {
            int cleaned = orderCleanupService.cleanupExpiredPendingOrders();
            if (cleaned > 0) {
                log.info("Expired pending order cleanup completed. cleaned={}", cleaned);
            }
            // cleaned == 0 ise bilinçli olarak log basılmıyor — prod loglarını kirletmemek için
        } catch (Exception e) {
            log.error("Expired pending order cleanup failed", e);
        }
    }
}
