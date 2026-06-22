package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.Category;
import com.commerce.monorepo.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * R7 Aşama 1 — Arama kelimesini KATEGORİYE çözer.
 *
 * Sorun: ürün adı/açıklamasında alt-dizgi LIKE yapıldığında "tshirt" → "sweatshirt" (swea<b>tshirt</b>)
 * eşleşiyordu. Çözüm: aranan kelimeyi ürün adında değil, eşanlamlı harita + canlı kategori listesi
 * üzerinden kategoriye çözmek. Böylece "tişört" yalnızca T-Shirt kategorisini getirir.
 *
 * Türkçe-İngilizce köprüsü eşanlamlı gruplarla kurulur (tişört ↔ tshirt aynı kategoriye işaret eder).
 */
@Component
@RequiredArgsConstructor
public class SearchCategoryResolver {

    private final CategoryRepository categoryRepository;

    // Eşanlamlı gruplar (normalize edilmiş). Her grubun üyeleri aynı kategoriye işaret eder.
    // Kategori, normalize edilmiş adı/slug'ı bu gruptan birine eşleşen kayıttır.
    private static final List<Set<String>> SYNONYM_GROUPS = List.of(
            Set.of("tshirt", "tisort"),            // tişört, t-shirt, tshirt, tisort
            Set.of("sweatshirt", "sweat"),         // sweatshirt, sweat
            Set.of("esofman", "esortman"),         // eşofman, esofman, eşortman
            Set.of("sort", "short"),               // şort, sort, short
            Set.of("hoodie", "kapusonlu", "kapsonlu") // hoodie, kapüşonlu
    );

    /**
     * Türkçe-duyarlı normalize: küçült, Türkçe karakterleri sadeleştir (ş→s, ı→i ...),
     * aksanları kaldır, harf/rakam dışını at. "T-Shirt"→"tshirt", "tişört"→"tisort", "Eşofman"→"esofman".
     */
    static String normalize(String s) {
        if (s == null) return "";
        String lower = s.toLowerCase(Locale.ROOT)
                .replace('ı', 'i').replace('ş', 's').replace('ç', 'c')
                .replace('ö', 'o').replace('ü', 'u').replace('ğ', 'g');
        lower = Normalizer.normalize(lower, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return lower.replaceAll("[^a-z0-9]", "");
    }

    // R7 Aşama 2 — Bilinen renk adları (FilterSidebar COLORS ile aynı). normalize(ad) → kanonik ad.
    private static final Map<String, String> COLOR_BY_NORM = buildColorMap();

    private static Map<String, String> buildColorMap() {
        String[] colors = {
                "Siyah", "Beyaz", "Lacivert", "Kırmızı", "Mavi", "Yeşil", "Gri", "Bej",
                "Kahve", "Kahverengi", "Pembe", "Haki", "Ekru", "Sarı", "Turuncu", "Mor", "Bordo", "Antrasit"
        };
        Map<String, String> m = new HashMap<>();
        for (String c : colors) m.put(normalize(c), c);
        return m;
    }

    private Optional<Set<String>> groupFor(String normToken) {
        return SYNONYM_GROUPS.stream().filter(g -> g.contains(normToken)).findFirst();
    }

    /**
     * Tek bir kelimeyi bilinen bir renge çözmeye çalışır ("kırmızı" → "Kırmızı").
     * @return kanonik renk adı veya boş
     */
    public Optional<String> resolveTokenToColor(String token) {
        String norm = normalize(token);
        if (norm.isEmpty()) return Optional.empty();
        return Optional.ofNullable(COLOR_BY_NORM.get(norm));
    }

    /**
     * Tek bir kelimeyi (token) aktif bir kategoriye çözmeye çalışır.
     * Eşleşme: token'ın eşanlamlı grubu ile kategori adının/slug'ının normalize hali kesişiyorsa.
     *
     * @return eşleşen kategori id'si veya boş
     */
    public Optional<Long> resolveTokenToCategory(String token) {
        String norm = normalize(token);
        if (norm.isEmpty()) return Optional.empty();

        // Token bir eşanlamlı gruba aitse o grubun tüm anahtarlarıyla, değilse sadece kendisiyle ara.
        Set<String> keys = groupFor(norm).orElse(Set.of(norm));

        for (Category c : categoryRepository.findAll()) {
            if (Boolean.FALSE.equals(c.getIsActive())) continue;
            if (keys.contains(normalize(c.getName())) || keys.contains(normalize(c.getSlug()))) {
                return Optional.of(c.getId());
            }
        }
        return Optional.empty();
    }
}
