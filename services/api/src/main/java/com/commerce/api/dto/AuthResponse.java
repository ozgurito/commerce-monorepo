package com.commerce.api.dto;

public record AuthResponse(
        String token,
        Long userId,
        String email,
        String fullName
) {}