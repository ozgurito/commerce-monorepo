package com.commerce.monorepo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageDto {
    private Long id;
    private Long productId;
    private String imageUrl;
    private String altText;
    private Integer displayOrder;
    private Boolean isPrimary;
}
