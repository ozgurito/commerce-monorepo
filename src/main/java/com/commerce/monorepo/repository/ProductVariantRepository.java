package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdAndIsActiveTrue(Long productId);
    boolean existsBySku(String sku);
}

