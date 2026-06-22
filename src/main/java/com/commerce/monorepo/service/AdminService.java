package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.AssignTrackingRequest;
import com.commerce.monorepo.dto.DashboardStatsDto;
import com.commerce.monorepo.dto.MonthlyStatDto;
import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.entity.Order;
import com.commerce.monorepo.entity.OrderStatus;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.ReviewRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final OrderService orderService;

    public Page<OrderDto> getAllOrders(Pageable pageable) {
        // Sort parametresini ignore et, query'de zaten ORDER BY var
        Pageable pageableWithoutSort = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize()
        );
        return orderRepository.findAllWithUserAndItems(pageableWithoutSort)
                .map(orderService::mapToDtoPublic);
    }

    public Page<OrderDto> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        Pageable pageableWithoutSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        return orderRepository.findByStatusWithUserAndItems(status, pageableWithoutSort)
                .map(orderService::mapToDtoPublic);
    }

    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));
        return orderService.mapToDtoPublic(order);
    }

    @Transactional
    public OrderDto assignTracking(Long orderId, AssignTrackingRequest request) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));
        order.setTrackingNumber(request.trackingNumber().trim());
        order.setShippingCarrier(request.carrier().trim().toUpperCase());
        orderRepository.save(order);
        log.info("Tracking assigned to order {}: {} / {}", orderId, request.carrier(), request.trackingNumber());
        return orderService.mapToDtoPublic(order);
    }

    public DashboardStatsDto getDashboardStats() {
        try {
            long totalOrders = orderRepository.count();
            long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
            long processingOrders = orderRepository.countByStatus(OrderStatus.PROCESSING);
            long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
            
            long totalProducts = productRepository.count();
            long activeProducts = productRepository.countByIsActiveTrue();
            long lowStockProducts = productRepository.findLowStockProducts().size();
            
            long totalUsers = userRepository.count();
            long totalReviews = reviewRepository.count();
            long pendingReviews = reviewRepository.countByIsApprovedFalse();
            
            BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
            if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
            
            BigDecimal averageOrderValue = BigDecimal.ZERO;
            if (totalOrders > 0 && totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
            }
            
            return new DashboardStatsDto(
                totalOrders, pendingOrders, processingOrders, completedOrders,
                totalProducts, activeProducts, lowStockProducts,
                totalUsers, totalReviews, pendingReviews,
                totalRevenue, averageOrderValue
            );
        } catch (Exception e) {
            log.error("Dashboard stats error: {}", e.getMessage());
            return DashboardStatsDto.empty();
        }
    }

    public List<MonthlyStatDto> getMonthlyStats() {
        try {
            List<Object[]> rows = orderRepository.findMonthlyStats();
            return rows.stream().map(row -> new MonthlyStatDto(
                ((Number) row[0]).intValue(),
                ((Number) row[1]).intValue(),
                ((Number) row[2]).longValue(),
                new BigDecimal(row[3].toString())
            )).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Monthly stats error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

}

