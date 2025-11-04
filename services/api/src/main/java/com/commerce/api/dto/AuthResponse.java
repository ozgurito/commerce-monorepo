package com.commerce.api.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        Long userId,
        String email,
        String fullName
) {}