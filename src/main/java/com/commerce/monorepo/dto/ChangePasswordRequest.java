package com.commerce.monorepo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank(message = "Mevcut şifre gerekli")
    String currentPassword,
    
    @NotBlank(message = "Yeni şifre gerekli")
    @Size(min = 6, max = 100, message = "Şifre 6-100 karakter arasında olmalı")
    String newPassword,
    
    @NotBlank(message = "Şifre onayı gerekli")
    String confirmPassword
) {
    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
    
    public boolean isNewPasswordDifferent() {
        return !newPassword.equals(currentPassword);
    }
}

