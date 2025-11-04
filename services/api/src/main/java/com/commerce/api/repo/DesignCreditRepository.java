package com.commerce.api.repo;

import com.commerce.api.domain.DesignCredit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DesignCreditRepository extends JpaRepository<DesignCredit, Long> {
    Optional<DesignCredit> findByUserId(Long userId);
}

