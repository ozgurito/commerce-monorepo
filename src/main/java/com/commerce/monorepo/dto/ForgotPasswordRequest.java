package com.commerce.monorepo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
    @NotBlank(message = "Email gerekli")
    @Email(message = "Geçerli bir email adresi girin")
    String email
) {}

