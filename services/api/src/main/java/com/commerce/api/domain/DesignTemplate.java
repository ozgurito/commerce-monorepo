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

import java.util.List;
=======
import org.hibernate.annotations.Type;
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea

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
<<<<<<< HEAD
=======
    @Type(JsonBinaryType.class)
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    private String templateData;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @Column(name = "preview_images")
<<<<<<< HEAD
    private List<String> previewImages;
    
    @Column(name = "compatible_products")
    private List<String> compatibleProducts;
=======
    private String[] previewImages;
    
    @Column(name = "compatible_products")
    private String[] compatibleProducts;
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    
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

