package com.commerce.api.repo;

import com.commerce.api.domain.CustomDesign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomDesignRepository extends JpaRepository<CustomDesign, Long> {
    List<CustomDesign> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<CustomDesign> findByUserIdAndStatus(Long userId, String status, Pageable pageable);
    List<CustomDesign> findByStatus(String status);
}

