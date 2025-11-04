package com.commerce.api.dto;

import java.time.LocalDateTime;

public class ReviewDto {
    private Long id;
    private Long productId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String title;
    private String comment;
    private String[] images;
    private Boolean isVerifiedPurchase;
    private Boolean isApproved;
    private Boolean isFeatured;
    private Integer helpfulCount;
    private Integer unhelpfulCount;
    private String adminResponse;
    private LocalDateTime adminResponseAt;
    private LocalDateTime createdAt;

    public ReviewDto() {
    }

    public ReviewDto(Long id, Long productId, Long userId, String userName, Integer rating, String title,
                     String comment, String[] images, Boolean isVerifiedPurchase, Boolean isApproved,
                     Boolean isFeatured, Integer helpfulCount, Integer unhelpfulCount, String adminResponse,
                     LocalDateTime adminResponseAt, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.title = title;
        this.comment = comment;
        this.images = images;
        this.isVerifiedPurchase = isVerifiedPurchase;
        this.isApproved = isApproved;
        this.isFeatured = isFeatured;
        this.helpfulCount = helpfulCount;
        this.unhelpfulCount = unhelpfulCount;
        this.adminResponse = adminResponse;
        this.adminResponseAt = adminResponseAt;
        this.createdAt = createdAt;
    }

    // Getters
    public Long id() { return id; }
    public Long productId() { return productId; }
    public Long userId() { return userId; }
    public String userName() { return userName; }
    public Integer rating() { return rating; }
    public String title() { return title; }
    public String comment() { return comment; }
    public String[] images() { return images; }
    public Boolean isVerifiedPurchase() { return isVerifiedPurchase; }
    public Boolean isApproved() { return isApproved; }
    public Boolean isFeatured() { return isFeatured; }
    public Integer helpfulCount() { return helpfulCount; }
    public Integer unhelpfulCount() { return unhelpfulCount; }
    public String adminResponse() { return adminResponse; }
    public LocalDateTime adminResponseAt() { return adminResponseAt; }
    public LocalDateTime createdAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setProductId(Long productId) { this.productId = productId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setTitle(String title) { this.title = title; }
    public void setComment(String comment) { this.comment = comment; }
    public void setImages(String[] images) { this.images = images; }
    public void setIsVerifiedPurchase(Boolean isVerifiedPurchase) { this.isVerifiedPurchase = isVerifiedPurchase; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public void setHelpfulCount(Integer helpfulCount) { this.helpfulCount = helpfulCount; }
    public void setUnhelpfulCount(Integer unhelpfulCount) { this.unhelpfulCount = unhelpfulCount; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }
    public void setAdminResponseAt(LocalDateTime adminResponseAt) { this.adminResponseAt = adminResponseAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
