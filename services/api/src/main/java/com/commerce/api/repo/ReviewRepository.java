package com.commerce.api.repo;

import com.commerce.api.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    Page<Review> findByProductIdAndIsApprovedTrue(Long productId, Pageable pageable);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);
    Long countByProductIdAndIsApprovedTrue(Long productId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.isApproved = true")
    Double findAverageRatingByProductId(Long productId);
}

