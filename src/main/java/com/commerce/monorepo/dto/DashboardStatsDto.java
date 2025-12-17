package com.commerce.monorepo.dto;

import java.math.BigDecimal;

public record DashboardStatsDto(
    Long totalOrders,
    Long pendingOrders,
    Long processingOrders,
    Long completedOrders,
    Long totalProducts,
    Long activeProducts,
    Long lowStockProducts,
    Long totalUsers,
    Long totalReviews,
    Long pendingReviews,
    BigDecimal totalRevenue,
    BigDecimal averageOrderValue
) {
    public static DashboardStatsDto empty() {
        return new DashboardStatsDto(
            0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L,
            BigDecimal.ZERO, BigDecimal.ZERO
        );
    }
}

