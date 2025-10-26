// src/main/java/com/commerce/api/repo/UserRepository.java
package com.commerce.api.repo;

import com.commerce.api.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}