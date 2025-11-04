package com.commerce.api.domain;
<<<<<<< HEAD
=======

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
<<<<<<< HEAD
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
=======
import org.hibernate.annotations.Type;

>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_designs")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class CustomDesign extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "design_name", nullable = false, length = 200)
    private String designName;
    
    @Column(name = "product_type", nullable = false, length = 100)
    private String productType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_product_id")
    private Product baseProduct;
    
    @Column(name = "design_data", nullable = false, columnDefinition = "jsonb")
<<<<<<< HEAD
    @JdbcTypeCode(SqlTypes.JSON)
=======
    @Type(JsonBinaryType.class)
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    private String designData;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @Column(name = "preview_images")
    private String[] previewImages;
    
    @Column(nullable = false)
    private Integer quantity = 1;
    
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    @Column(length = 20)
    private String size;
    
    @Column(length = 50)
    private String color;
    
    @Column(length = 50)
    private String status = "draft";
    
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "production_started_at")
    private LocalDateTime productionStartedAt;
    
    @Column(name = "production_completed_at")
    private LocalDateTime productionCompletedAt;
    
    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;
    
    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;
    
    @Column(name = "credits_used")
    private Integer creditsUsed = 0;
}

