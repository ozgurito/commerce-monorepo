package com.commerce.api.web;

import com.commerce.api.dto.AuthRequest;
import com.commerce.api.dto.AuthResponse;
import com.commerce.api.security.JwtTokenProvider;
import com.commerce.api.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

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
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
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
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = jwtTokenProvider.getCookieValue(request);
        if (refreshToken == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "missing_refresh_token");
        }
        // Cookie’den refresh token geldiğinde, userId’yi DB’den validate sırasında çıkarırız
        // AuthService içinde zaten refreshTokenService.validate çağrısı yapılıyor
        // Yani controller sadece cookie’yi geçiriyor
        Long userId = null; // validate içinde bulunacak
        AuthResponse res = authService.refresh(refreshToken, userId);

        ResponseCookie cookie = jwtTokenProvider.createHttpOnlyCookie(res.refreshToken());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(res);
    }

}