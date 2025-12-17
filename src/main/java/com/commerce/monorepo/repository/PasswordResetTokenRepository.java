package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);

    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);

    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user.id = :userId AND t.used = false")
    void invalidateUserTokens(Long userId);
}

