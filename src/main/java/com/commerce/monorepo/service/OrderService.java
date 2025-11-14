package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        // Get current user
        User currentUser = getCurrentUser();

        // Step 1: Validate products and stock (NO SAVES YET - just validation)
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found: " + itemReq.getProductId()
                    ));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for product: " + product.getName() +
                                " (Available: " + product.getStock() + ")"
                );
            }
        }

        // Step 2: Create Order entity (NOT SAVED YET)
        Order order = new Order();
        order.setUser(currentUser);
        order.setOrderNumber(generateUniqueOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setNotes(request.getNotes());

        // Step 3: Create OrderItems and calculate totals
        // IMPORTANT: OrderItem'ları Order'a eklemeden önce tüm field'ları set et
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found: " + itemReq.getProductId()
                    ));

            // Create OrderItem with all required fields
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.calculateTotalPrice();
            
            // CRITICAL: Use helper method to set bidirectional relationship
            // This sets both: items.add(item) AND item.setOrder(this)
            // Order must be set BEFORE saving Order
            order.addItem(orderItem);
            
            subtotal = subtotal.add(orderItem.getTotalPrice());
        }

        // Step 4: Calculate and set totals
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.20")); // 20% VAT
        BigDecimal shippingCost = new BigDecimal("50.00"); // Fixed shipping
        BigDecimal total = subtotal.add(tax).add(shippingCost);

        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setShippingCost(shippingCost);
        order.setTotal(total);

        // Step 5: SAVE ORDER (cascade = CascadeType.ALL will save OrderItems automatically)
        // Use save() instead of saveAndFlush() to let Hibernate manage the cascade properly
        Order savedOrder;
        try {
            savedOrder = orderRepository.save(order);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // If order_number duplicate occurs (extremely rare with UUID), regenerate and retry
            if (e.getMessage() != null && e.getMessage().contains("order_number")) {
                order.setOrderNumber(generateUniqueOrderNumber());
                savedOrder = orderRepository.save(order);
            } else {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Failed to create order: " + e.getMessage()
                );
            }
        }

        // Step 6: Update product stock AFTER Order is saved
        // Now Order and OrderItems are persisted, safe to update stock
        for (OrderItem item : savedOrder.getItems()) {
            Product product = item.getProduct();
            int newStock = product.getStock() - item.getQuantity();
            if (newStock < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for product: " + product.getName()
                );
            }
            product.setStock(newStock);
            productRepository.save(product);
        }
        
        return mapToDto(savedOrder);
    }

    public OrderDto getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"
                ));

        // Check if user owns this order
        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        return mapToDto(order);
    }

    public List<OrderDto> listMyOrders() {
        User currentUser = getCurrentUser();
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public OrderDto updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"
                ));

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return mapToDto(savedOrder);
    }

    public OrderDto cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"
                ));

        // Check if user owns this order
        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        // Can only cancel pending orders
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending orders can be cancelled"
            );
        }

        // Return stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        return mapToDto(savedOrder);
    }

    /**
     * Generates a unique order number with format: ORD-YYYYMMDD-HHMMSS-MMM-UUID
     * Uses timestamp + milliseconds + UUID for guaranteed uniqueness
     * NO DATABASE QUERIES - avoids flush issues
     */
    private String generateUniqueOrderNumber() {
        LocalDateTime now = LocalDateTime.now();
        String timestamp = now.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String millis = String.format("%03d", now.getNano() / 1_000_000);
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        return "ORD-" + timestamp + "-" + millis + "-" + uuid;
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean isValid = switch(current) {
            case PENDING -> next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.PROCESSING || next == OrderStatus.REFUNDED;
            case PROCESSING -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            default -> false;
        };

        if (!isValid) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status transition: " + current + " -> " + next
            );
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"
                ));
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

        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> new OrderItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()
                ))
                .collect(Collectors.toList());
        dto.setItems(itemDtos);

        return dto;
    }
}