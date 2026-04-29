package com.commerce.monorepo.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BankTransferCallbackRequest {
    @NotBlank(message = "Sipariş numarası zorunludur")
    private String orderNumber;
    private String adminNote;
}
