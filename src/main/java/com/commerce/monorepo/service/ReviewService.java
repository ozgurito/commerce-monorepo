package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.Review;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.entity.ReviewHelpful;
import com.commerce.monorepo.dto.ReviewDto;
import com.commerce.monorepo.dto.ReviewCreateRequest;
import com.commerce.monorepo.repository.ReviewRepository;
import com.commerce.monorepo.repository.ReviewHelpfulRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    public ReviewService(ReviewRepository reviewRepository, ReviewHelpfulRepository reviewHelpfulRepository,
                         ProductRepository productRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.reviewHelpfulRepository = reviewHelpfulRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }
    
    public ReviewDto createReview(ReviewCreateRequest dto, String userEmail) {
        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> new java.util.NoSuchElementException("Product not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        
        if (!product.getAllowReviews()) {
            throw new IllegalArgumentException("Reviews not allowed for this product");
        }
        
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(dto.rating());
        review.setTitle(dto.title());
        review.setComment(dto.comment());
        review.setImages(dto.images());
        review.setIsVerifiedPurchase(false);
        review.setIsApproved(false);
        
        Review saved = reviewRepository.save(review);
        return mapToDto(saved);
    }
    
    @Transactional
    public ReviewDto approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setIsApproved(true);
        reviewRepository.save(review);
        
        return mapToDto(review);
    }
    
    @Transactional
    public ReviewDto addAdminResponse(Long id, String response) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Review not found"));
        review.setAdminResponse(response);
        review.setAdminResponseAt(LocalDateTime.now());
        Review updated = reviewRepository.save(review);
        return mapToDto(updated);
    }
    
    @Transactional
    public void markHelpful(Long reviewId, String userEmail, boolean isHelpful) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Review not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        
        // Kullanıcı kendi review'ına helpful/unhelpful işaretleyemez
        if (review.getUser() != null && review.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You cannot mark your own review as helpful/unhelpful");
        }
        
        reviewHelpfulRepository.findByReviewIdAndUserId(reviewId, user.getId())
                .ifPresentOrElse(
                    existing -> {
                        if (existing.getIsHelpful() != isHelpful) {
                            if (isHelpful) {
                                review.setHelpfulCount((review.getHelpfulCount() != null ? review.getHelpfulCount() : 0) + 1);
                                review.setUnhelpfulCount((review.getUnhelpfulCount() != null ? review.getUnhelpfulCount() : 0) - 1);
                            } else {
                                review.setHelpfulCount((review.getHelpfulCount() != null ? review.getHelpfulCount() : 0) - 1);
                                review.setUnhelpfulCount((review.getUnhelpfulCount() != null ? review.getUnhelpfulCount() : 0) + 1);
                            }
                            existing.setIsHelpful(isHelpful);
                            reviewHelpfulRepository.save(existing);
                        }
                    },
                    () -> {
                        ReviewHelpful helpful = new ReviewHelpful();
                        helpful.setReview(review);
                        helpful.setUser(user);
                        helpful.setIsHelpful(isHelpful);
                        reviewHelpfulRepository.save(helpful);
                        
                        if (isHelpful) {
                            review.setHelpfulCount((review.getHelpfulCount() != null ? review.getHelpfulCount() : 0) + 1);
                        } else {
                            review.setUnhelpfulCount((review.getUnhelpfulCount() != null ? review.getUnhelpfulCount() : 0) + 1);
                        }
                    }
                );
        
        reviewRepository.save(review);
    }
    
    @Transactional(readOnly = true)
    public Page<ReviewDto> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndIsApprovedTrue(productId, pageable)
                .map(this::mapToDto);
    }
    
    @Transactional(readOnly = true)
    public Page<ReviewDto> getPendingReviews(Pageable pageable) {
        // Direkt database query ile pagination
        return reviewRepository.findByIsApprovedFalseOrIsApprovedIsNull(pageable)
                .map(this::mapToDto);
    }
    
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
    
    private ReviewDto mapToDto(Review review) {
        Product product = review.getProduct();
        User user = review.getUser();
        
        return ReviewDto.builder()
                .id(review.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .userId(user != null ? user.getId() : null)
                .userName(user != null && user.getFullName() != null ? user.getFullName() : "Anonymous")
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .images(review.getImages() != null ? Arrays.asList(review.getImages()) : null)
                .verifiedPurchase(Boolean.TRUE.equals(review.getIsVerifiedPurchase()))
                .approved(Boolean.TRUE.equals(review.getIsApproved()))
                .featured(Boolean.TRUE.equals(review.getIsFeatured()))
                .helpfulCount(review.getHelpfulCount() != null ? review.getHelpfulCount() : 0)
                .unhelpfulCount(review.getUnhelpfulCount() != null ? review.getUnhelpfulCount() : 0)
                .adminResponse(review.getAdminResponse())
                .adminResponseAt(review.getAdminResponseAt())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
