package com.commerce.monorepo.controller;

import com.commerce.monorepo.entity.OrderStatus;
import com.commerce.monorepo.dto.CreateOrderRequest;
import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.service.InvoiceService;
import com.commerce.monorepo.service.OrderService;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

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
    @Operation(summary = "List my orders", description = "Get paginated list of orders for the current user")
    public ResponseEntity<Page<OrderDto>> listMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        // Validation
        if (page < 0) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR, "Page number must be >= 0");
        }
        if (size < 1) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR, "Page size must be >= 1");
        }
        if (size > 100) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR, "Page size must be <= 100");
        }
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        Page<OrderDto> orders = orderService.listMyOrders(pageable);
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

    @GetMapping("/{id}/invoice")
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "order:invoice", limit = 10, windowSeconds = 60)
    public ResponseEntity<byte[]> getInvoice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = orderService.getUserIdByEmail(userDetails.getUsername());
        byte[] pdf = invoiceService.generateInvoiceForUser(id, userId);
        OrderDto order = orderService.getOrder(id);
        String filename = "fatura-" + order.getOrderNumber() + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(pdf);
    }
}
