package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ParsedProductGroup;
import com.commerce.monorepo.dto.ParsedVariantRow;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.entity.ProductImage;
import com.commerce.monorepo.entity.ProductVariant;
import com.commerce.monorepo.repository.CategoryRepository;
import com.commerce.monorepo.repository.ProductImageRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Excel içe aktarma — TEK bir Model Kodu grubunun (1 Product + N Variant + görseller)
 * veritabanına yazılmasından sorumludur.
 *
 * {@code REQUIRES_NEW} ile çağrılır ki bir gruptaki gerçek bir DB hatası (örn. unique
 * constraint ihlali) SADECE bu grubun kendi transaction'ını rollback-only işaretlesin.
 * Önceden tüm gruplar {@code ProductImportService.importFromExcel()} içinde TEK bir
 * transaction'da işleniyordu — bu durumda bir gruptaki hata, Hibernate session'ını
 * zehirleyip TÜM sonraki grupların da (kendi verileri geçerli olsa dahi) "Sunucu hatası
 * oluştu" ile başarısız olmasına yol açıyordu. Bu servis tam olarak o zincirleme hatayı
 * önlemek için ayrı bir Spring bean olarak var — aynı sınıf içinde self-invocation ile
 * {@code @Transactional(REQUIRES_NEW)} çalışmaz (Spring AOP proxy sınırlaması), bu yüzden
 * ayrı bir bean gerekiyor.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImportRowService {

    private final ProductRepository        productRepository;
    private final CategoryRepository       categoryRepository;
    private final ProductImageRepository   productImageRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Product persistGroup(ParsedProductGroup group) {
        Product product = new Product();
        product.setName(group.urunAdi());
        product.setSlug(generateSlug(group.urunAdi()));
        product.setPrice(group.price());
        product.setStock(Math.max(group.totalStock(), 0));
        product.setSku(group.modelKodu());
        product.setIsActive(true);
        product.setIsFeatured(true);   // Import edilen ürünler "Yeni Gelenler"de görünsün
        product.setAllowReviews(true);

        if (group.description() != null && !group.description().isBlank()) {
            product.setDescription(group.description());
        }
        if (group.gender() != null && !group.gender().isBlank()) {
            product.setGender(group.gender());
        }
        if (group.categoryName() != null && !group.categoryName().isBlank()) {
            categoryRepository.findByNameIgnoreCase(group.categoryName())
                    .ifPresent(product::setCategory);
        }

        Product saved = productRepository.save(product);

        // ── Varyantlar: her ParsedVariantRow → TEK kombinasyon ProductVariant ──
        // renk → ilk variant eşlemesi (in-memory, DB flush sorunu yok)
        Map<String, ProductVariant> colorVariantMap = new LinkedHashMap<>();

        for (ParsedVariantRow row : group.variantRows()) {
            ProductVariant variant = new ProductVariant();
            variant.setProduct(saved);
            variant.setName(buildVariantName(row.renk(), row.beden()));
            variant.setVariantType("color-size");
            variant.setColor(row.renk().isBlank()  ? null : row.renk());
            variant.setSize(row.beden().isBlank()  ? null : row.beden());
            variant.setSku(row.barkod().isBlank()  ? null : row.barkod());
            variant.setStock(Math.max(row.stock(), 0));
            variant.setPriceModifier(BigDecimal.ZERO);
            variant.setIsActive(true);

            productVariantRepository.save(variant);

            if (!row.renk().isBlank()) {
                colorVariantMap.putIfAbsent(row.renk().toLowerCase(), variant);
            }

            log.debug("  → Variant: name='{}' color='{}' size='{}' sku='{}' stock={}",
                    variant.getName(), variant.getColor(), variant.getSize(),
                    variant.getSku(), variant.getStock());
        }

        // ── Görseller: her satırın görselleri o rengin ilk variant'ına bağlanır ──
        // Aynı rengin farklı bedenleri aynı URL'lere sahip → dedup ile sadece 1 kez kaydedilir
        Set<String> addedUrls = new LinkedHashSet<>();
        int imgOrder = 0;

        for (ParsedVariantRow row : group.variantRows()) {
            ProductVariant matchedVariant = colorVariantMap.get(row.renk().toLowerCase());

            for (String url : row.imageUrls()) {
                if (url.isBlank() || addedUrls.contains(url)) continue;

                addedUrls.add(url);
                ProductImage img = new ProductImage();
                img.setProduct(saved);
                img.setImageUrl(url);
                img.setDisplayOrder(imgOrder);
                img.setIsPrimary(imgOrder == 0);
                img.setVariant(matchedVariant); // renk-görsel bağlantısı
                if (matchedVariant != null) {
                    img.setAltText(matchedVariant.getColor()); // alt text = renk adı
                }
                productImageRepository.save(img);
                imgOrder++;
            }
        }

        log.info("✓ Ürün aktarıldı: '{}' [{}] — {} varyant, {} görsel",
                group.urunAdi(), group.modelKodu(), group.variantRows().size(), imgOrder);

        return saved;
    }

    /** "Renk - Beden" formatında varyant adı. Boş olanlar atlanır. */
    private String buildVariantName(String renk, String beden) {
        boolean hasRenk  = renk  != null && !renk.isBlank();
        boolean hasBeden = beden != null && !beden.isBlank();
        if (hasRenk && hasBeden) return renk + " - " + beden;
        if (hasRenk)             return renk;
        if (hasBeden)            return beden;
        return "Standart";
    }

    /** URL-güvenli slug üretir + UUID suffix ile çakışmayı önler */
    private String generateSlug(String name) {
        String slug = normForSlug(name).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (slug.isBlank()) slug = "urun";
        return slug + "-" + UUID.randomUUID().toString().substring(0, 5);
    }

    /**
     * Türkçe karakter normalizasyonu — ProductImportService.norm() ile birebir aynı davranış
     * (slug formatının önceki import'larla tutarlı kalması için).
     */
    private static String normForSlug(String s) {
        if (s == null) return "";
        String r = s
                .replace('İ', 'I').replace('ı', 'i')
                .replace('Ğ', 'G').replace('ğ', 'g')
                .replace('Ü', 'U').replace('ü', 'u')
                .replace('Ş', 'S').replace('ş', 's')
                .replace('Ö', 'O').replace('ö', 'o')
                .replace('Ç', 'C').replace('ç', 'c');
        r = java.text.Normalizer.normalize(r, java.text.Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "");
        return r.toLowerCase(java.util.Locale.ENGLISH).replaceAll("\\s+", "");
    }
}
