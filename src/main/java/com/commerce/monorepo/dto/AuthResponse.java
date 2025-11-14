package com.commerce.monorepo.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        Long userId,
        String email,
        String fullName
) {}
