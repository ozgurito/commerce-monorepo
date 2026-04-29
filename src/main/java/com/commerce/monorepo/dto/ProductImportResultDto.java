package com.commerce.monorepo.dto;

import java.util.List;

/**
 * Excel ürün aktarımı sonuç raporu.
 */
public record ProductImportResultDto(
        int successCount,
        int errorCount,
        List<ImportErrorRow> errors
) {
    public record ImportErrorRow(int rowNumber, String productName, String errorMessage) {}
}
