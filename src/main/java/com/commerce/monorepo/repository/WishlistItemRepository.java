package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.WishlistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    @EntityGraph(attributePaths = {"product", "product.images"})
    List<WishlistItem> findByUserId(Long userId);
    
    @EntityGraph(attributePaths = {"product", "product.images"})
    Page<WishlistItem> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"product", "product.images"})
    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);
    
    Long countByUserId(Long userId);
}

