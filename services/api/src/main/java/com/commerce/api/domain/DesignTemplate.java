package com.commerce.api.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "design_templates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DesignTemplate extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 100)
    private String category;
    
    @Column(name = "template_data", nullable = false, columnDefinition = "jsonb")
    @Type(JsonBinaryType.class)
    private String templateData;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @Column(name = "preview_images")
    private String[] previewImages;
    
    @Column(name = "compatible_products")
    private String[] compatibleProducts;
    
    @Column(name = "is_free", nullable = false)
    private Boolean isFree = true;
    
    @Column(name = "credit_cost", nullable = false)
    private Integer creditCost = 0;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;
    
    @Column(name = "use_count", nullable = false)
    private Integer useCount = 0;
}

