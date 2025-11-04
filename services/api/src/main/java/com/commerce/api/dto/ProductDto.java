package com.commerce.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

<<<<<<< HEAD
public class ProductDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private LocalDateTime createdAt;
    private String sku;
    private Boolean isActive;
    private Boolean isFeatured;
    private Long categoryId;
    private String categoryName;
    private Double averageRating;
    private Integer totalReviews;

    public ProductDto() {
    }

    public ProductDto(Long id, String name, String slug, String description, BigDecimal price, Integer stock,
                      LocalDateTime createdAt, String sku, Boolean isActive, Boolean isFeatured,
                      Long categoryId, String categoryName, Double averageRating, Integer totalReviews) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.createdAt = createdAt;
        this.sku = sku;
        this.isActive = isActive;
        this.isFeatured = isFeatured;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }

    // Getters
    public Long id() { return id; }
    public String name() { return name; }
    public String slug() { return slug; }
    public String description() { return description; }
    public BigDecimal price() { return price; }
    public Integer stock() { return stock; }
    public LocalDateTime createdAt() { return createdAt; }
    public String sku() { return sku; }
    public Boolean isActive() { return isActive; }
    public Boolean isFeatured() { return isFeatured; }
    public Long categoryId() { return categoryId; }
    public String categoryName() { return categoryName; }
    public Double averageRating() { return averageRating; }
    public Integer totalReviews() { return totalReviews; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setStock(Integer stock) { this.stock = stock; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setSku(String sku) { this.sku = sku; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
=======
public record ProductDto(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        Integer stock,
        LocalDateTime createdAt,
        String sku,
        Boolean isActive,
        Boolean isFeatured,
        Long categoryId,
        String categoryName,
        Double averageRating,
        Integer totalReviews
) {
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
}