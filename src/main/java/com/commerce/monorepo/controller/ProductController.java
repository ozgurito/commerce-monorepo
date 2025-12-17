package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.service.ProductService;
import com.commerce.monorepo.ratelimit.RateLimit;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;
    public ProductController(ProductService service){ this.service = service; }

    @GetMapping
    @RateLimit(key = "product:list", limit = 60, windowSeconds = 60)
    public List<ProductDto> list(){
        return service.list();
    }

    @GetMapping("/search")
    @RateLimit(key = "product:search", limit = 30, windowSeconds = 60)
    public Page<ProductDto> search(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(
                page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return service.searchProducts(q, pageable);
    }

    @GetMapping("/featured")
    @RateLimit(key = "product:featured", limit = 60, windowSeconds = 60)
    public List<ProductDto> getFeaturedProducts() {
        return service.getFeaturedProducts();
    }

    @GetMapping("/slug/{slug}")
    @RateLimit(key = "product:slug", limit = 30, windowSeconds = 60)
    public ProductDto getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug);
    }

    @GetMapping("/{id}")
    @RateLimit(key = "product:get", limit = 30, windowSeconds = 60)
    public ProductDto get(@PathVariable Long id){
        return service.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:create", limit = 10, windowSeconds = 60)
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@Valid @RequestBody ProductCreateRequest r){
        return service.create(r);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:update", limit = 10, windowSeconds = 60)
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest r){
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:delete", limit = 10, windowSeconds = 60)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id){
        service.delete(id);
    }

    @GetMapping("/category/{categoryId}")
    @RateLimit(key = "product:category", limit = 40, windowSeconds = 60)
    public Page<ProductDto> getProductsByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return service.getProductsByCategory(categoryId, pageable);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:lowstock", limit = 10, windowSeconds = 60)
    public List<ProductDto> getLowStockProducts() {
        return service.getLowStockProducts();
    }

    // ============================================
    // PRODUCT IMAGE ENDPOINTS
    // ============================================

    @GetMapping("/{productId}/images")
    public List<ProductImageDto> getProductImages(@PathVariable Long productId) {
        return service.getProductImages(productId);
    }

    @PostMapping("/{productId}/images")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:image:add", limit = 20, windowSeconds = 60)
    public ProductImageDto addProductImage(
            @PathVariable Long productId,
            @Valid @RequestBody ProductImageRequest request) {
        return service.addProductImage(productId, request);
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:image:delete", limit = 20, windowSeconds = 60)
    public ResponseEntity<Void> deleteProductImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        service.deleteProductImage(productId, imageId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{productId}/images/{imageId}/primary")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:image:primary", limit = 20, windowSeconds = 60)
    public ProductImageDto setPrimaryImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        return service.setPrimaryImage(productId, imageId);
    }
}
