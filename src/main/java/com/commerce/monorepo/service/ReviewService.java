package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ReviewCreateRequest;
import com.commerce.monorepo.dto.ReviewDto;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewDto createReview(ReviewCreateRequest dto, String userEmail) {

        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        if (!Boolean.TRUE.equals(product.getAllowReviews())) {
            throw new BaseException(ErrorCode.PRODUCT_REVIEWS_DISABLED);
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

        return mapToDto(reviewRepository.save(review));
    }

    @Transactional
    public ReviewDto approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BaseException(ErrorCode.REVIEW_NOT_FOUND));
        review.setIsApproved(true);
        return mapToDto(reviewRepository.save(review));
    }

    @Transactional
    public ReviewDto rejectReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BaseException(ErrorCode.REVIEW_NOT_FOUND));
        review.setIsApproved(false);
        return mapToDto(reviewRepository.save(review));
    }

    @Transactional
    public ReviewDto addAdminResponse(Long id, String response) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.REVIEW_NOT_FOUND));

        review.setAdminResponse(response);
        review.setAdminResponseAt(LocalDateTime.now());

        return mapToDto(reviewRepository.save(review));
    }

    @Transactional
    public void markHelpful(Long reviewId, String userEmail, boolean isHelpful) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BaseException(ErrorCode.REVIEW_NOT_FOUND));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Kullanıcı kendi yorumuna oy veremez
        if (review.getUser() != null && review.getUser().getId().equals(user.getId())) {
            throw new BaseException(ErrorCode.REVIEW_SELF_VOTE_FORBIDDEN);
        }

        reviewHelpfulRepository.findByReviewIdAndUserId(reviewId, user.getId())
                .ifPresentOrElse(
                        existing -> {
                            // Oy farkı varsa güncelle
                            if (existing.getIsHelpful() != isHelpful) {
                                adjustHelpfulCounters(review, isHelpful, existing.getIsHelpful());
                                existing.setIsHelpful(isHelpful);
                                reviewHelpfulRepository.save(existing);
                            }
                        },
                        () -> {
                            // Yeni entry
                            ReviewHelpful helpful = new ReviewHelpful();
                            helpful.setReview(review);
                            helpful.setUser(user);
                            helpful.setIsHelpful(isHelpful);
                            reviewHelpfulRepository.save(helpful);

                            adjustHelpfulCounters(review, isHelpful, null);
                        }
                );

        reviewRepository.save(review);
    }

    private void adjustHelpfulCounters(Review review, boolean newVote, Boolean oldVote) {
        int helpful = review.getHelpfulCount() != null ? review.getHelpfulCount() : 0;
        int unhelpful = review.getUnhelpfulCount() != null ? review.getUnhelpfulCount() : 0;

        if (oldVote == null) {
            // yeni oy
            if (newVote) helpful++;
            else unhelpful++;
        } else {
            // güncelleme
            if (newVote) {
                helpful++;
                unhelpful--;
            } else {
                unhelpful++;
                helpful--;
            }
        }

        review.setHelpfulCount(Math.max(helpful, 0));
        review.setUnhelpfulCount(Math.max(unhelpful, 0));
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndIsApprovedTrue(productId, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getPendingReviews(Pageable pageable) {
        return reviewRepository.findByIsApprovedFalseOrIsApprovedIsNull(pageable)
                .map(this::mapToDto);
    }

    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new BaseException(ErrorCode.REVIEW_NOT_FOUND);
        }
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
