package com.commerce.monorepo.dto.payment;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BankTransferInitResponse {
    private Long orderId;
    private String orderNumber;
    private BigDecimal amount;
    private String iban;
    private String accountHolder;
    private String bankName;
    private String description;
    private String deadlineHours;
    private String message;
}
