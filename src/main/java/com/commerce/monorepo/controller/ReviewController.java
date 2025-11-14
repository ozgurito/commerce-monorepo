package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.ReviewDto;
import com.commerce.monorepo.dto.ReviewCreateRequest;
import com.commerce.monorepo.service.ReviewService;
import com.commerce.monorepo.ratelimit.RateLimit;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "review:create", limit = 3, windowSeconds = 60)
    public ResponseEntity<ReviewDto> createReview(@Valid @RequestBody ReviewCreateRequest dto) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(dto, userEmail));
    }

    @GetMapping("/product/{productId}")
    @RateLimit(key = "review:list:product", limit = 40, windowSeconds = 60)
    public Page<ReviewDto> getProductReviews(
            @PathVariable Long productId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return reviewService.getProductReviews(productId, pageable);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "review:admin:pending", limit = 20, windowSeconds = 60)
    public Page<ReviewDto> getPendingReviews(@PageableDefault(size = 20) Pageable pageable) {
        return reviewService.getPendingReviews(pageable);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "review:admin:approve", limit = 20, windowSeconds = 60)
    public ReviewDto approveReview(@PathVariable Long id) {
        return reviewService.approveReview(id);
    }

    @PutMapping("/{id}/admin-response")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "review:admin:response", limit = 20, windowSeconds = 60)
    public ReviewDto addAdminResponse(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        String response = request.get("response");
        if (response == null) {
            throw new IllegalArgumentException("Response field is required");
        }
        return reviewService.addAdminResponse(id, response);
    }

    @PostMapping("/{id}/helpful")
    @PreAuthorize("isAuthenticated()")
    @RateLimit(key = "review:helpful", limit = 10, windowSeconds = 60)
    public ResponseEntity<Void> markHelpful(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "true") boolean helpful
    ) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        reviewService.markHelpful(id, userEmail, helpful);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "review:admin:delete", limit = 10, windowSeconds = 60)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }
}
