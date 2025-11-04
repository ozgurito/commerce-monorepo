package com.commerce.api.service;

import com.commerce.api.domain.Review;
import com.commerce.api.domain.Product;
import com.commerce.api.domain.User;
import com.commerce.api.domain.ReviewHelpful;
import com.commerce.api.dto.ReviewDto;
import com.commerce.api.dto.ReviewCreateRequest;
import com.commerce.api.repo.ReviewRepository;
import com.commerce.api.repo.ReviewHelpfulRepository;
import com.commerce.api.repo.ProductRepository;
import com.commerce.api.repo.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    
<<<<<<< HEAD
    @Transactional
    public ReviewDto approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setIsApproved(true);
        reviewRepository.save(review);
        
        // Manuel DTO mapping - transaction içinde User'ı eager load et
        User user = review.getUser(); // Transaction içinde yükleniyor
        Product product = review.getProduct(); // Transaction içinde yükleniyor
        
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setProductId(product != null ? product.getId() : null);
        dto.setUserId(user != null ? user.getId() : null);
        dto.setUserName(user != null && user.getFullName() != null ? user.getFullName() : "Anonymous");
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setComment(review.getComment());
        dto.setImages(review.getImages());
        dto.setIsVerifiedPurchase(Boolean.TRUE.equals(review.getIsVerifiedPurchase()));
        dto.setIsApproved(Boolean.TRUE.equals(review.getIsApproved()));
        dto.setIsFeatured(Boolean.TRUE.equals(review.getIsFeatured()));
        dto.setHelpfulCount(review.getHelpfulCount() != null ? review.getHelpfulCount() : 0);
        dto.setUnhelpfulCount(review.getUnhelpfulCount() != null ? review.getUnhelpfulCount() : 0);
        dto.setAdminResponse(review.getAdminResponse());
        dto.setAdminResponseAt(review.getAdminResponseAt());
        dto.setCreatedAt(review.getCreatedAt());
        
        return dto;
    }
    
    @Transactional
=======
    public ReviewDto approveReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Review not found"));
        review.setIsApproved(true);
        Review updated = reviewRepository.save(review);
        return mapToDto(updated);
    }
    
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    public ReviewDto addAdminResponse(Long id, String response) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Review not found"));
        review.setAdminResponse(response);
        review.setAdminResponseAt(LocalDateTime.now());
        Review updated = reviewRepository.save(review);
        return mapToDto(updated);
    }
    
<<<<<<< HEAD
    @Transactional
=======
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    public void markHelpful(Long reviewId, String userEmail, boolean isHelpful) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Review not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        
<<<<<<< HEAD
        // Kullanıcı kendi review'ına helpful/unhelpful işaretleyemez
        if (review.getUser() != null && review.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You cannot mark your own review as helpful/unhelpful");
        }
        
=======
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
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
        List<Review> allReviews = reviewRepository.findAll();
        List<Review> pending = new ArrayList<>();
        for (Review r : allReviews) {
            if (r.getIsApproved() == null || !r.getIsApproved()) {
                pending.add(r);
            }
        }
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();
        int start = page * size;
        int end = Math.min(start + size, pending.size());
        return new PageImpl<>(pending.subList(start, end), pageable, pending.size())
                .map(this::mapToDto);
    }
    
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
    
    private ReviewDto mapToDto(Review review) {
<<<<<<< HEAD
        Product product = review.getProduct();
        User user = review.getUser();
        
        return new ReviewDto(
                review.getId(),
                product != null ? product.getId() : null,
                user != null ? user.getId() : null,
                user != null && user.getFullName() != null ? user.getFullName() : "Anonymous",
=======
        return new ReviewDto(
                review.getId(),
                review.getProduct().getId(),
                review.getUser().getId(),
                review.getUser().getFullName(),
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
                review.getRating(),
                review.getTitle(),
                review.getComment(),
                review.getImages(),
                review.getIsVerifiedPurchase(),
                review.getIsApproved(),
                review.getIsFeatured(),
                review.getHelpfulCount() != null ? review.getHelpfulCount() : 0,
                review.getUnhelpfulCount() != null ? review.getUnhelpfulCount() : 0,
                review.getAdminResponse(),
                review.getAdminResponseAt(),
                review.getCreatedAt()
        );
    }
}

