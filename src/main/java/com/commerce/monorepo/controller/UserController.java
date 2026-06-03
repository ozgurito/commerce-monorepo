package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.ChangePasswordRequest;
import com.commerce.monorepo.dto.CreateUserRequest;
import com.commerce.monorepo.dto.UpdateProfileRequest;
import com.commerce.monorepo.dto.UserDto;
import com.commerce.monorepo.service.UserService;
import com.commerce.monorepo.ratelimit.RateLimit;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "users:list", limit = 30, windowSeconds = 60)
    public Page<UserDto> list(@PageableDefault(size = 20) Pageable pageable) {
        return userService.findAllPaged(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "users:get", limit = 40, windowSeconds = 60)
    public UserDto getById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "users:create", limit = 10, windowSeconds = 300)
    public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUserRequest request) {
        UserDto created = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ─── Admin işlemleri ──────────────────────────────────────

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "users:toggle", limit = 20, windowSeconds = 60)
    public UserDto toggleActive(@PathVariable Long id) {
        return userService.toggleActive(id);
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "users:role", limit = 10, windowSeconds = 60)
    public UserDto changeRole(@PathVariable Long id, @RequestParam String role) {
        return userService.changeRole(id, role);
    }

    @PatchMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "users:unlock", limit = 20, windowSeconds = 60)
    public UserDto unlockAccount(@PathVariable Long id) {
        return userService.unlockAccount(id);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "users:me", limit = 30, windowSeconds = 60)
    public UserDto getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByEmail(email);
    }

    @GetMapping("/me/welcome-coupon")
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "users:welcome-coupon", limit = 10, windowSeconds = 60)
    public java.util.Map<String, Object> getWelcomeCoupon() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getWelcomeCouponEligibility(email);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "users:update", limit = 10, windowSeconds = 60)
    public UserDto updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.updateProfile(email, request);
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "users:password", limit = 3, windowSeconds = 300)
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.changePassword(email, request);
        return ResponseEntity.noContent().build();
    }
}
