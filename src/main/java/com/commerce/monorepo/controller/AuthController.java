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
import com.commerce.monorepo.service.PasswordResetService;
import com.commerce.monorepo.service.EmailVerificationService;
import com.commerce.monorepo.dto.ResendVerificationRequest;
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
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final EmailVerificationService emailVerificationService;
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

    // ============================================
    // EMAIL VERIFICATION ENDPOINTS
    // ============================================

    /**
     * Doğrulama linkine tıklandığında çağrılır
     *
     * Örnek: GET /api/auth/verify-email?token=xxx
     */
    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "E-posta adresiniz başarıyla doğrulandı."));
    }

    /**
     * Yeni doğrulama emaili gönderir
     *
     * Örnek: POST /api/auth/verify-email/resend
     */
    @PostMapping("/verify-email/resend")
    @RateLimit(key = "auth:verify-resend", limit = 3, windowSeconds = 300)
    public ResponseEntity<Map<String, String>> resendVerificationEmail(
            @Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resendVerificationEmail(request.email());
        return ResponseEntity.ok(Map.of(
                "message", "Eğer bu e-posta kayıtlı ve doğrulanmamışsa, yeni bir bağlantı gönderildi."));
    }

    // ============================================
    // PASSWORD RESET ENDPOINTS
    // ============================================

    /**
     * Şifremi unuttum - Reset token oluştur
     * 
     * Örnek: POST /api/auth/forgot-password
     * Body: {"email": "user@example.com"}
     */
    @PostMapping("/forgot-password")
    @RateLimit(key = "auth:forgot", limit = 5, windowSeconds = 300) // 5 dakikada max 5 istek
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.createPasswordResetToken(request);
        
        // Güvenlik: Her durumda aynı mesajı dön (email enum attack'ı önler)
        return ResponseEntity.ok(Map.of(
            "message", "Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderildi."
        ));
    }

    /**
     * Token geçerli mi kontrol et
     * 
     * Örnek: GET /api/auth/reset-password/validate?token=xxx
     */
    @GetMapping("/reset-password/validate")
    public ResponseEntity<Map<String, Boolean>> validateResetToken(
            @RequestParam String token) {
        boolean valid = passwordResetService.validateToken(token);
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    /**
     * Şifreyi sıfırla
     * 
     * Örnek: POST /api/auth/reset-password
     * Body: {"token": "xxx", "newPassword": "xxx", "confirmPassword": "xxx"}
     */
    @PostMapping("/reset-password")
    @RateLimit(key = "auth:reset", limit = 5, windowSeconds = 300)
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Şifreniz başarıyla güncellendi."));
    }

}
