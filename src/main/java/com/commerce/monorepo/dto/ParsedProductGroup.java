package com.commerce.monorepo.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Excel içe aktarma — aynı Model Kodu'na ait satırların ayrıştırılmış hâli (1 Product + N Variant).
 * Apache POI'den bağımsızdır — parse (ProductImportService) ve persist (ProductImportRowService)
 * katmanlarını ayırmak için kullanılır.
 */
public record ParsedProductGroup(
        String modelKodu,
        String urunAdi,
        BigDecimal price,
        int totalStock,
        String description,
        String gender,
        String categoryName,
        List<ParsedVariantRow> variantRows
) {}
