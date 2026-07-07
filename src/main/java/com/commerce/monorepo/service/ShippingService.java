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

    // Kargo politikası: 1000₺ ve üzeri (ara toplam, indirim ÖNCESİ) ücretsiz; altında sabit 100₺.
    // Ağırlık bazlı kademe kaldırıldı — ileride DB/admin paneline taşınabilir.
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("1000.00");
    private static final BigDecimal FLAT_RATE = new BigDecimal("100.00");

    /**
     * Kargo ücretini hesaplar (tutar bazlı, tek standart).
     *
     * @param orderSubtotal  Ürün ara toplamı (indirim öncesi)
     * @return               1000₺ ve üzeri → 0; altında → 100₺
     */
    public BigDecimal calculate(BigDecimal orderSubtotal) {
        if (orderSubtotal != null
                && orderSubtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0) {
            log.debug("Ücretsiz kargo uygulandı — ara toplam: {}", orderSubtotal);
            return BigDecimal.ZERO;
        }
        return FLAT_RATE;
    }

    /**
     * Ağırlık parametreli eski imza — geriye dönük uyumluluk için korunur; ağırlık artık dikkate alınmaz.
     */
    public BigDecimal calculate(BigDecimal orderSubtotal, BigDecimal weightKg) {
        return calculate(orderSubtotal);
    }

    /**
     * TODO: Gelecekte kargo API entegrasyonu buraya gelecek.
     * Yurtiçi / Aras / MNG API client çağrısı.
     */
    // public BigDecimal calculateFromApi(ShippingApiRequest req) { ... }
}
