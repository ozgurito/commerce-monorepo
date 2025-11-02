package com.commerce.api.service;

import com.commerce.api.domain.Category;
import com.commerce.api.dto.CategoryDto;
import com.commerce.api.dto.CategoryCreateRequest;
import com.commerce.api.dto.CategoryUpdateRequest;
import com.commerce.api.repo.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    
    public CategoryDto createCategory(CategoryCreateRequest dto) {
        if (categoryRepository.findBySlug(dto.slug()).isPresent()) {
            throw new IllegalArgumentException("Category slug already exists: " + dto.slug());
        }
        
        Category category = new Category();
        category.setName(dto.name());
        category.setSlug(dto.slug());
        category.setDescription(dto.description());
        category.setImageUrl(dto.imageUrl());
        category.setDisplayOrder(dto.displayOrder() != null ? dto.displayOrder() : 0);
        category.setIsActive(true);
        
        if (dto.parentId() != null) {
            Category parent = categoryRepository.findById(dto.parentId())
                    .orElseThrow(() -> new NoSuchElementException("Parent category not found"));
            category.setParent(parent);
        }
        
        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }
    
    public CategoryDto updateCategory(Long id, CategoryUpdateRequest dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + id));
        
        if (dto.name() != null) category.setName(dto.name());
        if (dto.slug() != null) {
            categoryRepository.findBySlug(dto.slug())
                    .filter(c -> !c.getId().equals(id))
                    .ifPresent(c -> {
                        throw new IllegalArgumentException("Slug already exists");
                    });
            category.setSlug(dto.slug());
        }
        if (dto.description() != null) category.setDescription(dto.description());
        if (dto.imageUrl() != null) category.setImageUrl(dto.imageUrl());
        if (dto.displayOrder() != null) category.setDisplayOrder(dto.displayOrder());
        if (dto.isActive() != null) category.setIsActive(dto.isActive());
        
        Category updated = categoryRepository.save(category);
        return mapToDto(updated);
    }
    
    @Transactional(readOnly = true)
    public CategoryDto getCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + id));
        return mapToDto(category);
    }
    
    @Transactional(readOnly = true)
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + slug));
        return mapToDto(category);
    }
    
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrder()
                .stream()
                .map(this::mapToDto)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<CategoryDto> getRootCategories() {
        return categoryRepository.findByParentIdIsNull()
                .stream()
                .filter(c -> c.getIsActive() != null && c.getIsActive())
                .map(this::mapToDto)
                .toList();
    }
    
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + id));
        category.setIsActive(false);
        categoryRepository.save(category);
    }
    
    private CategoryDto mapToDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.getImageUrl(),
                category.getDisplayOrder(),
                category.getIsActive(),
                category.getCreatedAt()
        );
    }
}

