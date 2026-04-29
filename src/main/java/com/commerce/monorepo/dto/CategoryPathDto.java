package com.commerce.monorepo.dto;

/**
 * Kategori breadcrumb için yol elemanı.
 * GET /api/categories/{id}/path → [{id, name, slug}, ...] kökten yaprağa
 */
public record CategoryPathDto(Long id, String name, String slug) {}
