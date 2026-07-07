package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ParsedProductGroup;
import com.commerce.monorepo.dto.ParsedVariantRow;
import com.commerce.monorepo.dto.ProductImportResultDto;
import com.commerce.monorepo.dto.ProductImportResultDto.ImportErrorRow;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;

/**
 * Trendyol Excel şablonundan toplu ürün + varyant içe aktarımı.
 *
 * Şablon sütunları (header satırı — sıra değişebilir, isme göre eşleştirilir):
 *   Barkod | Model Kodu | Ürün Rengi | Beden | Cinsiyet | Marka |
 *   Kategori İsmi | Tedarikçi Stok Kodu | Ürün Adı | Ürün Açıklaması |
 *   Ürünün Fiyatı | Ürün Stok Adedi | Görsel 1 … Görsel 5
 *
 * Varyant Modeli — "Kombine SKU":
 *   Her Excel satırı = TEK bir ProductVariant (renk + beden birlikte aynı objeye).
 *   Aynı Model Kodu'na ait satırlar tek bir Ana Ürün (Product) altında gruplanır.
 *
 *   Örnek:
 *     Barkod  | Model Kodu | Ürün Rengi | Beden
 *     BAR001  | MODEL-A    | Lacivert   | M      → Variant{color=Lacivert, size=M, sku=BAR001}
 *     BAR002  | MODEL-A    | Lacivert   | L      → Variant{color=Lacivert, size=L, sku=BAR002}
 *     BAR003  | MODEL-A    | Beyaz      | M      → Variant{color=Beyaz,    size=M, sku=BAR003}
 *                   ↳ Hepsi aynı Product'a bağlı, her biri ayrı ProductVariant kaydı
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImportService {

    private final ProductRepository        productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImportRowService  productImportRowService;

    // ── Excel sütun başlıkları (Türkçe) — normalize edilmiş lookup anahtarları ──
    // Not: norm() önce Türkçe→Latin dönüşümü yapar, sonra ENGLISH locale ile küçük harf,
    //      ardından boşlukları kaldırır. JVM locale'inden bağımsız çalışır.
    private static final String C_BARKOD   = norm("Barkod");
    private static final String C_MODEL    = norm("Model Kodu");
    private static final String C_RENK     = norm("Urun Rengi");    // Ü/ü zaten dönüştürüldü
    private static final String C_BEDEN    = norm("Beden");
    private static final String C_CINSIYET = norm("Cinsiyet");
    private static final String C_KATEGORI = norm("Kategori Ismi"); // İ/ı zaten dönüştürüldü
    private static final String C_AD       = norm("Urun Adi");      // Ürün Adı normalize
    private static final String C_ACIKLAMA = norm("Urun Aciklamasi");
    private static final String C_FIYAT    = norm("Ununun Fiyati"); // Ürünün Fiyatı normalize
    private static final String C_STOK     = norm("Urun Stok Adedi");
    // Görsel sütunları: norm("Gorsel 1") .. norm("Gorsel 5") — döngüde hesaplanır

    // ────────────────────────────────────────────────────────────────────────────

    /**
     * NOT: Kasıtlı olarak {@code @Transactional} DEĞİL. Bu metod sadece Excel'i okuyup
     * gruplara ayırıyor (salt-okunur ön kontroller hariç yazma yapmıyor); asıl kayıt
     * her grup için ayrı ayrı {@link ProductImportRowService#persistGroup} üzerinden,
     * kendi bağımsız (REQUIRES_NEW) transaction'ında gerçekleşir. Bu metodu transactional
     * yapmak, tüm grupları tekrar TEK bir transaction'a sokup aynı zincirleme hata riskini
     * geri getirirdi.
     */
    public ProductImportResultDto importFromExcel(MultipartFile file) throws IOException {
        List<ImportErrorRow> errors = new ArrayList<>();
        int successCount = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Tüm satırları listeye al
            List<Row> allRows = new ArrayList<>();
            for (Row r : sheet) allRows.add(r);

            if (allRows.isEmpty()) {
                return makeResult(0, List.of(new ImportErrorRow(0, "", "Excel dosyası boş")));
            }

            // ── 1. Başlık satırını oku ─────────────────────────────────────────
            Row headerRow = allRows.get(0);
            Map<String, Integer> col = buildColumnIndex(headerRow);

            // Debug: hangi sütunlar bulundu?
            log.info("Excel sütun haritası (normalize): {}", col);

            // Zorunlu sütun kontrolü — bulunamazsa içerik yerine hangi anahtar eksik bildir
            for (String key : List.of(C_AD, C_FIYAT, C_STOK, C_MODEL)) {
                if (!col.containsKey(key)) {
                    String mevcut = String.join(", ", col.keySet());
                    return makeResult(0, List.of(new ImportErrorRow(1, "",
                            "Zorunlu sütun bulunamadı (normalize key: '" + key + "'). " +
                            "Algılanan sütunlar: [" + mevcut + "]")));
                }
            }

            // ── 2. Veri satırlarını Model Kodu'na göre grupla ──────────────────
            Map<String, List<Row>> groups = new LinkedHashMap<>();
            for (int i = 1; i < allRows.size(); i++) {
                Row row = allRows.get(i);
                if (isRowEmpty(row)) continue;
                String modelKodu = cellStr(row, col.get(C_MODEL)).trim();
                if (!modelKodu.isBlank()) {
                    groups.computeIfAbsent(modelKodu, k -> new ArrayList<>()).add(row);
                }
            }

            if (groups.isEmpty()) {
                return makeResult(0, List.of(new ImportErrorRow(2, "", "Geçerli veri satırı bulunamadı")));
            }

            log.info("Toplam {} farklı Model Kodu (ürün) bulundu", groups.size());

            // ── 3. Her Model Kodu grubu → 1 Product + N Variant (kombine SKU) ──
            for (Map.Entry<String, List<Row>> entry : groups.entrySet()) {
                String     modelKodu  = entry.getKey();
                List<Row>  rows       = entry.getValue();
                Row        firstRow   = rows.get(0);
                int        firstRowNo = firstRow.getRowNum() + 1;
                String     urunAdi   = "";

                try {
                    // Ürün adı (ilk satırdan alınır, tüm grup için ortaktır)
                    urunAdi = cellStr(firstRow, col.get(C_AD)).trim();
                    if (urunAdi.isBlank()) {
                        errors.add(new ImportErrorRow(firstRowNo, modelKodu, "Ürün adı boş"));
                        continue;
                    }

                    // Fiyat (ilk satırdan)
                    String priceStr = cellStr(firstRow, col.get(C_FIYAT)).replace(",", ".");
                    if (priceStr.isBlank()) {
                        errors.add(new ImportErrorRow(firstRowNo, urunAdi, "Fiyat boş"));
                        continue;
                    }
                    BigDecimal price = new BigDecimal(priceStr);

                    // Model Kodu (Product.sku, unique) zaten kayıtlı mı? — bu kontrol
                    // eksikti; kontrolsüz save() unique constraint ihlali fırlatıp
                    // (eski kodda) TÜM sonraki grupları da zincirleme başarısız ediyordu.
                    if (productRepository.existsBySku(modelKodu)) {
                        errors.add(new ImportErrorRow(firstRowNo, urunAdi,
                                "Model Kodu zaten kayıtlı: " + modelKodu));
                        continue;
                    }

                    // Duplicate barkod ön kontrolü (variant SKU zaten DB'de var mı?)
                    boolean hasDuplicate = false;
                    for (Row row : rows) {
                        String barkod = cellStr(row, col.get(C_BARKOD)).trim();
                        if (!barkod.isBlank() && productVariantRepository.existsBySku(barkod)) {
                            errors.add(new ImportErrorRow(row.getRowNum() + 1, urunAdi,
                                    "Barkod zaten kayıtlı: " + barkod));
                            hasDuplicate = true;
                        }
                    }
                    if (hasDuplicate) continue;

                    // Toplam stok = gruptaki tüm satırların stoklarının toplamı
                    int totalStock = rows.stream()
                            .mapToInt(r -> parseIntSafe(cellStr(r, col.get(C_STOK))))
                            .sum();

                    String description = col.containsKey(C_ACIKLAMA)
                            ? cellStr(firstRow, col.get(C_ACIKLAMA)).trim() : null;
                    String gender = col.containsKey(C_CINSIYET)
                            ? cellStr(firstRow, col.get(C_CINSIYET)).trim() : null;
                    String categoryName = col.containsKey(C_KATEGORI)
                            ? cellStr(firstRow, col.get(C_KATEGORI)).trim() : null;

                    // ── Excel satırlarını POI'den bağımsız düz veriye çevir ──
                    //
                    //  ┌─ satır ─────────────────────────────────────────────┐
                    //  │ Barkod=BAR001 | Ürün Rengi=Lacivert | Beden=M      │
                    //  └──────────────────────────────────────────────────────┘
                    //                        ↓
                    //  ParsedVariantRow { color="Lacivert", size="M", sku="BAR001" }
                    //
                    //  color ve size AYNI satıra yazılır. Hiçbir zaman
                    //  color-only veya size-only ayrı kayıt oluşturulmaz.
                    List<ParsedVariantRow> variantRows = new ArrayList<>();
                    for (Row row : rows) {
                        String renk   = col.containsKey(C_RENK)
                                ? cellStr(row, col.get(C_RENK)).trim() : "";
                        String beden  = col.containsKey(C_BEDEN)
                                ? cellStr(row, col.get(C_BEDEN)).trim() : "";
                        String barkod = col.containsKey(C_BARKOD)
                                ? cellStr(row, col.get(C_BARKOD)).trim() : "";
                        int varStock  = parseIntSafe(cellStr(row, col.get(C_STOK)));

                        List<String> imageUrls = new ArrayList<>();
                        for (int n = 1; n <= 5; n++) {
                            String gorselKey = norm("Gorsel " + n);
                            if (!col.containsKey(gorselKey)) continue;
                            String url = cellStr(row, col.get(gorselKey)).trim();
                            if (!url.isBlank()) imageUrls.add(url);
                        }

                        variantRows.add(new ParsedVariantRow(barkod, renk, beden, varStock, imageUrls));
                    }

                    ParsedProductGroup group = new ParsedProductGroup(
                            modelKodu, urunAdi, price, totalStock,
                            description, gender, categoryName, variantRows);

                    // ── Asıl kayıt — kendi bağımsız (REQUIRES_NEW) transaction'ında ──
                    // Bu satırda gerçek bir DB hatası oluşsa bile SADECE bu grup etkilenir;
                    // önceki/sonraki gruplar tamamen bağımsız kalır (bkz. ProductImportRowService).
                    productImportRowService.persistGroup(group);

                    successCount++;

                } catch (NumberFormatException e) {
                    errors.add(new ImportErrorRow(firstRowNo, urunAdi,
                            "Sayısal alan hatası: " + e.getMessage()));
                } catch (Exception e) {
                    errors.add(new ImportErrorRow(firstRowNo, urunAdi,
                            "Beklenmeyen hata: " + e.getMessage()));
                    log.warn("Import hatası — model={}, satır={}: {}", modelKodu, firstRowNo, e.getMessage(), e);
                }
            }
        }

        log.info("Excel import tamamlandı — başarı: {}, hata: {}", successCount, errors.size());
        return makeResult(successCount, errors);
    }

    // ── Yardımcı metodlar ──────────────────────────────────────────────────────

    /**
     * Başlık satırından normalize-anahtar → sütun-indeks haritası oluşturur.
     * Tüm anahtarlar norm() ile normalize edilir → JVM locale'inden bağımsız eşleşme.
     */
    private Map<String, Integer> buildColumnIndex(Row header) {
        Map<String, Integer> map = new HashMap<>();
        for (Cell cell : header) {
            String raw = cellValue(cell).trim();
            if (!raw.isBlank()) {
                String key = norm(raw);
                map.put(key, cell.getColumnIndex());
            }
        }
        return map;
    }

    /** Row + colIdx → String (null-safe) */
    private String cellStr(Row row, Integer colIdx) {
        if (row == null || colIdx == null) return "";
        Cell c = row.getCell(colIdx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return cellValue(c);
    }

    /** Cell → String dönüşümü (tüm hücre tipleri desteklenir) */
    private String cellValue(Cell c) {
        if (c == null) return "";
        return switch (c.getCellType()) {
            case STRING  -> c.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(c)) yield "";
                double v = c.getNumericCellValue();
                // Tam sayıyı "1234" olarak döndür (double precision notasyonu olmadan)
                yield v == Math.floor(v) && !Double.isInfinite(v)
                        ? String.valueOf((long) v)
                        : String.valueOf(v);
            }
            case BOOLEAN -> String.valueOf(c.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield c.getCachedFormulaResultType() == CellType.NUMERIC
                            ? String.valueOf((long) c.getNumericCellValue())
                            : c.getStringCellValue();
                } catch (Exception e) { yield ""; }
            }
            default -> "";
        };
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (Cell c : row) {
            if (c != null && c.getCellType() != CellType.BLANK
                    && !cellValue(c).isBlank()) return false;
        }
        return true;
    }

    private int parseIntSafe(String s) {
        if (s == null || s.isBlank()) return 0;
        try { return (int) Double.parseDouble(s.replace(",", ".").trim()); }
        catch (NumberFormatException e) { return 0; }
    }

    /**
     * Türkçe karakter normalizasyonu — JVM locale BAĞIMSIZ.
     *
     * Sorun: Java'nın varsayılan toLowerCase() metodu JVM locale'ine göre farklı
     * davranır. Türkçe locale'de 'I' → 'ı' (undotted), 'İ' → 'i' olur.
     * Bu fonksiyon önce Türkçe→Latin dönüşümünü elle yapar, sonra
     * Locale.ENGLISH ile toLowerCase() çağırır.
     *
     * Sonuç: "Ürün Rengi" her ortamda → "urunrengi" olur.
     */
    private static String norm(String s) {
        if (s == null) return "";
        // Adım 1: Türkçe karakterleri karşılıklarıyla değiştir (büyük + küçük)
        String r = s
                .replace('İ', 'I').replace('ı', 'i')   // dotted I / undotted i
                .replace('Ğ', 'G').replace('ğ', 'g')
                .replace('Ü', 'U').replace('ü', 'u')
                .replace('Ş', 'S').replace('ş', 's')
                .replace('Ö', 'O').replace('ö', 'o')
                .replace('Ç', 'C').replace('ç', 'c');
        // Adım 2: ASCII olmayan kalan karakterleri temizle (Unicode combining vb.)
        r = Normalizer.normalize(r, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "");
        // Adım 3: ENGLISH locale ile küçük harf + boşluk kaldır
        return r.toLowerCase(Locale.ENGLISH)
                .replaceAll("\\s+", "");
    }

    private ProductImportResultDto makeResult(int success, List<ImportErrorRow> errors) {
        return new ProductImportResultDto(success, errors.size(), errors);
    }
}
