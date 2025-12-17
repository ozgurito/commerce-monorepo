// src/main/java/com/commerce/api/dto/UserDto.java
package com.commerce.monorepo.dto;

import java.time.OffsetDateTime;

public record UserDto(
        Long id,
        String email,
        String fullName,
        String phone,
        String role,
        OffsetDateTime createdAt
) {}