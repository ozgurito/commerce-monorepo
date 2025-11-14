package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.DesignCreditDto;
import com.commerce.monorepo.dto.CreditTransactionDto;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.DesignCreditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/credits")
public class DesignCreditController {

    private final DesignCreditService designCreditService;

    public DesignCreditController(DesignCreditService designCreditService) {
        this.designCreditService = designCreditService;
    }

    @RateLimit(key = "credits:balance", limit = 30, windowSeconds = 60, perUser = true)
    @GetMapping("/balance")
    @PreAuthorize("isAuthenticated()")
    public DesignCreditDto getMyCredits() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return designCreditService.getUserCredits(userEmail);
    }

    @RateLimit(key = "credits:transactions", limit = 20, windowSeconds = 60, perUser = true)
    @GetMapping("/transactions")
    @PreAuthorize("isAuthenticated()")
    public List<CreditTransactionDto> getMyTransactions() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return designCreditService.getUserTransactions(userEmail);
    }

    @RateLimit(key = "credits:admin:add", limit = 10, windowSeconds = 60, perUser = true)
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DesignCreditDto> addCredits(
            @RequestParam String userEmail,
            @RequestParam Integer amount,
            @RequestParam String type,
            @RequestParam String description) {

        return ResponseEntity.ok(designCreditService.addCredits(userEmail, amount, type, description));
    }
}
