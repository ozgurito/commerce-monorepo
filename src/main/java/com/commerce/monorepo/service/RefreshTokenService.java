package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.RefreshToken;
import com.commerce.monorepo.dto.RefreshTokenResponse;
import com.commerce.monorepo.repository.RefreshTokenRepository;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.security.JwtTokenProvider;
import com.commerce.monorepo.security.TokenHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

//    Reuse detection (token tekrar kullanımı) mantığını eklenecek.

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHasher tokenHasher;
    private final JwtTokenProvider jwtTokenProvider;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long EXPIRE_DAYS = 14; // app.ymla alınacak bu ve diğerleri
    private final UserRepository userRepository;

    private String generatePrefix() {
        byte[] bytes = new byte[8];
        RANDOM.nextBytes(bytes);
        return Base64.getEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateRandomPart() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional
    public String create(Long userId) {
        String prefix = generatePrefix();
        String randomPart = generateRandomPart();
        String rawToken = prefix + "." + randomPart;
        String hashed = tokenHasher.hmacSHA256Hex(rawToken);

        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenPrefix(prefix);
        token.setTokenHash(hashed);
        token.setExpiresAt(LocalDateTime.now().plusDays(EXPIRE_DAYS));
        token.setRevoked(false);
        token.setChildToken(null);
        refreshTokenRepository.save(token);
        System.out.println("refresh token olusturuldu"+token);

        return rawToken; // bu client’a cookie olarak dönecek11
    }

    @Transactional(readOnly = true)
    public RefreshToken validate(String rawToken) {

        if (rawToken == null || !rawToken.contains(".")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid_refresh_format");
        }

        RefreshToken rt=getRefreshToken(rawToken);


        if (!tokenHasher.matches(rawToken, rt.getTokenHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid_refresh_signature");
        }

        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "expired_refresh");
        }

        //reuse detection
        if (rt.isRevoked()) {
            String childHash = rt.getChildToken();
            if (childHash != null) {
                Optional<RefreshToken> childOpt = refreshTokenRepository.findByTokenHash(childHash);
                if (childOpt.isPresent()) {
                    RefreshToken child = childOpt.get();
                    if (!child.isRevoked() && child.getExpiresAt().isAfter(LocalDateTime.now())) {
                        revokeChain(rt.getUserId());
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "reuse_detected");
                    }
                }
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "revoked_refresh");
        }


        return rt;
    }

    @Transactional
    public RefreshTokenResponse refresh(String rawRefreshToken) {

        RefreshToken validToken = validate(rawRefreshToken);

        String newRefreshToken = rotate(rawRefreshToken);

        String newAccessToken = jwtTokenProvider.generateToken(
                userRepository.findById(validToken.getUserId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "user_not_found"))
                        .getEmail()
        );

        return new RefreshTokenResponse(newAccessToken,newRefreshToken);
    }

    private RefreshToken getRefreshToken(String rawRefreshToken) {
        String prefix = rawRefreshToken.split("\\.")[0];

        return refreshTokenRepository.findByTokenPrefix(prefix)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid_refresh_prefix"));
    }

    @Transactional
    public String rotate(String oldRawRefreshToken) {
        RefreshToken old = validate(oldRawRefreshToken);
        old.setRevoked(true);

        // Yeni token oluştur
        String newRaw = create(old.getUserId());
        String newHash = tokenHasher.hmacSHA256Hex(newRaw);

        // Eski token’a yeni tokenın hash’ini parent olarak yaz
        old.setChildToken(newHash);
        refreshTokenRepository.save(old);

        return newRaw;
    }

    @Transactional
    public void revoke(String rawToken) {
        RefreshToken rt = validate(rawToken);
        rt.setRevoked(true);
        refreshTokenRepository.save(rt);
    }

    @Transactional
    public void revokeChain(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
