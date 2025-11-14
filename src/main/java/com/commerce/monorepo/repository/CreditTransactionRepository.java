package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.CreditTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    List<CreditTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<CreditTransaction> findByUserId(Long userId, Pageable pageable);
}

