package com.commerce.api.repo;

import com.commerce.api.domain.Product;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // MEVCUT
    Page<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name, String desc, Pageable pageable);
    
    // YENİ METODLAR
    Optional<Product> findBySlug(String slug);
    List<Product> findByIsActiveTrueOrderByCreatedAtDesc();
    Page<Product> findByIsActiveTrue(Pageable pageable);
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();
    Page<Product> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
    boolean existsBySku(String sku);
    Long countByIsActiveTrue();
    
    @Query("SELECT p FROM Product p WHERE p.stock <= p.lowStockThreshold AND p.isActive = true")
    List<Product> findLowStockProducts();
}
