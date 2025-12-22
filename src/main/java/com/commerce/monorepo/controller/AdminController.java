package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.DashboardStatsDto;
import com.commerce.monorepo.dto.LowStockAlertDto;
import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.entity.OrderStatus;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.AdminService;
import com.commerce.monorepo.service.ScheduledTaskService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ScheduledTaskService scheduledTaskService;

    @GetMapping("/orders")
    @RateLimit(key = "admin:orders", limit = 30, windowSeconds = 60)
    public Page<OrderDto> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (status != null) {
            return adminService.getOrdersByStatus(status, pageable);
        }
        return adminService.getAllOrders(pageable);
    }

    @GetMapping("/stats")
    @RateLimit(key = "admin:stats", limit = 20, windowSeconds = 60)
    public DashboardStatsDto getDashboardStats() {
        return adminService.getDashboardStats();
    }

    // ========== SCHEDULED TASKS ==========

    @GetMapping("/alerts/low-stock")
    @Operation(summary = "Düşük stoklu ürünleri listele")
    public ResponseEntity<List<LowStockAlertDto>> getLowStockAlerts() {
        return ResponseEntity.ok(scheduledTaskService.getLowStockAlerts());
    }

    @PostMapping("/tasks/cleanup")
    @Operation(summary = "Tüm temizlik görevlerini çalıştır")
    public ResponseEntity<Map<String, String>> runCleanupTasks() {
        scheduledTaskService.runAllCleanupTasks();
        return ResponseEntity.ok(Map.of("message", "Tüm temizlik görevleri tamamlandı"));
    }

    @PostMapping("/tasks/check-stock")
    @Operation(summary = "Stok kontrolünü manuel çalıştır")
    public ResponseEntity<List<LowStockAlertDto>> runStockCheck() {
        scheduledTaskService.checkLowStockProducts();
        return ResponseEntity.ok(scheduledTaskService.getLowStockAlerts());
    }
}

