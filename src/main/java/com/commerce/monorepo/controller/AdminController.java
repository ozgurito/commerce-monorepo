package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.DashboardStatsDto;
import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.entity.OrderStatus;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
}

