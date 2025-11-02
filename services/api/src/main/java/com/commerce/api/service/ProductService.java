package com.commerce.api.service;

import com.commerce.api.domain.Product;
import com.commerce.api.dto.*;
import com.commerce.api.repo.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public List<ProductDto> list() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    public ProductDto get(Long id) {
        var p = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Product not found"));
        return toDto(p);
    }

    public ProductDto create(ProductCreateRequest r) {
        var p = new Product();
        p.setName(r.name());
        p.setDescription(r.description());
        p.setPrice(r.price());
        p.setStock(r.stock());
        return toDto(repo.save(p));
    }

    public ProductDto update(Long id, ProductUpdateRequest r) {
        var p = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Product not found"));
        p.setName(r.name());
        p.setDescription(r.description());
        p.setPrice(r.price());
        p.setStock(r.stock());
        return toDto(repo.save(p));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new NoSuchElementException("Product not found");
        repo.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable) {
        return repo.findByCategoryIdAndIsActiveTrue(categoryId, pageable)
                .map(this::toDto);
    }
    
    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts() {
        return repo.findLowStockProducts()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getCreatedAt(),
                p.getSku(),
                p.getIsActive(),
                p.getIsFeatured(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getAverageRating(),
                p.getTotalReviews()
        );
    }
}