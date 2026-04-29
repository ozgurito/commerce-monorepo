package com.commerce.monorepo.entity;

public enum PaymentStatus {
    WAITING,           // Ödeme bekleniyor (genel)
    INITIATED,         // iyzico checkout formu başlatıldı
    WAITING_TRANSFER,  // Havale/EFT bekleniyor
    WAITING_COD,       // Kapıda ödeme bekleniyor
    PAID,              // Ödeme alındı
    FAILED,            // Ödeme başarısız
    REFUNDED           // İade edildi
}

