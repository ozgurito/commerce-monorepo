// src/main/java/com/commerce/api/dto/RegisterRequest.java
package com.commerce.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank @Size(max = 100) String fullName
) {}