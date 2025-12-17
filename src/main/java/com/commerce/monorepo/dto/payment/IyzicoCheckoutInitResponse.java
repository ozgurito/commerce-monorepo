package com.commerce.monorepo.dto.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IyzicoCheckoutInitResponse {
    private String token;
    private String paymentPageUrl;
    private String conversationId;
    private String orderNumber;
    private String basketId;
    private String expiresAt;
}

