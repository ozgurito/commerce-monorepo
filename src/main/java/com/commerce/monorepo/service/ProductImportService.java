package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ProductImportResultDto;
import com.commerce.monorepo.dto.ProductImportResultDto.ImportErrorRow;
import com.commerce.monorepo.entity.Category;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.entity.ProductImage;
import com.commerce.monorepo.repository.CategoryRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Excel (.xlsx) dosyasından toplu ürün aktarımı.
 *
 * Beklenen sütun başlıkları (büyük-küçük harf duyarsız, sıra önemli değil):
 *   name, description, price, comparePrice, stock, sku, category,
 *   imageUrls (virgülle ayrılmış), featured, material, gender, season,
 *   fitType, fabricComposition, careInstructions, modelInfo, sizeGuide,
 *   originCountry, ageGroup
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImportService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    @Transactional
    public ProductImportResultDto importFromExcel(MultipartFile file) throws IOException {
        List<ImportErrorRow> errors = new ArrayList<>();
        int successCount = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (!rowIterator.hasNext()) {
                return new ProductImportResultDto(0, 1,
                        List.of(new ImportErrorRow(0, "", "Excel dosyası boş")));
            }

            // Header satırını oku — sütun adını indekse eşle
            Row headerRow = rowIterator.next();
            Map<String, Integer> colIndex = buildColumnIndex(headerRow);

            if (!colIndex.containsKey("name") || !colIndex.containsKey("price") || !colIndex.containsKey("stock")) {
                return new ProductImportResultDto(0, 1,
                        List.of(new ImportErrorRow(1, "", "Zorunlu sütunlar eksik: name, price, stock")));
            }

            int rowNum = 1;
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNum++;

                // Tamamen boş satırı atla
                if (isRowEmpty(row)) continue;

                String productName = "";
                try {
                    productName = getCellString(row, colIndex.get("name"));
                    if (productName.isBlank()) {
                        errors.add(new ImportErrorRow(rowNum, "", "name sütunu boş"));
                        continue;
                    }

                    Product product = new Product();
                    product.setName(productName.trim());
                    product.setSlug(generateSlug(productName));

                    // Fiyat
                    String priceStr = getCellString(row, colIndex.get("price")).replace(",", ".");
                    product.setPrice(new BigDecimal(priceStr));

                    // Stok
                    String stockStr = getCellString(row, colIndex.get("stock")).replace(",", ".");
                    product.setStock((int) Double.parseDouble(stockStr));

                    // Opsiyonel alanlar
                    if (colIndex.containsKey("description"))
                        product.setDescription(getCellString(row, colIndex.get("description")));

                    if (colIndex.containsKey("compareprice")) {
                        String cp = getCellString(row, colIndex.get("compareprice")).replace(",", ".");
                        if (!cp.isBlank()) product.setComparePrice(new BigDecimal(cp));
                    }

                    if (colIndex.containsKey("sku")) {
                        String sku = getCellString(row, colIndex.get("sku")).trim();
                        if (!sku.isBlank()) {
                            // SKU çakışma kontrolü
                            if (productRepository.existsBySku(sku)) {
                                errors.add(new ImportErrorRow(rowNum, productName, "SKU zaten mevcut: " + sku));
                                continue;
                            }
                            product.setSku(sku);
                        }
                    }

                    // Kategori
                    if (colIndex.containsKey("category")) {
                        String catName = getCellString(row, colIndex.get("category")).trim();
                        if (!catName.isBlank()) {
                            Optional<Category> cat = categoryRepository.findByNameIgnoreCase(catName);
                            cat.ifPresent(product::setCategory);
                        }
                    }

                    // Öne çıkan
                    if (colIndex.containsKey("featured")) {
                        String feat = getCellString(row, colIndex.get("featured")).trim().toLowerCase();
                        product.setIsFeatured(feat.equals("true") || feat.equals("1") || feat.equals("evet"));
                    }

                    // Giyim spesifik alanlar
                    setIfPresent(row, colIndex, "material", product::setMaterial);
                    setIfPresent(row, colIndex, "gender", product::setGender);
                    setIfPresent(row, colIndex, "season", product::setSeason);
                    setIfPresent(row, colIndex, "fittype", product::setFitType);
                    setIfPresent(row, colIndex, "fabriccomposition", product::setFabricComposition);
                    setIfPresent(row, colIndex, "careinstructions", product::setCareInstructions);
                    setIfPresent(row, colIndex, "modelinfo", product::setModelInfo);
                    setIfPresent(row, colIndex, "sizeguide", product::setSizeGuide);
                    setIfPresent(row, colIndex, "origincountry", product::setOriginCountry);
                    setIfPresent(row, colIndex, "agegroup", product::setAgeGroup);

                    product.setIsActive(true);
                    product.setAllowReviews(true);
                    Product saved = productRepository.save(product);

                    // Görseller
                    if (colIndex.containsKey("imageurls")) {
                        String urls = getCellString(row, colIndex.get("imageurls"));
                        if (!urls.isBlank()) {
                            String[] urlArr = urls.split(",");
                            for (int i = 0; i < urlArr.length; i++) {
                                String url = urlArr[i].trim();
                                if (!url.isBlank()) {
                                    ProductImage img = new ProductImage();
                                    img.setProduct(saved);
                                    img.setImageUrl(url);
                                    img.setDisplayOrder(i);
                                    img.setIsPrimary(i == 0);
                                    productImageRepository.save(img);
                                }
                            }
                        }
                    }

                    successCount++;
                    log.debug("Ürün aktarıldı: {} (satır {})", productName, rowNum);

                } catch (NumberFormatException e) {
                    errors.add(new ImportErrorRow(rowNum, productName, "Sayısal alan hatası: " + e.getMessage()));
                } catch (Exception e) {
                    errors.add(new ImportErrorRow(rowNum, productName, "Hata: " + e.getMessage()));
                    log.warn("Excel satır {} aktarım hatası: {}", rowNum, e.getMessage());
                }
            }
        }

        log.info("Excel import tamamlandı — başarı: {}, hata: {}", successCount, errors.size());
        return new ProductImportResultDto(successCount, errors.size(), errors);
    }

    // ---- Yardımcı metodlar ----

    private Map<String, Integer> buildColumnIndex(Row header) {
        Map<String, Integer> map = new HashMap<>();
        for (Cell cell : header) {
            String name = cell.getStringCellValue().trim().toLowerCase().replaceAll("\\s+", "");
            map.put(name, cell.getColumnIndex());
        }
        return map;
    }

    private String getCellString(Row row, Integer colIdx) {
        if (colIdx == null) return "";
        Cell cell = row.getCell(colIdx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) yield "";
                double val = cell.getNumericCellValue();
                // Tam sayı ise virgülsüz döndür
                yield val == Math.floor(val) ? String.valueOf((long) val) : String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCachedFormulaResultType() == CellType.NUMERIC
                    ? String.valueOf((long) cell.getNumericCellValue())
                    : cell.getStringCellValue();
            default -> "";
        };
    }

    private void setIfPresent(Row row, Map<String, Integer> colIndex, String key,
                               java.util.function.Consumer<String> setter) {
        if (colIndex.containsKey(key)) {
            String val = getCellString(row, colIndex.get(key)).trim();
            if (!val.isBlank()) setter.accept(val);
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private String generateSlug(String name) {
        // Türkçe karakter dönüşümü
        String slug = name.toLowerCase()
                .replace("ı", "i").replace("ğ", "g").replace("ü", "u")
                .replace("ş", "s").replace("ö", "o").replace("ç", "c")
                .replace("İ", "i").replace("Ğ", "g").replace("Ü", "u")
                .replace("Ş", "s").replace("Ö", "o").replace("Ç", "c");
        // Unicode normalize + harf dışı karakterleri tire yap
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        // Çakışma önleme: sonuna random 5 karakter ekle
        String suffix = UUID.randomUUID().toString().substring(0, 5);
        return slug + "-" + suffix;
    }
}
