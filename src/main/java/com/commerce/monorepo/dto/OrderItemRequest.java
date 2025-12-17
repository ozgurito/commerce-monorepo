package com.commerce.monorepo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    // Ürün ID - opsiyonel (variant varsa variant'tan alınır)
    private Long productId;

    // Variant ID - tekstil için zorunlu (beden/renk)
    @NotNull(message = "Variant ID gerekli (beden/renk seçimi yapın)")
    private Long variantId;

    @NotNull(message = "Miktar gerekli")
    @Min(value = 1, message = "Miktar en az 1 olmalı")
    private Integer quantity;
}