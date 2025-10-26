// src/main/java/com/commerce/api/dto/UserDto.java
package com.commerce.api.dto;

import java.time.OffsetDateTime;

public record UserDto(
        Long id,
        String email,
        String fullName,
        String role,
        OffsetDateTime createdAt
) {}