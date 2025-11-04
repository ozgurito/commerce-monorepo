package com.commerce.api.domain;

public enum OrderStatus {
    PENDING,      // Ödeme bekliyor
    PAID,         // Ödeme yapıldı
    PROCESSING,   // Hazırlanıyor
    SHIPPED,      // Kargoya verildi
    DELIVERED,    // Teslim edildi
    CANCELLED,    // İptal edildi
    REFUNDED      // İade edildi
}