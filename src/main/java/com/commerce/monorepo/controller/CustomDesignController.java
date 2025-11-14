package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.CustomDesignDto;
import com.commerce.monorepo.dto.CustomDesignCreateRequest;
import com.commerce.monorepo.dto.CustomDesignUpdateRequest;
import com.commerce.monorepo.entity.CustomDesign;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.service.CustomDesignService;
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

    @RateLimit(key = "design:create", limit = 10, windowSeconds = 60, perUser = true)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomDesignDto> createDesign(@Valid @RequestBody CustomDesignCreateRequest dto) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customDesignService.createDesign(dto, userEmail));
    }

    @RateLimit(key = "design:update", limit = 20, windowSeconds = 60, perUser = true)
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public CustomDesignDto updateDesign(@PathVariable Long id, @Valid @RequestBody CustomDesignUpdateRequest dto) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return customDesignService.updateDesign(id, dto, userEmail);
    }

    @RateLimit(key = "design:submit", limit = 10, windowSeconds = 60, perUser = true)
    @PostMapping("/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public CustomDesignDto submitDesign(@PathVariable Long id) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return customDesignService.submitDesign(id, userEmail);
    }

    @RateLimit(key = "design:get", limit = 60, windowSeconds = 60, perUser = true)
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public CustomDesignDto getDesign(@PathVariable Long id) {
        return customDesignService.getDesign(id);
    }

    @RateLimit(key = "design:list-my", limit = 30, windowSeconds = 60, perUser = true)
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CustomDesignDto>> getMyDesigns() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CustomDesign> designs = customDesignService.findByUserId(currentUser.getId());

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

    @RateLimit(key = "design:admin:listByStatus", limit = 20, windowSeconds = 60, perUser = true)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<CustomDesignDto> getDesignsByStatus(@PathVariable String status, @PageableDefault(size = 20) Pageable pageable) {
        return customDesignService.getDesignsByStatus(status, pageable);
    }

    @RateLimit(key = "design:admin:approve", limit = 30, windowSeconds = 60, perUser = true)
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomDesignDto approveDesign(@PathVariable Long id) {
        return customDesignService.approveDesign(id);
    }

    @RateLimit(key = "design:admin:reject", limit = 30, windowSeconds = 60, perUser = true)
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomDesignDto rejectDesign(@PathVariable Long id, @RequestParam String reason) {
        return customDesignService.rejectDesign(id, reason);
    }

    @RateLimit(key = "design:admin:startProduction", limit = 30, windowSeconds = 60, perUser = true)
    @PutMapping("/{id}/start-production")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomDesignDto startProduction(@PathVariable Long id) {
        return customDesignService.startProduction(id);
    }
}
