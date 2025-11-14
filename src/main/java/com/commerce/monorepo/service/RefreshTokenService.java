package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.RefreshTokenResponse;
import com.commerce.monorepo.entity.RefreshToken;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.RefreshTokenRepository;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.ratelimit.IpExtract;
import com.commerce.monorepo.security.JwtTokenProvider;
import com.commerce.monorepo.security.TokenHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHasher tokenHasher;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final IpExtract ipExtract;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long EXPIRE_DAYS = 14;

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
    public String create(Long userId, String ip) {

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
        token.setUserIp(ip);

        refreshTokenRepository.save(token);

        return rawToken;
    }

    @Transactional(readOnly = true)
    public RefreshToken validate(String rawToken) {

        if (rawToken == null || !rawToken.contains(".")) {
            throw new BaseException(ErrorCode.INVALID_REFRESH_FORMAT);
        }

        RefreshToken rt = getRefreshToken(rawToken);

        if (!tokenHasher.matches(rawToken, rt.getTokenHash())) {
            throw new BaseException(ErrorCode.INVALID_REFRESH_SIGNATURE);
        }

        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BaseException(ErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        // REUSE DETECTION
        if (rt.isRevoked()) {

            String childHash = rt.getChildToken();

            if (childHash != null) {
                Optional<RefreshToken> childOpt = refreshTokenRepository.findByTokenHash(childHash);

                if (childOpt.isPresent()) {
                    RefreshToken child = childOpt.get();

                    if (!child.isRevoked() && child.getExpiresAt().isAfter(LocalDateTime.now())) {
                        revokeChain(rt.getUserId());
                        throw new BaseException(ErrorCode.REFRESH_REUSE_DETECTED);
                    }
                }
            }

            throw new BaseException(ErrorCode.REVOKED_REFRESH_TOKEN);
        }

        return rt;
    }

    @Transactional
    public RefreshTokenResponse refresh(String rawRefreshToken, String ip) {

        RefreshToken validToken = validate(rawRefreshToken);

        String newRefreshToken = rotate(rawRefreshToken, ip);

        User user = userRepository.findById(validToken.getUserId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        String newAccessToken = jwtTokenProvider.generateToken(
                user.getEmail(), user.getId(), user.getRole()
        );

        return new RefreshTokenResponse(newAccessToken, newRefreshToken);
    }

    private RefreshToken getRefreshToken(String rawRefreshToken) {

        String prefix = rawRefreshToken.split("\\.")[0];

        return refreshTokenRepository.findByTokenPrefix(prefix)
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_REFRESH_PREFIX));
    }

    @Transactional
    public String rotate(String oldRawRefreshToken, String ip) {

        RefreshToken old = validate(oldRawRefreshToken);
        old.setRevoked(true);

        String newRaw = create(old.getUserId(), ip);
        String newHash = tokenHasher.hmacSHA256Hex(newRaw);

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
