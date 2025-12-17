package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ForgotPasswordRequest;
import com.commerce.monorepo.dto.ResetPasswordRequest;
import com.commerce.monorepo.entity.PasswordResetToken;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.PasswordResetTokenRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // private final EmailService emailService; // Email service eklenince uncomment

    private static final int TOKEN_EXPIRY_HOURS = 24;

    /**
     * Şifre sıfırlama talebi oluşturur
     * @return Token (frontend'e döndürülür - normalde email ile gönderilir)
     */
    @Transactional
    public String createPasswordResetToken(ForgotPasswordRequest request) {
        // Kullanıcıyı bul (bulunamasa bile güvenlik için aynı mesajı dön)
        User user = userRepository.findByEmail(request.email()).orElse(null);
        
        if (user == null) {
            log.warn("Password reset requested for non-existent email: {}", request.email());
            // Güvenlik: Kullanıcı var mı yok mu belli etme
            return null;
        }

        // Mevcut aktif token'ları iptal et
        tokenRepository.invalidateUserTokens(user.getId());

        // Yeni token oluştur
        String token = UUID.randomUUID().toString();
        
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS));
        resetToken.setUsed(false);
        
        tokenRepository.save(resetToken);

        // Email gönder (EmailService eklenince)
        // String resetLink = "https://yoursite.com/reset-password?token=" + token;
        // emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

        log.info("Password reset token created for user: {}", user.getEmail());
        
        // Geliştirme aşamasında token'ı dön, production'da null dönecek
        return token;
    }

    /**
     * Token'ı doğrular
     */
    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .map(PasswordResetToken::isValid)
                .orElse(false);
    }

    /**
     * Şifreyi sıfırlar
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Token kontrolü
        PasswordResetToken resetToken = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BaseException(ErrorCode.RESET_TOKEN_INVALID));

        // Kullanılmış mı?
        if (resetToken.getUsed()) {
            throw new BaseException(ErrorCode.RESET_TOKEN_USED);
        }

        // Süresi dolmuş mu?
        if (resetToken.isExpired()) {
            throw new BaseException(ErrorCode.RESET_TOKEN_EXPIRED);
        }

        // Şifreler eşleşiyor mu?
        if (!request.passwordsMatch()) {
            throw new BaseException(ErrorCode.PASSWORD_MISMATCH);
        }

        // Şifreyi güncelle
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Token'ı kullanıldı olarak işaretle
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    /**
     * Süresi dolmuş token'ları temizle (Scheduled job için)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Expired password reset tokens cleaned up");
    }
}

