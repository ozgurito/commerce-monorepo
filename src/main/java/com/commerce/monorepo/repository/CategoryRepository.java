package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByIsActiveTrueOrderByDisplayOrder();
    List<Category> findByParentIdIsNull();
    List<Category> findByParentId(Long parentId);
    
    // Alt kategorileri bul (recursive için)
    @Query("SELECT c.id FROM Category c WHERE c.parent.id = :parentId")
    List<Long> findChildCategoryIds(@Param("parentId") Long parentId);
    
    // Alt kategorileri dahil tüm ID'leri bul (1 seviye)
    @Query("SELECT c.id FROM Category c WHERE c.id = :categoryId OR c.parent.id = :categoryId")
    List<Long> findCategoryAndChildIds(@Param("categoryId") Long categoryId);

    // İsme göre arama - Excel import için
    Optional<Category> findByNameIgnoreCase(String name);
}

