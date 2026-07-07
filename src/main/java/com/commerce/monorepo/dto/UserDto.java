package com.commerce.monorepo.dto;

import java.time.OffsetDateTime;

public record UserDto(
        Long id,
        String email,
        String fullName,
        String phone,
        String role,
        Boolean isActive,
        Boolean emailVerified,
        OffsetDateTime lastLoginAt,
        OffsetDateTime createdAt
) {}