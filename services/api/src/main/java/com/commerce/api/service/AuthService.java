// src/main/java/com/commerce/api/service/AuthService.java
package com.commerce.api.service;

import com.commerce.api.domain.User;
import com.commerce.api.dto.*;
import com.commerce.api.repo.UserRepository;
import com.commerce.api.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Kayıt
    public AuthResponse register(RegisterRequest req) {
        // Email kontrolü
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // User oluştur
        User user = new User();
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName());

        user = userRepo.save(user);

        // Token oluştur
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    // Giriş
    public AuthResponse login(LoginRequest req) {
        // User bul
        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Şifre kontrolü
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Token oluştur
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    // Kullanıcı bilgisi al
    public UserDto getCurrentUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}