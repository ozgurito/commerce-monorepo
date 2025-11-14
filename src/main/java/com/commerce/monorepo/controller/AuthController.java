package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.security.JwtTokenProvider;
import com.commerce.monorepo.service.AuthService;
import com.commerce.monorepo.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    /**
     * Kullanıcı kaydı
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Kullanıcı girişi
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletResponse response // buraya ekle
    ) {
        AuthResponse res = authService.login(request);

        // Refresh token üret
        ResponseCookie cookie = jwtTokenProvider.createHttpOnlyCookie(res.refreshToken());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(res);
    }


    /**
     * Mevcut kullanıcı bilgisi (JWT token ile)
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Map<String, Object> user = Map.of(
                "email", userDetails.getUsername(),
                "authenticated", true
        );

        return ResponseEntity.ok(user);
    }

    /**
     * Refresh token yenileme
     */
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        var refreshOpt = jwtTokenProvider.getRefreshTokenFromCookie(request);
        if (refreshOpt.isEmpty()) {
            return ResponseEntity.status(401).body(null);
        }

        RefreshTokenResponse res = refreshTokenService.refresh(refreshOpt.get());

        ResponseCookie cookie = jwtTokenProvider.createHttpOnlyCookie(res.refreshToken());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(res);
    }
}
