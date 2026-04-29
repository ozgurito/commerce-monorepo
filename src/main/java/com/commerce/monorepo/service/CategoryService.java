package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.Category;
import com.commerce.monorepo.dto.CategoryDto;
import com.commerce.monorepo.dto.CategoryCreateRequest;
import com.commerce.monorepo.dto.CategoryPathDto;
import com.commerce.monorepo.dto.CategoryUpdateRequest;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public CategoryDto createCategory(CategoryCreateRequest dto) {

        // slug çakışması
        if (categoryRepository.findBySlug(dto.slug()).isPresent()) {
            throw new BaseException(ErrorCode.CATEGORY_SLUG_TAKEN);
        }

        Category category = new Category();
        category.setName(dto.name());
        category.setSlug(dto.slug());
        category.setDescription(dto.description());
        category.setImageUrl(dto.imageUrl());
        category.setDisplayOrder(dto.displayOrder() != null ? dto.displayOrder() : 0);
        category.setIsActive(true);

        // parent category
        if (dto.parentId() != null) {
            Category parent = categoryRepository.findById(dto.parentId())
                    .orElseThrow(() -> new BaseException(ErrorCode.PARENT_CATEGORY_NOT_FOUND));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    public CategoryDto updateCategory(Long id, CategoryUpdateRequest dto) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));

        if (dto.name() != null)
            category.setName(dto.name());

        if (dto.slug() != null) {
            categoryRepository.findBySlug(dto.slug())
                    .filter(c -> !c.getId().equals(id))
                    .ifPresent(c -> {
                        throw new BaseException(ErrorCode.CATEGORY_SLUG_TAKEN);
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
                .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
        return mapToDto(category);
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
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
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Kategori breadcrumb yolunu döner: kökten başlayarak verilen kategoriye kadar.
     * Örnek: [Giyim → Erkek → T-Shirt] → [{id,name,slug}, {id,name,slug}, {id,name,slug}]
     */
    @Transactional(readOnly = true)
    public List<CategoryPathDto> getCategoryPath(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));

        List<CategoryPathDto> path = new ArrayList<>();
        Category current = category;
        while (current != null) {
            path.add(0, new CategoryPathDto(current.getId(), current.getName(), current.getSlug()));
            current = current.getParent();
        }
        return path;
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
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
