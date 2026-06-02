package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdAndIsActiveTrue(Long productId);
    boolean existsByProductIdAndIsActiveTrue(Long productId);
    boolean existsBySku(String sku);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.id = :id AND pv.stock >= :quantity")
    Optional<ProductVariant> findByIdWithSufficientStock(@Param("id") Long id, @Param("quantity") Integer quantity);

    @Modifying
    @Query("UPDATE ProductVariant pv SET pv.stock = pv.stock - :quantity WHERE pv.id = :id AND pv.stock >= :quantity")
    int decreaseStock(@Param("id") Long id, @Param("quantity") Integer quantity);

    @Modifying
    @Query("UPDATE ProductVariant pv SET pv.stock = pv.stock + :quantity WHERE pv.id = :id")
    int increaseStock(@Param("id") Long id, @Param("quantity") Integer quantity);
}

