package com.commerce.api.service;

import com.commerce.api.domain.CustomDesign;
import com.commerce.api.domain.User;
import com.commerce.api.domain.Product;
import com.commerce.api.dto.CustomDesignDto;
import com.commerce.api.dto.CustomDesignCreateRequest;
import com.commerce.api.dto.CustomDesignUpdateRequest;
import com.commerce.api.repo.CustomDesignRepository;
import com.commerce.api.repo.UserRepository;
import com.commerce.api.repo.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomDesignService {
    
    private final CustomDesignRepository customDesignRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    public CustomDesignService(CustomDesignRepository customDesignRepository, UserRepository userRepository,
                               ProductRepository productRepository) {
        this.customDesignRepository = customDesignRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }
    
    public CustomDesignDto createDesign(CustomDesignCreateRequest dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        
        Product baseProduct = null;
        if (dto.baseProductId() != null) {
            baseProduct = productRepository.findById(dto.baseProductId())
                    .orElseThrow(() -> new java.util.NoSuchElementException("Base product not found"));
        }
        
        CustomDesign design = new CustomDesign();
        design.setUser(user);
        design.setDesignName(dto.designName());
        design.setProductType(dto.productType());
        design.setBaseProduct(baseProduct);
        design.setDesignData(dto.designData());
        design.setThumbnailUrl(dto.thumbnailUrl());
        design.setPreviewImages(dto.previewImages());
        design.setQuantity(dto.quantity());
        design.setUnitPrice(dto.unitPrice());
        design.setTotalPrice(dto.unitPrice().multiply(BigDecimal.valueOf(dto.quantity())));
        design.setSize(dto.size());
        design.setColor(dto.color());
        design.setStatus("draft");
        
        CustomDesign saved = customDesignRepository.save(design);
        return mapToDto(saved);
    }
    
    public CustomDesignDto updateDesign(Long id, CustomDesignUpdateRequest dto, String userEmail) {
        CustomDesign design = customDesignRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Design not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        
        if (!design.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this design");
        }
        
        if (dto.designName() != null) design.setDesignName(dto.designName());
        if (dto.designData() != null) design.setDesignData(dto.designData());
        if (dto.thumbnailUrl() != null) design.setThumbnailUrl(dto.thumbnailUrl());
        if (dto.previewImages() != null) design.setPreviewImages(dto.previewImages());
        if (dto.quantity() != null) {
            design.setQuantity(dto.quantity());
            design.setTotalPrice(design.getUnitPrice().multiply(BigDecimal.valueOf(dto.quantity())));
        }
        if (dto.size() != null) design.setSize(dto.size());
        if (dto.color() != null) design.setColor(dto.color());
        
        CustomDesign updated = customDesignRepository.save(design);
        return mapToDto(updated);
    }
    
    public CustomDesignDto submitDesign(Long id, String userEmail) {
        CustomDesign design = customDesignRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Design not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        
        if (!design.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        if (!"draft".equals(design.getStatus())) {
            throw new IllegalArgumentException("Design already submitted");
        }
        
        design.setStatus("submitted");
        CustomDesign updated = customDesignRepository.save(design);
        return mapToDto(updated);
    }
    
    public CustomDesignDto approveDesign(Long id) {
        CustomDesign design = customDesignRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Design not found"));
        design.setStatus("approved");
        CustomDesign updated = customDesignRepository.save(design);
        return mapToDto(updated);
    }
    
    public CustomDesignDto rejectDesign(Long id, String reason) {
        CustomDesign design = customDesignRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Design not found"));
        design.setStatus("rejected");
        design.setRejectionReason(reason);
        CustomDesign updated = customDesignRepository.save(design);
        return mapToDto(updated);
    }
    
    public CustomDesignDto startProduction(Long id) {
        CustomDesign design = customDesignRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Design not found"));
        design.setStatus("in_production");
        design.setProductionStartedAt(LocalDateTime.now());
        CustomDesign updated = customDesignRepository.save(design);
        return mapToDto(updated);
    }
    
    @Transactional(readOnly = true)
    public CustomDesignDto getDesign(Long id) {
        CustomDesign design = customDesignRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Design not found"));
        return mapToDto(design);
    }
    
    public List<CustomDesign> findByUserId(Long userId) {
        return customDesignRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Transactional(readOnly = true)
    public List<CustomDesignDto> getUserDesigns(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        return customDesignRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public Page<CustomDesignDto> getDesignsByStatus(String status, Pageable pageable) {
        List<CustomDesign> allDesigns = customDesignRepository.findAll();
        List<CustomDesign> filtered = new ArrayList<>();
        for (CustomDesign d : allDesigns) {
            if (status.equals(d.getStatus())) {
                filtered.add(d);
            }
        }
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();
        int start = page * size;
        int end = Math.min(start + size, filtered.size());
        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size())
                .map(this::mapToDto);
    }
    
    private CustomDesignDto mapToDto(CustomDesign design) {
        return new CustomDesignDto(
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
        );
    }
}

