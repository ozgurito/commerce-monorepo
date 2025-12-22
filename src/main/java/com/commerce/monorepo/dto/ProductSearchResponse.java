package com.commerce.monorepo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchResponse {

    // Ürünler
    private List<ProductDto> products;

    // Sayfalama bilgisi
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;

    // Filtre seçenekleri (facets)
    private FilterOptions filterOptions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterOptions {
        private List<CategoryCount> categories;
        private List<String> availableColors;
        private List<String> availableSizes;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Map<String, Long> genderCounts;
        private Map<String, Long> seasonCounts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryCount {
        private Long categoryId;
        private String categoryName;
        private String categorySlug;
        private Long productCount;
    }
}

