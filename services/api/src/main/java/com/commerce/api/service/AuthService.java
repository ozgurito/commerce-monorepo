// src/main/java/com/commerce/api/service/AuthService.java
package com.commerce.api.service;
import com.commerce.api.domain.RefreshToken;
import com.commerce.api.domain.User;
import com.commerce.api.dto.AuthRequest;
import com.commerce.api.dto.AuthResponse;
import com.commerce.api.repo.RefreshTokenRepository;
import com.commerce.api.repo.UserRepository;
import com.commerce.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    /** Kullanıcı kaydı */
    @Transactional
    public AuthResponse register(AuthRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email_taken");
        }
        if (request.fullName() != null && !request.fullName().isBlank()
                && userRepository.existsByFullName(request.fullName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "full_name_taken");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(saved.getEmail());

        return new AuthResponse(token,null, saved.getId(), saved.getEmail(), saved.getFullName());
    }

    /** Kullanıcı girişi */
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "invalid_credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid_credentials");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token,null, user.getId(), user.getEmail(), user.getFullName());
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenRaw, Long userId) {
        // 1️⃣ Refresh token'ı doğrula
        RefreshToken validToken = refreshTokenService.validate(userId, refreshTokenRaw);

        String newRefresh = refreshTokenService.rotate(userId, refreshTokenRaw);

        String newAccess = jwtTokenProvider.generateToken(
                userRepository.findById(userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "user_not_found"))
                        .getEmail()
        );

        return new AuthResponse(newAccess,newRefresh, userId, validToken.getUserId().toString(), null);
    }

}
