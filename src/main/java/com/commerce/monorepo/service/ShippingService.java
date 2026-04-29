package com.commerce.monorepo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Kargo ücreti hesaplama servisi.
 *
 * Şu an kural tabanlı çalışır (ağırlık + sipariş tutarı).
 * İleride kargo firması API'si (Yurtiçi, Aras, MNG) ile değiştirilecek.
 * Bunu yapmak için sadece calculate() metodunu override edin.
 */
@Service
@Slf4j
public class ShippingService {

    // Sabit değerler — ileride DB tablosuna taşınabilir
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("300.00");
    private static final BigDecimal RATE_LIGHT   = new BigDecimal("29.00");  // 0–500g
    private static final BigDecimal RATE_MEDIUM  = new BigDecimal("49.00");  // 500g–2kg
    private static final BigDecimal RATE_HEAVY   = new BigDecimal("69.00");  // 2kg+

    /**
     * Kargo ücretini hesaplar.
     *
     * @param orderSubtotal  Ürün tutarı (indirim öncesi)
     * @param weightKg       Toplam ağırlık (kg). null ise orta kademe uygulanır.
     * @return               Kargo ücreti (₺). Ücretsiz kargoda 0.
     */
    public BigDecimal calculate(BigDecimal orderSubtotal, BigDecimal weightKg) {
        // 300₺ ve üzeri bedava kargo
        if (orderSubtotal != null
                && orderSubtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0) {
            log.debug("Ücretsiz kargo uygulandı — sipariş tutarı: {}", orderSubtotal);
            return BigDecimal.ZERO;
        }

        // Ağırlığa göre hesapla
        if (weightKg == null) {
            return RATE_MEDIUM;
        }

        if (weightKg.compareTo(new BigDecimal("0.5")) <= 0) {
            return RATE_LIGHT;
        } else if (weightKg.compareTo(new BigDecimal("2.0")) <= 0) {
            return RATE_MEDIUM;
        } else {
            return RATE_HEAVY;
        }
    }

    /**
     * Sadece tutar bazlı (ağırlık bilinmiyorsa) hesaplama.
     */
    public BigDecimal calculate(BigDecimal orderSubtotal) {
        return calculate(orderSubtotal, null);
    }

    /**
     * TODO: Gelecekte kargo API entegrasyonu buraya gelecek.
     * Yurtiçi / Aras / MNG API client çağrısı.
     */
    // public BigDecimal calculateFromApi(ShippingApiRequest req) { ... }
}
