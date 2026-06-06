package com.commerce.monorepo.security;

import com.commerce.monorepo.config.AppProperties;
import com.commerce.monorepo.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;


@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long expiration;
    private final AppProperties appProperties;


    public JwtTokenProvider(
            @Value("${jwt.secret:change-this-in-production-to-a-very-long-secret-key}") String secret,
            @Value("${jwt.expiration:86400000}") long expiration,
            AppProperties appProperties
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
        this.appProperties = appProperties;
    }

    public String generateToken(String email,long userId, UserRole role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }


    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Token expired: {}", e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
        }
        return false;
    }


    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    public Long getUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public ResponseCookie createHttpOnlyCookie(String value) {
        return ResponseCookie.from("rt", value)
                .httpOnly(true)
                .secure(appProperties.isCookieSecure())
                .sameSite(appProperties.getCookieSameSite())
                .path("/")
                .maxAge(1209600) // 14 gün
                .build();
    }

    // logout için
    public ResponseCookie clearCookie() {
        return ResponseCookie.from("rt", "")
                .httpOnly(true)
                .secure(appProperties.isCookieSecure())
                .sameSite(appProperties.getCookieSameSite())
                .path("/")
                .maxAge(0)
                .build();
    }

    public Optional<String> getRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, "rt");
        if (cookie != null && cookie.getValue() != null && !cookie.getValue().isBlank()) {
            return Optional.of(cookie.getValue());
        }
        return Optional.empty();
    }


}
