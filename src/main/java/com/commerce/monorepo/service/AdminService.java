package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.DashboardStatsDto;
import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.dto.OrderItemDto;
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

    public Page<OrderDto> getAllOrders(Pageable pageable) {
        // Sort parametresini ignore et, query'de zaten ORDER BY var
        Pageable pageableWithoutSort = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize()
        );
        return orderRepository.findAllWithUserAndItems(pageableWithoutSort).map(this::mapToDto);
    }

    public Page<OrderDto> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        // Sort parametresini ignore et, query'de zaten ORDER BY var
        Pageable pageableWithoutSort = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize()
        );
        return orderRepository.findByStatusWithUserAndItems(status, pageableWithoutSort).map(this::mapToDto);
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

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUser().getId());
        dto.setUserEmail(order.getUser().getEmail());
        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setShippingCost(order.getShippingCost());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setBillingAddress(order.getBillingAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream()
                .map(item -> new OrderItemDto(
                    item.getId(),
                    item.getProduct() != null ? item.getProduct().getId() : null,
                    item.getProduct() != null ? item.getProduct().getName() : "Silinmiş Ürün",
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getTotalPrice()
                ))
                .collect(Collectors.toList()));
        }
        return dto;
    }
}

