package com.commerce.api.web;

import com.commerce.api.dto.CustomDesignDto;
import com.commerce.api.dto.CustomDesignCreateRequest;
import com.commerce.api.dto.CustomDesignUpdateRequest;
import com.commerce.api.service.CustomDesignService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/custom-designs")
public class CustomDesignController {
    
    private final CustomDesignService customDesignService;
    
    public CustomDesignController(CustomDesignService customDesignService) {
        this.customDesignService = customDesignService;
    }
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomDesignDto> createDesign(@Valid @RequestBody CustomDesignCreateRequest dto) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customDesignService.createDesign(dto, userEmail));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public CustomDesignDto updateDesign(@PathVariable Long id, @Valid @RequestBody CustomDesignUpdateRequest dto) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return customDesignService.updateDesign(id, dto, userEmail);
    }
    
    @PostMapping("/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public CustomDesignDto submitDesign(@PathVariable Long id) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return customDesignService.submitDesign(id, userEmail);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public CustomDesignDto getDesign(@PathVariable Long id) {
        return customDesignService.getDesign(id);
    }
    
    @GetMapping("/my-designs")
    @PreAuthorize("isAuthenticated()")
    public List<CustomDesignDto> getMyDesigns() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return customDesignService.getUserDesigns(userEmail);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<CustomDesignDto> getDesignsByStatus(@PathVariable String status, @PageableDefault(size = 20) Pageable pageable) {
        return customDesignService.getDesignsByStatus(status, pageable);
    }
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomDesignDto approveDesign(@PathVariable Long id) {
        return customDesignService.approveDesign(id);
    }
    
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomDesignDto rejectDesign(@PathVariable Long id, @RequestParam String reason) {
        return customDesignService.rejectDesign(id, reason);
    }
    
    @PutMapping("/{id}/start-production")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomDesignDto startProduction(@PathVariable Long id) {
        return customDesignService.startProduction(id);
    }
}

