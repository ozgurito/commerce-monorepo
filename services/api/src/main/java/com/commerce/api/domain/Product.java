package com.commerce.api.domain;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonIgnore;
=======
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
<<<<<<< HEAD
import lombok.ToString;
=======
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_name", columnList = "name"),
        @Index(name = "idx_product_slug", columnList = "slug")
})
@Data
<<<<<<< HEAD
@EqualsAndHashCode(callSuper = true, exclude = "reviews")
@ToString(exclude = "reviews")
=======
@EqualsAndHashCode(callSuper = true)
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
@NoArgsConstructor
public class Product extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(unique = true, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "short_description", length = 500)
    private String shortDescription;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "compare_price", precision = 10, scale = 2)
    private BigDecimal comparePrice;
    
    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(nullable = false)
    private Integer stock = 0;
    
    @Column(unique = true, length = 100)
    private String sku;
    
    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold = 5;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal weight;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal width;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal height;
    
    @Column(name = "length", precision = 10, scale = 2)
    private BigDecimal length;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "allow_reviews")
    private Boolean allowReviews = true;
    
    @Column(name = "meta_title", length = 200)
    private String metaTitle;
    
    @Column(name = "meta_description", length = 500)
    private String metaDescription;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();
    
<<<<<<< HEAD
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @JsonIgnore
=======
    @OneToMany(mappedBy = "product")
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    private List<Review> reviews = new ArrayList<>();
    
    // Helper methods
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }
    
    public void addVariant(ProductVariant variant) {
        variants.add(variant);
        variant.setProduct(this);
    }
    
    public boolean isLowStock() {
        return stock != null && stock <= lowStockThreshold;
    }
    
    public boolean isOutOfStock() {
        return stock != null && stock <= 0;
    }
    
<<<<<<< HEAD
=======
    @Transient
    public Double getAverageRating() {
        if (reviews == null || reviews.isEmpty()) return 0.0;
        return reviews.stream()
                .filter(r -> r.getIsApproved() != null && r.getIsApproved())
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }
    
    @Transient
    public Integer getTotalReviews() {
        if (reviews == null) return 0;
        return (int) reviews.stream()
                .filter(r -> r.getIsApproved() != null && r.getIsApproved())
                .count();
    }
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
}