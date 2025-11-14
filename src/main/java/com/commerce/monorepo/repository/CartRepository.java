package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.Cart;
import com.commerce.monorepo.entity.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserIdAndStatus(Long userId, CartStatus status);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.user.id = :userId AND c.status = :status")
    Optional<Cart> findByUserIdAndStatusWithItems(Long userId, CartStatus status);

    boolean existsByUserIdAndStatus(Long userId, CartStatus status);
}