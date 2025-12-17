package com.commerce.monorepo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageRequest {
    
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    
    private String altText;
    
    private Integer displayOrder = 0;
    
    private Boolean isPrimary = false;
}

