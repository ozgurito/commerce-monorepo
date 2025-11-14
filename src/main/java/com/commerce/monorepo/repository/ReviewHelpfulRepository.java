package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.ReviewHelpful;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, Long> {
    Optional<ReviewHelpful> findByReviewIdAndUserId(Long reviewId, Long userId);
}

