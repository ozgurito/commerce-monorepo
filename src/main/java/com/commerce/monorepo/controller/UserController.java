package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.CreateUserRequest;
import com.commerce.monorepo.dto.UserDto;
import com.commerce.monorepo.service.UserService;
import com.commerce.monorepo.ratelimit.RateLimit;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @RateLimit(key = "users:list", limit = 30, windowSeconds = 60)
    public List<UserDto> list() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
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
}
