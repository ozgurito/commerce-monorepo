package com.commerce.monorepo.dto;

public record RefreshTokenResponse(
        String token,
        String refreshToken,
        String role
) {
}
