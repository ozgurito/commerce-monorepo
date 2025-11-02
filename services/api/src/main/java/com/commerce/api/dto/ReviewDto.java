package com.commerce.api.dto;

import java.time.LocalDateTime;

public record ReviewDto(
    Long id,
    Long productId,
    Long userId,
    String userName,
    Integer rating,
    String title,
    String comment,
    String[] images,
    Boolean isVerifiedPurchase,
    Boolean isApproved,
    Boolean isFeatured,
    Integer helpfulCount,
    Integer unhelpfulCount,
    String adminResponse,
    LocalDateTime adminResponseAt,
    LocalDateTime createdAt
) {}

