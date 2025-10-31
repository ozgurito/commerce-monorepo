package com.commerce.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long validityInMilliseconds;

    public JwtTokenProvider(
            @Value("${jwt.secret:your-super-secret-key-that-should-be-at-least-256-bits-long-for-hs256-algorithm}") String secret,
            @Value("${jwt.expiration:86400000}") long expiration
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.validityInMilliseconds = expiration;
    }

    public String generateToken(String email) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .subject(email)           // ✅ Deprecated: setSubject()
                .issuedAt(now)            // ✅ Deprecated: setIssuedAt()
                .expiration(validity)     // ✅ Deprecated: setExpiration()
                .signWith(secretKey)      // ✅ Deprecated: signWith(key, algorithm)
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()           // ✅ Deprecated: parserBuilder()
                .verifyWith(secretKey)           // ✅ Yeni API
                .build()
                .parseSignedClaims(token)        // ✅ Deprecated: parseClaimsJws()
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);

            return true;
        } catch (Exception e) {
            return false;
        }
    }
}