package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.CategoryDto;
import com.commerce.monorepo.dto.CategoryCreateRequest;
import com.commerce.monorepo.dto.CategoryPathDto;
import com.commerce.monorepo.dto.CategoryUpdateRequest;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @RateLimit(key = "category:list", limit = 60, windowSeconds = 60, perUser = false)
    @GetMapping
    public List<CategoryDto> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @RateLimit(key = "category:root", limit = 60, windowSeconds = 60, perUser = false)
    @GetMapping("/root")
    public List<CategoryDto> getRootCategories() {
        return categoryService.getRootCategories();
    }

    @RateLimit(key = "category:get", limit = 60, windowSeconds = 60, perUser = false)
    @GetMapping("/{id}")
    public CategoryDto getCategory(@PathVariable Long id) {
        return categoryService.getCategory(id);
    }

    @RateLimit(key = "category:path", limit = 60, windowSeconds = 60, perUser = false)
    @GetMapping("/{id}/path")
    public List<CategoryPathDto> getCategoryPath(@PathVariable Long id) {
        return categoryService.getCategoryPath(id);
    }

    @RateLimit(key = "category:slug", limit = 60, windowSeconds = 60, perUser = false)
    @GetMapping("/slug/{slug}")
    public CategoryDto getCategoryBySlug(@PathVariable String slug) {
        return categoryService.getCategoryBySlug(slug);
    }

    @RateLimit(key = "category:create", limit = 10, windowSeconds = 60, perUser = false)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryCreateRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(dto));
    }

    @RateLimit(key = "category:update", limit = 10, windowSeconds = 60, perUser = false)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryDto updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryUpdateRequest dto) {
        return categoryService.updateCategory(id, dto);
    }

    @RateLimit(key = "category:delete", limit = 10, windowSeconds = 60, perUser = false)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
