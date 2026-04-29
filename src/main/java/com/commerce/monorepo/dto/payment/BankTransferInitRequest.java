package com.commerce.monorepo.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BankTransferInitRequest {
    @NotNull(message = "Sipariş ID zorunludur")
    private Long orderId;
}
