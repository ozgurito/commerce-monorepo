package com.commerce.api.repo;

import com.commerce.api.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
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