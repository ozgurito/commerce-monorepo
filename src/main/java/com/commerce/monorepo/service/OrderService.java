package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        User currentUser = getCurrentUser();

        // Step 1: validate
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new BaseException(ErrorCode.INSUFFICIENT_STOCK);
            }
        }

        // Step 2: Order oluştur
        Order order = new Order();
        order.setUser(currentUser);
        order.setOrderNumber(generateUniqueOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setNotes(request.getNotes());

        // Step 3: OrderItems
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.calculateTotalPrice();

            order.addItem(orderItem);

            subtotal = subtotal.add(orderItem.getTotalPrice());
        }

        // Step 4: totals
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.20"));
        BigDecimal shippingCost = new BigDecimal("50.00");
        BigDecimal total = subtotal.add(tax).add(shippingCost);

        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setShippingCost(shippingCost);
        order.setTotal(total);

        // Step 5: save
        Order savedOrder = orderRepository.save(order);

        // Step 6: update stock
        for (OrderItem item : savedOrder.getItems()) {
            Product product = item.getProduct();
            int newStock = product.getStock() - item.getQuantity();

            if (newStock < 0) {
                throw new BaseException(ErrorCode.INSUFFICIENT_STOCK);
            }

            product.setStock(newStock);
            productRepository.save(product);
        }

        return mapToDto(savedOrder);
    }

    public OrderDto getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BaseException(ErrorCode.ORDER_FORBIDDEN);
        }

        return mapToDto(order);
    }

    public List<OrderDto> listMyOrders() {
        User currentUser = getCurrentUser();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public OrderDto updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        return mapToDto(orderRepository.save(order));
    }

    public OrderDto cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BaseException(ErrorCode.ORDER_FORBIDDEN);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BaseException(ErrorCode.ORDER_NOT_CANCELABLE);
        }

        // stock return
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToDto(orderRepository.save(order));
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
            throw new BaseException(ErrorCode.REVIEWS_NOT_ALLOWED);
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
    }

    private String generateUniqueOrderNumber() {
        LocalDateTime now = LocalDateTime.now();
        String timestamp = now.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String millis = String.format("%03d", now.getNano() / 1_000_000);
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return "ORD-" + timestamp + "-" + millis + "-" + uuid;
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

        dto.setItems(order.getItems().stream()
                .map(item -> new OrderItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()
                ))
                .collect(Collectors.toList()));

        return dto;
    }
}
