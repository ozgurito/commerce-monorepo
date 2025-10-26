// src/main/java/com/commerce/api/dto/AuthResponse.java
package com.commerce.api.dto;

public record AuthResponse(
        String token,
        String email,
        String fullName,
        String role
) {}