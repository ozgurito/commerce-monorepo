package com.commerce.api.domain;

public enum CartStatus {
    ACTIVE,      // Aktif sepet
    CHECKED_OUT, // Sipariş verildi
    ABANDONED,   // Terk edildi
    EXPIRED      // Süresi doldu
}