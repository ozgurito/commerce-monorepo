package com.commerce.monorepo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_name", columnList = "name"),
        @Index(name = "idx_product_slug", columnList = "slug")
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = "reviews")
@ToString(exclude = "reviews")
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
    
    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate = new BigDecimal("20.00");

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

    @Column(name = "is_flash_deal")
    private Boolean isFlashDeal = false;

    @Column(name = "flash_deal_ends_at")
    private java.time.Instant flashDealEndsAt;

    @Column(name = "allow_reviews")
    private Boolean allowReviews = true;
    
    @Column(name = "meta_title", length = 200)
    private String metaTitle;
    
    @Column(name = "meta_description", length = 500)
    private String metaDescription;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    private List<ProductVariant> variants = new ArrayList<>();
    
    // ========== GİYİM SPESİFİK ALANLAR ==========
    
    @Column(name = "fit_type", length = 50)
    private String fitType;
    
    @Column(name = "fabric_composition", length = 500)
    private String fabricComposition;
    
    @Column(name = "care_instructions", columnDefinition = "TEXT")
    private String careInstructions;
    
    @Column(name = "model_info", length = 500)
    private String modelInfo;
    
    @Column(name = "size_guide", columnDefinition = "TEXT")
    private String sizeGuide;
    
    @Column(name = "material", length = 100)
    private String material;
    
    @Column(name = "season", length = 50)
    private String season;
    
    @Column(name = "origin_country", length = 100)
    private String originCountry;
    
    @Column(name = "gender", length = 20)
    private String gender;
    
    @Column(name = "age_group", length = 50)
    private String ageGroup;

    // Kategoriye göre değişen dinamik özellikler (JSON metni, ör. {"Yaka Tipi":"V Yaka"})
    @Column(name = "specifications", columnDefinition = "TEXT")
    private String specifications;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @BatchSize(size = 30)
    @JsonIgnore
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
}
