package com.commerce.monorepo.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignTrackingRequest(
        @NotBlank(message = "Kargo firması boş olamaz")
        String carrier,

        @NotBlank(message = "Takip numarası boş olamaz")
        String trackingNumber
) {}
