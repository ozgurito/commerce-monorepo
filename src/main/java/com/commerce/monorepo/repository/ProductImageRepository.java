package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.ProductImage;
import com.commerce.monorepo.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderByDisplayOrder(Long productId);

    /** Bir varyanta bağlı ilk görseli döner (displayOrder'a göre) */
    Optional<ProductImage> findFirstByVariantOrderByDisplayOrderAsc(ProductVariant variant);

    /** Variant ID ile arama (lazy-load olmadan) */
    @Query("SELECT pi FROM ProductImage pi WHERE pi.variant.id = :variantId ORDER BY pi.displayOrder ASC")
    List<ProductImage> findByVariantIdOrderByDisplayOrder(@Param("variantId") Long variantId);

    /**
     * Ürün + renk adı ile arama.
     * Import sırasında her rengin sadece 1 varyantına görsel bağlanır,
     * bu sorgu tüm beden varyantları için doğru renk görselini döner.
     */
    @Query("SELECT pi FROM ProductImage pi WHERE pi.product.id = :productId AND pi.variant.color = :color ORDER BY pi.displayOrder ASC")
    List<ProductImage> findByProductIdAndVariantColorOrderByDisplayOrder(
            @Param("productId") Long productId, @Param("color") String color);
}

