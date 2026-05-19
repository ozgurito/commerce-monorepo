package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.Product;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name, String description, Pageable pageable);
    
    Page<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndIsActiveTrue(
            String name, String description, Pageable pageable);

    /** Sadece ürün adına göre arama — autocomplete için (description'dan yanlış sonuç gelmesin) */
    Page<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);

    Optional<Product> findBySlug(String slug);
    List<Product> findByIsActiveTrueOrderByCreatedAtDesc();
    Page<Product> findByIsActiveTrue(Pageable pageable);
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();
    List<Product> findByIsFlashDealTrueAndIsActiveTrueAndFlashDealEndsAtAfter(Instant now);
    Page<Product> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    Long countByIsActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.stock <= p.lowStockThreshold AND p.isActive = true")
    List<Product> findLowStockProducts();
    
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.stock <= p.lowStockThreshold AND p.isActive = true")
    List<Product> findLowStockProductsWithCategory();
    
    // ========== YENİ METODLAR ==========
    
    // Fiyat aralığı ile arama
    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findByPriceRange(
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);
    
    // Kategori ve alt kategorileri ile arama
    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "AND p.category.id IN :categoryIds")
    Page<Product> findByCategoryIds(
            @Param("categoryIds") List<Long> categoryIds,
            Pageable pageable);
    
    // Renk ile arama (variants üzerinden)
    @Query("SELECT DISTINCT p FROM Product p JOIN p.variants v " +
           "WHERE p.isActive = true AND LOWER(v.color) IN :colors")
    Page<Product> findByColors(
            @Param("colors") List<String> colors,
            Pageable pageable);
    
    // Beden ile arama (variants üzerinden)
    @Query("SELECT DISTINCT p FROM Product p JOIN p.variants v " +
           "WHERE p.isActive = true AND v.size IN :sizes")
    Page<Product> findBySizes(
            @Param("sizes") List<String> sizes,
            Pageable pageable);
    
    // Stokta olanlar
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stock > 0")
    Page<Product> findInStock(Pageable pageable);
    
    // Min/Max fiyat
    @Query("SELECT MIN(p.price) FROM Product p WHERE p.isActive = true")
    BigDecimal findMinPrice();
    
    @Query("SELECT MAX(p.price) FROM Product p WHERE p.isActive = true")
    BigDecimal findMaxPrice();
    
    // Mevcut renkler
    @Query("SELECT DISTINCT v.color FROM ProductVariant v WHERE v.color IS NOT NULL AND v.isActive = true")
    List<String> findDistinctColors();
    
    // Mevcut bedenler
    @Query("SELECT DISTINCT v.size FROM ProductVariant v WHERE v.size IS NOT NULL AND v.isActive = true")
    List<String> findDistinctSizes();
    
    // Kategori bazlı ürün sayısı
    @Query("SELECT p.category.id, COUNT(p) FROM Product p WHERE p.isActive = true AND p.category IS NOT NULL GROUP BY p.category.id")
    List<Object[]> countByCategory();

    // İlgili ürünler - aynı kategori, mevcut ürün hariç, öne çıkanlar önce
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.id != :excludeId AND p.isActive = true ORDER BY p.isFeatured DESC, p.createdAt DESC")
    List<Product> findRelatedProducts(
            @Param("categoryId") Long categoryId,
            @Param("excludeId") Long excludeId,
            Pageable pageable);
}
