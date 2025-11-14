package com.commerce.monorepo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_token_prefix", columnList = "token_prefix")
})

@NoArgsConstructor
@Data
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "token_prefix", unique = true, length = 32)
    private String tokenPrefix;

    @Column(name = "token_hash", unique = true,nullable = false,length = 64)
    private String tokenHash;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "revoked")
    private boolean revoked;

    @Column(name = "child_token")
    private String childToken;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "user_ip")
    private String userIp;

    //private String userAgent;


}
