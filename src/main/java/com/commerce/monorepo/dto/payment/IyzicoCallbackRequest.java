package com.commerce.monorepo.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IyzicoCallbackRequest {
    @NotBlank
    private String token;
}

