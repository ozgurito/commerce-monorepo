package com.commerce.api.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ProductVariant extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(name = "variant_type", nullable = false, length = 50)
    private String variantType;
    
    @Column(length = 20)
    private String size;
    
    @Column(length = 50)
    private String color;
    
    @Column(name = "color_hex", length = 7)
    private String colorHex;
    
    @Column(unique = true, length = 100)
    private String sku;
    
    @Column(name = "price_modifier", precision = 10, scale = 2)
    private BigDecimal priceModifier = BigDecimal.ZERO;
    
    @Column
    private Integer stock = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}

