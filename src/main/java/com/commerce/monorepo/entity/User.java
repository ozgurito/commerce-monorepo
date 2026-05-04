package com.commerce.monorepo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = true)
    private String email;

    @JsonIgnore
    @Column(nullable = true)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "identity_number", length = 11)
    private String identityNumber;

    @Column(name = "is_guest", nullable = false)
    private Boolean isGuest = false;

    @Column(name = "guest_email", length = 255)
    private String guestEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

    /** Hesap aktif mi? Admin pasife alabilir. */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** E-posta doğrulandı mı? */
    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    /** Son başarılı giriş zamanı */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /** Arka arkaya yanlış şifre sayısı — 5'e ulaşınca hesap kilitlenir */
    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts = 0;

    /** Brute-force kilidi bitiş zamanı; null ise kilit yok */
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) role = UserRole.USER;
        if (isActive == null) isActive = true;
        if (emailVerified == null) emailVerified = false;
        if (failedLoginAttempts == null) failedLoginAttempts = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}