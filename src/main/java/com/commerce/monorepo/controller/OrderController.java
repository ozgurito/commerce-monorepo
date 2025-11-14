package com.commerce.monorepo.controller;

import com.commerce.monorepo.entity.OrderStatus;
import com.commerce.monorepo.dto.CreateOrderRequest;
import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.service.OrderService;
import com.commerce.monorepo.ratelimit.RateLimit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "order:create", limit = 3, windowSeconds = 60)
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createOrder(request);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "order:list", limit = 20, windowSeconds = 60)
    public ResponseEntity<List<OrderDto>> listMyOrders() {
        List<OrderDto> orders = orderService.listMyOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "order:get", limit = 15, windowSeconds = 60)
    public ResponseEntity<OrderDto> getOrder(@PathVariable Long id) {
        OrderDto order = orderService.getOrder(id);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "order:admin:update-status", limit = 20, windowSeconds = 60)
    public ResponseEntity<OrderDto> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        OrderDto order = orderService.updateStatus(id, status);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "order:cancel", limit = 5, windowSeconds = 60)
    public ResponseEntity<OrderDto> cancelOrder(@PathVariable Long id) {
        OrderDto order = orderService.cancelOrder(id);
        return ResponseEntity.ok(order);
    }
}
