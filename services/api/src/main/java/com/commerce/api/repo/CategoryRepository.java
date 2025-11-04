package com.commerce.api.repo;

import com.commerce.api.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByIsActiveTrueOrderByDisplayOrder();
    List<Category> findByParentIdIsNull();
    List<Category> findByParentId(Long parentId);
}

