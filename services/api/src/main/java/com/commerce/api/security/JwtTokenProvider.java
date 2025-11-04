package com.commerce.api.security;

import io.jsonwebtoken.Claims;
<<<<<<< HEAD
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;
=======
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
<<<<<<< HEAD
import java.util.Optional;
=======
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
<<<<<<< HEAD
    private final long expiration;


    public JwtTokenProvider(
            @Value("${jwt.secret:change-this-in-production-to-a-very-long-secret-key}") String secret,
            @Value("${jwt.expiration:86400000}") long expiration
    ) {

        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
=======
    private final long validityInMilliseconds;

    public JwtTokenProvider(
            @Value("${jwt.secret:your-super-secret-key-that-should-be-at-least-256-bits-long-for-hs256-algorithm}") String secret,
            @Value("${jwt.expiration:86400000}") long expiration
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.validityInMilliseconds = expiration;
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    }

    public String generateToken(String email) {
        Date now = new Date();
<<<<<<< HEAD
        Date expiry = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(email)
                //.claim("userId", userId)
                //.claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

=======
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
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
<<<<<<< HEAD
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired: " + e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Invalid JWT: " + e.getMessage());
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

    public ResponseCookie createHttpOnlyCookie( String value) {
        return ResponseCookie.from("rt", value)
                .httpOnly(true)
                .secure(false) // https'gecince true olacak.
                .sameSite("Lax")
                .path("/")
                .maxAge(1209600)//14gün
                .build();
    }

    public ResponseCookie clearCookie() {
        return ResponseCookie.from("rt", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    public String getCookieValue(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, "rt");
        if (cookie != null && cookie.getValue() != null && !cookie.getValue().isBlank()) {
            return cookie.getValue();
        }
        return null;
    }



}
=======

            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
