package com.commerce.api.service;

import com.commerce.api.domain.RefreshToken;
import com.commerce.api.repo.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

//    HMAC + pepper’ı ekle,
//    UUID + raw token formatına geçilecek
//    Reuse detection (token tekrar kullanımı) mantığını eklenecek.


    private final RefreshTokenRepository repo;
    private final PasswordEncoder passwordEncoder; // BCryptPasswordEncoder bean
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long EXPIRE_DAYS = 14;

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional
    public String create(Long userId) {
        String raw = generateToken();
        String hashed = passwordEncoder.encode(raw);

        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(hashed);
        token.setExpiresAt(LocalDateTime.now().plusDays(EXPIRE_DAYS));
        token.setRevoked(false);
        repo.save(token);

        return raw; // bu client’a cookie olarak dönecek11
    }

    @Transactional(readOnly = true)
    public RefreshToken validate(Long userId, String raw) {
        RefreshToken rt = repo.findByUserIdAndRevokedFalse(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid_refresh"));

        if (!passwordEncoder.matches(raw, rt.getTokenHash())) {
            // reuse detection-- Bir saldırgan revoke edilmiş refresh token'i tekrar kullanırsa burası devreye girip
            // aktif tüm refresh tokenleri revoke edip tekrar girişe zorlar burada kullanıcıya bilgilendirme maili gönderilebilir.
            repo.revokeAllByUserId(userId);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "possible_token_reuse_detected");
        }

        if (!passwordEncoder.matches(raw, rt.getTokenHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid_refresh");
        }
        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "expired_refresh");
        }
        return rt;
    }


    @Transactional
    public String rotate(Long userId, String oldRaw) {
        RefreshToken old = validate(userId, oldRaw);
        old.setRevoked(true);
        repo.save(old);
        return create(userId);
    }

    @Transactional
    public void revoke(Long userId, String raw) {
        RefreshToken rt = validate(userId, raw);
        rt.setRevoked(true);
        repo.save(rt);
    }
}
