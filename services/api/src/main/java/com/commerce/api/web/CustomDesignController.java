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
import com.commerce.api.domain.User;
import com.commerce.api.repo.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/custom-designs")
public class CustomDesignController {
    
    private final CustomDesignService customDesignService;
    private final UserRepository userRepository;
    
    public CustomDesignController(CustomDesignService customDesignService, UserRepository userRepository) {
        this.customDesignService = customDesignService;
        this.userRepository = userRepository;
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
    
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CustomDesignDto>> getMyDesigns() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<com.commerce.api.domain.CustomDesign> designs = customDesignService.findByUserId(currentUser.getId());
        
        List<CustomDesignDto> dtos = designs.stream()
            .map(design -> new CustomDesignDto(
                design.getId(),
                design.getUser() != null ? design.getUser().getId() : null,
                design.getDesignName(),
                design.getProductType(),
                design.getBaseProduct() != null ? design.getBaseProduct().getId() : null,
                design.getDesignData(),
                design.getThumbnailUrl(),
                design.getPreviewImages(),
                design.getQuantity(),
                design.getUnitPrice(),
                design.getTotalPrice(),
                design.getSize(),
                design.getColor(),
                design.getStatus(),
                design.getCreditsUsed(),
                design.getCreatedAt()
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/my-designs")
    @PreAuthorize("isAuthenticated()")
    public List<CustomDesignDto> getMyDesignsOld() {
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

