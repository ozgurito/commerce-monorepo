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
<<<<<<< HEAD
import java.util.stream.Collectors;
=======
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea

@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public List<ProductDto> list() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

<<<<<<< HEAD
    public List<ProductDto> findAll() {
        List<Product> products = repo.findAll();

        return products.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug() != null ? product.getSlug() : "");
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setSku(product.getSku() != null ? product.getSku() : "");
        dto.setIsActive(product.getIsActive() != null ? product.getIsActive() : false);
        dto.setIsFeatured(product.getIsFeatured() != null ? product.getIsFeatured() : false);
        
        // Category
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        
        // Rating - ReviewRepository'den hesapla (reviews koleksiyonuna dokunma)
        dto.setAverageRating(0.0);
        dto.setTotalReviews(0);
        
        return dto;
    }

=======
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
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
<<<<<<< HEAD
        Product savedProduct = repo.save(p);
        
        return convertToDto(savedProduct);
=======
        return toDto(repo.save(p));
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
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
<<<<<<< HEAD
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setSlug(p.getSlug() != null ? p.getSlug() : "");
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setSku(p.getSku() != null ? p.getSku() : "");
        dto.setIsActive(p.getIsActive() != null ? p.getIsActive() : false);
        dto.setIsFeatured(p.getIsFeatured() != null ? p.getIsFeatured() : false);
        
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
        }
        
        // Rating - reviews koleksiyonuna dokunmadan varsayılan değerler
        dto.setAverageRating(0.0);
        dto.setTotalReviews(0);
        
        return dto;
=======
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
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    }
}