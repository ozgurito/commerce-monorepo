package com.commerce.monorepo.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CardPaymentInitRequest {
    @NotNull
    private Long orderId;
    /**
     * Opsiyonel override; boş ise ödeme sağlayıcısının varsayılan callback-url ayarı kullanılır.
     */
    private String callbackUrl;
}
