package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.WishlistItemDto;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * Favorilerimi listele
     */
    @GetMapping
    @RateLimit(key = "wishlist:list", limit = 30, windowSeconds = 60)
    public Page<WishlistItemDto> getMyWishlist(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        return wishlistService.getMyWishlist(pageable);
    }

    /**
     * Favorilere ekle
     */
    @PostMapping("/{productId}")
    @RateLimit(key = "wishlist:add", limit = 30, windowSeconds = 60)
    public WishlistItemDto addToWishlist(@PathVariable Long productId) {
        return wishlistService.addToWishlist(productId);
    }

    /**
     * Favorilerden çıkar
     */
    @DeleteMapping("/{productId}")
    @RateLimit(key = "wishlist:remove", limit = 30, windowSeconds = 60)
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId) {
        wishlistService.removeFromWishlist(productId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Ürün favorilerde mi?
     */
    @GetMapping("/check/{productId}")
    @RateLimit(key = "wishlist:check", limit = 60, windowSeconds = 60)
    public Map<String, Boolean> isInWishlist(@PathVariable Long productId) {
        return Map.of("inWishlist", wishlistService.isInWishlist(productId));
    }

    /**
     * Favori sayısı
     */
    @GetMapping("/count")
    @RateLimit(key = "wishlist:count", limit = 60, windowSeconds = 60)
    public Map<String, Long> getWishlistCount() {
        return Map.of("count", wishlistService.getWishlistCount());
    }
}

