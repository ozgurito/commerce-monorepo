package com.commerce.api.web;

import com.commerce.api.dto.ReviewDto;
import com.commerce.api.dto.ReviewCreateRequest;
import com.commerce.api.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<ReviewDto> createReview(@Valid @RequestBody ReviewCreateRequest dto) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(dto, userEmail));
    }
    
    @GetMapping("/product/{productId}")
    public Page<ReviewDto> getProductReviews(@PathVariable Long productId,
            @PageableDefault(size = 10) Pageable pageable) {
        return reviewService.getProductReviews(productId, pageable);
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ReviewDto> getPendingReviews(@PageableDefault(size = 20) Pageable pageable) {
        return reviewService.getPendingReviews(pageable);
    }
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ReviewDto approveReview(@PathVariable Long id) {
        return reviewService.approveReview(id);
    }
    
    @PutMapping("/{id}/response")
    @PreAuthorize("hasRole('ADMIN')")
    public ReviewDto addAdminResponse(@PathVariable Long id, @RequestParam String response) {
        return reviewService.addAdminResponse(id, response);
    }
    
    @PostMapping("/{id}/helpful")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markHelpful(@PathVariable Long id, @RequestParam boolean helpful) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        reviewService.markHelpful(id, userEmail, helpful);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }
}

