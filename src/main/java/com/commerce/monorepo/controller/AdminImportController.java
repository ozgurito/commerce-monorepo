package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.ProductImportResultDto;
import com.commerce.monorepo.service.ProductImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Product Import", description = "Excel ile toplu ürün aktarımı")
public class AdminImportController {

    private final ProductImportService productImportService;

    /**
     * Excel (.xlsx) dosyası ile toplu ürün aktarımı.
     *
     * Beklenen sütun başlıkları (büyük-küçük harf duyarsız, sıra önemli değil):
     *   name*, price*, stock*, description, comparePrice, sku, category,
     *   imageUrls (virgülle ayrılmış), featured, material, gender, season,
     *   fitType, fabricComposition, careInstructions, modelInfo, sizeGuide,
     *   originCountry, ageGroup
     *   (* zorunlu)
     *
     * Örnek:
     *   curl -X POST /api/admin/products/import \
     *        -H "Authorization: Bearer <token>" \
     *        -F "file=@urunler.xlsx"
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Excel ile toplu ürün aktar",
        description = "Bir .xlsx dosyasını yükleyerek ürünleri toplu olarak sisteme aktarır. Başarı ve hata satırları detaylı raporlanır."
    )
    public ResponseEntity<ProductImportResultDto> importProducts(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ProductImportResultDto(0, 1,
                    List.of(new ProductImportResultDto.ImportErrorRow(0, "", "Dosya boş")))
            );
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body(
                new ProductImportResultDto(0, 1,
                    List.of(new ProductImportResultDto.ImportErrorRow(0, "", "Sadece .xlsx dosyası kabul edilir")))
            );
        }

        ProductImportResultDto result = productImportService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
}
