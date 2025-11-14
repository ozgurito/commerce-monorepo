package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.DesignCreditDto;
import com.commerce.monorepo.dto.CreditTransactionDto;
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
    
    @GetMapping("/balance")
    @PreAuthorize("isAuthenticated()")
    public DesignCreditDto getMyCredits() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return designCreditService.getUserCredits(userEmail);
    }
    
    @GetMapping("/transactions")
    @PreAuthorize("isAuthenticated()")
    public List<CreditTransactionDto> getMyTransactions() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return designCreditService.getUserTransactions(userEmail);
    }
    
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

