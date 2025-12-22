package com.commerce.monorepo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockAlertDto {
    private Long productId;
    private String productName;
    private String sku;
    private Integer currentStock;
    private Integer threshold;
    private String categoryName;
    private LocalDateTime alertTime;
}

