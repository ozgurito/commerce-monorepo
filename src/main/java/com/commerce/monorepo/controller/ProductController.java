package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.service.ProductService;
import com.commerce.monorepo.ratelimit.RateLimit;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
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
}
