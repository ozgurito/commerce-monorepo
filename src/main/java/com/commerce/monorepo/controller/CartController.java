package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.AddToCartRequest;
import com.commerce.monorepo.dto.CartDto;
import com.commerce.monorepo.dto.UpdateCartItemRequest;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @RateLimit(key = "cart:get", limit = 30, windowSeconds = 60, perUser = true)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDto> getMyCart() {
        CartDto cart = cartService.getMyCart();
        return ResponseEntity.ok(cart);
    }

    @RateLimit(key = "cart:add", limit = 10, windowSeconds = 60, perUser = true)
    @PostMapping("/items")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDto> addToCart(@Valid @RequestBody AddToCartRequest request) {
        CartDto cart = cartService.addToCart(request);
        return ResponseEntity.ok(cart);
    }

    @RateLimit(key = "cart:update", limit = 20, windowSeconds = 60, perUser = true)
    @PutMapping("/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDto> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        CartDto cart = cartService.updateCartItem(itemId, request);
        return ResponseEntity.ok(cart);
    }

    @RateLimit(key = "cart:remove", limit = 15, windowSeconds = 60, perUser = true)
    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDto> removeFromCart(@PathVariable Long itemId) {
        CartDto cart = cartService.removeFromCart(itemId);
        return ResponseEntity.ok(cart);
    }

    @RateLimit(key = "cart:clear", limit = 5, windowSeconds = 60, perUser = true)
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
