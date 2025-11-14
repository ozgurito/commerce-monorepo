package com.commerce.monorepo.entity;

public enum CartStatus {
    ACTIVE,      // Aktif sepet
    CHECKED_OUT, // Sipariş verildi
    ABANDONED,   // Terk edildi
    EXPIRED      // Süresi doldu
}