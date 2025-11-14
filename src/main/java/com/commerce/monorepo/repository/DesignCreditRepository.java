package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.DesignCredit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DesignCreditRepository extends JpaRepository<DesignCredit, Long> {
    Optional<DesignCredit> findByUserId(Long userId);
}

