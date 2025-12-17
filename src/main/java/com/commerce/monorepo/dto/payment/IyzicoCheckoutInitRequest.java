package com.commerce.monorepo.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IyzicoCheckoutInitRequest {
    @NotNull
    private Long orderId;
    /**
     * Opsiyonel override; boş ise iyzico.callback-url property kullanılır.
     */
    private String callbackUrl;
}

