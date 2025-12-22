package com.commerce.monorepo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchRequest {

    // Arama
    private String keyword;

    // Kategori filtresi
    private Long categoryId;
    private List<Long> categoryIds; // Çoklu kategori
    private Boolean includeSubcategories; // Alt kategorileri dahil et

    // Fiyat filtresi
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Variant filtreleri
    private List<String> colors;
    private List<String> sizes;

    // Stok filtresi
    private Boolean inStockOnly;

    // Özellik filtreleri
    private Boolean featuredOnly;
    private String gender; // MALE, FEMALE, UNISEX
    private String season; // SPRING, SUMMER, FALL, WINTER, ALL_SEASON

    // Sıralama
    private String sortBy; // name, price, createdAt, rating, popularity
    private String sortDirection; // ASC, DESC

    // Sayfalama (Spring Pageable ile de kullanılabilir)
    private Integer page;
    private Integer size;

    // Varsayılan değerler
    public ProductSearchRequest withDefaults() {
        if (this.page == null) this.page = 0;
        if (this.size == null) this.size = 20;
        if (this.sortBy == null) this.sortBy = "createdAt";
        if (this.sortDirection == null) this.sortDirection = "DESC";
        if (this.includeSubcategories == null) this.includeSubcategories = true;
        if (this.inStockOnly == null) this.inStockOnly = false;
        return this;
    }
}

