package com.commerce.api.dto;

public record AuthResponse(
        String token,
<<<<<<< HEAD
        String refreshToken,
=======
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
        Long userId,
        String email,
        String fullName
) {}