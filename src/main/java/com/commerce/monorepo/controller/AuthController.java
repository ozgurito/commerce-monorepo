package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.security.CustomUserPrincipal;
import com.commerce.monorepo.ratelimit.IpExtract;
import com.commerce.monorepo.security.JwtTokenProvider;
import com.commerce.monorepo.ratelimit.RateLimitService;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.AuthService;
import com.commerce.monorepo.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final IpExtract ipExtract;
    private final RateLimitService rateLimitService;

    @RateLimit(key = "register", limit = 5, windowSeconds = 60)
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody AuthRequest authRequest,
            HttpServletRequest request
    ) {

        AuthResponse res = authService.register(authRequest);
        return ResponseEntity.ok(res);
    }

    @RateLimit(key = "login", limit = 5, windowSeconds = 60)
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest authRequest,
                                   HttpServletRequest request,
                                   HttpServletResponse httpResponse) {

        String ip = ipExtract.getClientIp(request);
        AuthResponse res = authService.login(authRequest, ip);

        ResponseCookie cookie = jwtTokenProvider.createHttpOnlyCookie(res.refreshToken());
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout(HttpServletResponse response,
                                       HttpServletRequest request) {

        ResponseCookie cleared = authService.logout(request);
        response.addHeader(HttpHeaders.SET_COOKIE, cleared.toString());

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserPrincipal principal) {

        if (principal == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }

        return ResponseEntity.ok(
                Map.of(
                        "email", principal.getUsername(),
                        "authenticated", true
                )
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request,
                                     HttpServletResponse response) {

        var refreshOpt = jwtTokenProvider.getRefreshTokenFromCookie(request);

        if (refreshOpt.isEmpty()) {
            throw new BaseException(ErrorCode.MISSING_REFRESH_TOKEN);
        }

        String ip = ipExtract.getClientIp(request);

        RefreshTokenResponse res = refreshTokenService.refresh(refreshOpt.get(), ip);

        ResponseCookie cookie = jwtTokenProvider.createHttpOnlyCookie(res.refreshToken());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(res);
    }

}
