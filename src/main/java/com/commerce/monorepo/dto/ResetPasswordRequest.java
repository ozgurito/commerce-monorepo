package com.commerce.monorepo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Token gerekli")
    String token,
    
    @NotBlank(message = "Yeni şifre gerekli")
    @Size(min = 6, max = 100, message = "Şifre 6-100 karakter arasında olmalı")
    String newPassword,
    
    @NotBlank(message = "Şifre onayı gerekli")
    String confirmPassword
) {
    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}

