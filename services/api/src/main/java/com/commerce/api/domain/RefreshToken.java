package com.commerce.api.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@NoArgsConstructor
@Data
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "token_hash", unique = true,nullable = false,length = 64)
    private String tokenHash;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "revoked")
    private boolean revoked;

    @Column(name = "parent_token")
    private String parentToken;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    //İleride eklenebilir. Kullanıcı giriş takibi ve olası hesap çalınma risklerinin tespiti için.
    //private String ip;
    //private String userAgent;


}
