// src/main/java/com/commerce/monorepo/service/AuthService.java
package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.AuthRequest;
import com.commerce.monorepo.dto.AuthResponse;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /** Kullanıcı kaydı */
    @Transactional
    public AuthResponse register(AuthRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BaseException(ErrorCode.EMAIL_TAKEN);
        }

        if (request.fullName() != null &&
                !request.fullName().isBlank() &&
                userRepository.existsByFullName(request.fullName())) {
            throw new BaseException(ErrorCode.FULL_NAME_TAKEN);
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);

        // Hoş geldin emaili gönder
        emailService.sendWelcomeEmail(saved);

        return new AuthResponse(
                null,
                null,
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole() != null ? saved.getRole().name() : "USER"
        );
    }

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_MINUTES        = 15;

    /** Kullanıcı girişi — brute-force korumalı */
    @Transactional
    public AuthResponse login(AuthRequest request, String ip) {
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_CREDENTIALS));

        // Hesap pasife alındıysa reddet
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BaseException(ErrorCode.ACCOUNT_DISABLED);
        }

        // Brute-force kilidi hâlâ aktif mi?
        if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
            throw new BaseException(ErrorCode.ACCOUNT_LOCKED);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );

            // Başarılı giriş — sayaçları sıfırla
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            String accessToken = jwtTokenProvider.generateToken(
                    user.getEmail(), user.getId(), user.getRole());
            String refreshRaw = refreshTokenService.create(user.getId(), ip);

            return new AuthResponse(
                    accessToken, refreshRaw,
                    user.getId(), user.getEmail(), user.getFullName(),
                    user.getRole() != null ? user.getRole().name() : "USER");

        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            // Yanlış şifre — sayacı artır
            int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
                user.setFailedLoginAttempts(0);
            }
            userRepository.save(user);
            throw new BaseException(ErrorCode.INVALID_CREDENTIALS);
        }
    }
    public ResponseCookie logout(HttpServletRequest request) {

        String refreshToken = jwtTokenProvider
                .getRefreshTokenFromCookie(request)
                .orElse(null);

        if (refreshToken != null) {
            refreshTokenService.revoke(refreshToken);
        }
       return jwtTokenProvider.clearCookie();

    }
}
