package com.commerce.api.repo;

import com.commerce.api.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * E-posta ile kullanıcı bul
     */
    Optional<User> findByEmail(String email);

    /**
     * E-posta var mı kontrol et
     */
    boolean existsByEmail(String email);

    /**
     * Full name var mı kontrol et (eğer unique constraint varsa)
     */
    boolean existsByFullName(String fullName);
}