package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ProductCreateRequest;
import com.commerce.monorepo.dto.ProductDto;
import com.commerce.monorepo.dto.ProductUpdateRequest;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.entity.Review;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;

@Service
public class ProductService {
    private final ProductRepository repo;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository repo, CategoryRepository categoryRepository) {
        this.repo = repo;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> list() {
        return repo.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> findAll() {
        List<Product> products = repo.findAll();

        return products.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto get(Long id) {
        var p = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Product not found"));
        return mapToDto(p);
    }

    public ProductDto create(ProductCreateRequest r) {
        // SKU kontrolü
        if (r.sku() != null && repo.existsBySku(r.sku())) {
            throw new IllegalArgumentException("SKU already exists: " + r.sku());
        }
        
        var p = new Product();
        p.setName(r.name());
        p.setSlug(generateSlug(r.name()));
        p.setDescription(r.description());
        p.setPrice(r.price());
        p.setStock(r.stock());
        p.setSku(r.sku());
        p.setIsActive(true);
        
        // Category ata
        if (r.categoryId() != null) {
            var category = categoryRepository.findById(r.categoryId())
                .orElseThrow(() -> new NoSuchElementException("Category not found"));
            p.setCategory(category);
        }
        
        Product savedProduct = repo.save(p);
        return mapToDto(savedProduct);
    }

    public ProductDto update(Long id, ProductUpdateRequest r) {
        var p = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Product not found"));
        
        if (r.name() != null) {
            p.setName(r.name());
            p.setSlug(generateSlug(r.name()));
        }
        if (r.description() != null) p.setDescription(r.description());
        if (r.price() != null) p.setPrice(r.price());
        if (r.stock() != null) p.setStock(r.stock());
        if (r.sku() != null) p.setSku(r.sku());
        if (r.categoryId() != null) {
            var category = categoryRepository.findById(r.categoryId())
                .orElseThrow(() -> new NoSuchElementException("Category not found"));
            p.setCategory(category);
        }
        
        return mapToDto(repo.save(p));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new NoSuchElementException("Product not found");
        repo.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable) {
        return repo.findByCategoryIdAndIsActiveTrue(categoryId, pageable)
                .map(this::mapToDto);
    }
    
    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts() {
        return repo.findLowStockProducts()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private ProductDto mapToDto(Product product) {
        double averageRating = 0.0;
        int totalReviews = 0;

        if (Hibernate.isInitialized(product.getReviews()) && product.getReviews() != null && !product.getReviews().isEmpty()) {
            List<Review> reviews = product.getReviews().stream()
                    .filter(review -> review != null && review.getRating() != null)
                    .toList();
            totalReviews = reviews.size();
            if (totalReviews > 0) {
                averageRating = reviews.stream()
                        .map(Review::getRating)
                        .mapToInt(Integer::intValue)
                        .average()
                        .orElse(0.0);
            }
        }

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .comparePrice(product.getComparePrice())
                .stock(product.getStock())
                .sku(product.getSku())
                .active(Boolean.TRUE.equals(product.getIsActive()))
                .featured(Boolean.TRUE.equals(product.getIsFeatured()))
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .imageUrl(resolvePrimaryImage(product))
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private String resolvePrimaryImage(Product product) {
        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }

        return product.getImages().stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsPrimary()))
                .map(image -> image.getImageUrl())
                .filter(Objects::nonNull)
                .findFirst()
                .orElseGet(() -> product.getImages().stream()
                        .map(image -> image.getImageUrl())
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElse(null));
    }
    
    private String generateSlug(String name) {
        return name.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-");
    }
}
