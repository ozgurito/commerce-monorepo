package com.commerce.monorepo.dto;

import java.util.List;

/**
 * Excel içe aktarma — bir Excel satırından ayrıştırılmış varyant verisi.
 * Apache POI'den bağımsızdır (Row/Cell taşımaz) — parse ve persist katmanlarını ayırır.
 */
public record ParsedVariantRow(
        String barkod,
        String renk,
        String beden,
        int stock,
        List<String> imageUrls
) {}
