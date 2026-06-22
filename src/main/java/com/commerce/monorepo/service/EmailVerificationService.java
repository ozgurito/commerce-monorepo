package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.EmailVerificationToken;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.EmailVerificationTokenRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final int TOKEN_EXPIRY_HOURS = 24;

    /**
     * Kayıt sonrası çağrılır — token üretir ve email gönderir.
     * Email gönderimi @Async olduğu için exception fırlatmaz; kayıt akışını bozmaz.
     */
    @Transactional
    public void sendVerificationEmail(User user) {
        tokenRepository.invalidateUserTokens(user.getId());

        String token = UUID.randomUUID().toString();

        EmailVerificationToken entity = new EmailVerificationToken();
        entity.setUser(user);
        entity.setToken(token);
        entity.setExpiresAt(LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS));
        entity.setUsed(false);

        tokenRepository.save(entity);

        emailService.sendEmailVerificationEmail(user, token);
    }

    /**
     * Kullanıcı doğrulama linkine tıkladığında çağrılır.
     */
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken entity = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BaseException(ErrorCode.VERIFICATION_TOKEN_INVALID));

        if (entity.getUsed()) {
            throw new BaseException(ErrorCode.VERIFICATION_TOKEN_USED);
        }

        if (entity.isExpired()) {
            throw new BaseException(ErrorCode.VERIFICATION_TOKEN_EXPIRED);
        }

        User user = entity.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        entity.setUsed(true);
        tokenRepository.save(entity);

        emailService.sendWelcomeEmail(user);

        log.info("Email verified for user: {}", user.getEmail());
    }

    /**
     * Yeni doğrulama emaili talep eder.
     * Güvenlik: kullanıcı bulunamasa veya zaten doğrulandıysa sessizce döner.
     */
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);

        if (user == null) {
            log.warn("Resend verification requested for unknown email: {}", email);
            return;
        }

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            log.info("Resend verification skipped — already verified: {}", email);
            return;
        }

        sendVerificationEmail(user);
        log.info("Verification email resent to: {}", email);
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = tokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Cleaned up {} expired email verification tokens", deleted);
    }
}
