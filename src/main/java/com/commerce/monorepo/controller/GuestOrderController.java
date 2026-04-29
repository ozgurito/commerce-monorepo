package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.CreateOrderRequest;
import com.commerce.monorepo.dto.GuestOrderRequest;
import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.entity.UserRole;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/guest")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Guest Orders", description = "Misafir sipariş işlemleri (giriş gerektirmez)")
public class GuestOrderController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @PostMapping
    @Operation(
        summary = "Misafir sipariş oluştur",
        description = "Kayıt olmadan e-posta adresiyle sipariş oluşturur. Aynı email ile tekrar sipariş verildiğinde mevcut guest kullanıcı yeniden kullanılır."
    )
    public ResponseEntity<OrderDto> createGuestOrder(@Valid @RequestBody GuestOrderRequest request) {
        // Aynı guestEmail ile daha önce sipariş verilmişse o guest user'ı yeniden kullan
        User guestUser = userRepository
                .findByGuestEmailAndIsGuestTrue(request.getGuestEmail().trim().toLowerCase())
                .orElseGet(() -> createGuestUser(request.getGuestEmail()));

        // GuestOrderRequest → CreateOrderRequest dönüşümü
        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setItems(request.getItems());
        orderRequest.setShippingAddress(request.getShippingAddress());
        orderRequest.setBillingAddress(request.getBillingAddress());
        orderRequest.setNotes(request.getNotes());
        orderRequest.setCouponCode(request.getCouponCode());
        orderRequest.setPaymentMethod(request.getPaymentMethod());

        OrderDto orderDto = orderService.createOrderForUser(guestUser, orderRequest);
        log.info("Misafir sipariş oluşturuldu: {} — email: {}", orderDto.getOrderNumber(), request.getGuestEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(orderDto);
    }

    @GetMapping("/{orderNumber}")
    @Operation(
        summary = "Misafir sipariş sorgula",
        description = "Sipariş numarası ile misafir siparişin durumunu sorgular"
    )
    public ResponseEntity<OrderDto> getGuestOrder(@PathVariable String orderNumber) {
        var order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        // Sadece misafir siparişleri bu endpoint'ten görülebilir
        if (order.getUser() == null || !Boolean.TRUE.equals(order.getUser().getIsGuest())) {
            throw new BaseException(ErrorCode.ORDER_FORBIDDEN);
        }

        return ResponseEntity.ok(orderService.mapToDtoPublic(order));
    }

    private User createGuestUser(String guestEmail) {
        User user = new User();
        user.setEmail(null);
        user.setPassword(null);
        user.setFullName("Misafir");
        user.setGuestEmail(guestEmail.trim().toLowerCase());
        user.setIsGuest(true);
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }
}
