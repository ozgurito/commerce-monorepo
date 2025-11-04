package com.commerce.api.repo;

import com.commerce.api.domain.DesignTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignTemplateRepository extends JpaRepository<DesignTemplate, Long> {
    List<DesignTemplate> findByIsActiveTrueAndIsFeaturedTrue();
    List<DesignTemplate> findByCategoryAndIsActiveTrue(String category);
}

