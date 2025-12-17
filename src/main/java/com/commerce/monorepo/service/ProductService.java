package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ProductCreateRequest;
import com.commerce.monorepo.dto.ProductDto;
import com.commerce.monorepo.dto.ProductImageDto;
import com.commerce.monorepo.dto.ProductImageRequest;
import com.commerce.monorepo.dto.ProductUpdateRequest;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.entity.ProductImage;
import com.commerce.monorepo.entity.Review;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.CategoryRepository;
import com.commerce.monorepo.repository.ProductImageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(ProductRepository repo, CategoryRepository categoryRepository, ProductImageRepository productImageRepository) {
        this.repo = repo;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> list() {
        return repo.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> findAll() {
        return repo.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto get(Long id) {
        var p = repo.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

        return mapToDto(p);
    }

    public ProductDto create(ProductCreateRequest r) {

        // SKU kontrolü
        if (r.sku() != null && repo.existsBySku(r.sku())) {
            throw new BaseException(ErrorCode.SKU_ALREADY_EXISTS);
        }

        var p = new Product();
        p.setName(r.name());
        p.setSlug(generateSlug(r.name()));
        p.setDescription(r.description());
        p.setPrice(r.price());
        p.setStock(r.stock());
        p.setSku(r.sku());
        p.setIsActive(true);
        
        // Giyim spesifik alanlar
        p.setFitType(r.fitType());
        p.setFabricComposition(r.fabricComposition());
        p.setCareInstructions(r.careInstructions());
        p.setModelInfo(r.modelInfo());
        p.setSizeGuide(r.sizeGuide());
        p.setMaterial(r.material());
        p.setSeason(r.season());
        p.setOriginCountry(r.originCountry());
        p.setGender(r.gender());
        p.setAgeGroup(r.ageGroup());

        // Category kontrolü
        if (r.categoryId() != null) {
            var category = categoryRepository.findById(r.categoryId())
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
            p.setCategory(category);
        }

        return mapToDto(repo.save(p));
    }

    public ProductDto update(Long id, ProductUpdateRequest r) {
        var p = repo.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

        if (r.name() != null) {
            p.setName(r.name());
            p.setSlug(generateSlug(r.name()));
        }
        if (r.description() != null) p.setDescription(r.description());
        if (r.price() != null) p.setPrice(r.price());
        if (r.stock() != null) p.setStock(r.stock());

        if (r.sku() != null) {
            // SKU başka bir üründe var mı?
            if (repo.existsBySkuAndIdNot(r.sku(), id)) {
                throw new BaseException(ErrorCode.SKU_ALREADY_EXISTS);
            }
            p.setSku(r.sku());
        }

        if (r.categoryId() != null) {
            var category = categoryRepository.findById(r.categoryId())
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
            p.setCategory(category);
        }
        
        // Giyim spesifik alanlar
        if (r.fitType() != null) p.setFitType(r.fitType());
        if (r.fabricComposition() != null) p.setFabricComposition(r.fabricComposition());
        if (r.careInstructions() != null) p.setCareInstructions(r.careInstructions());
        if (r.modelInfo() != null) p.setModelInfo(r.modelInfo());
        if (r.sizeGuide() != null) p.setSizeGuide(r.sizeGuide());
        if (r.material() != null) p.setMaterial(r.material());
        if (r.season() != null) p.setSeason(r.season());
        if (r.originCountry() != null) p.setOriginCountry(r.originCountry());
        if (r.gender() != null) p.setGender(r.gender());
        if (r.ageGroup() != null) p.setAgeGroup(r.ageGroup());

        return mapToDto(repo.save(p));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new BaseException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        repo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable) {
        return repo.findByCategoryIdAndIsActiveTrue(categoryId, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> searchProducts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return repo.findByIsActiveTrue(pageable).map(this::mapToDto);
        }
        String searchTerm = keyword.trim();
        return repo.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndIsActiveTrue(
                searchTerm, searchTerm, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts() {
        return repo.findByIsFeaturedTrueAndIsActiveTrue()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product product = repo.findBySlug(slug)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new BaseException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        return mapToDto(product);
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

        if (Hibernate.isInitialized(product.getReviews())
                && product.getReviews() != null
                && !product.getReviews().isEmpty()) {

            var reviews = product.getReviews().stream()
                    .filter(r -> r != null && r.getRating() != null)
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
                .fitType(product.getFitType())
                .fabricComposition(product.getFabricComposition())
                .careInstructions(product.getCareInstructions())
                .modelInfo(product.getModelInfo())
                .sizeGuide(product.getSizeGuide())
                .material(product.getMaterial())
                .season(product.getSeason())
                .originCountry(product.getOriginCountry())
                .gender(product.getGender())
                .ageGroup(product.getAgeGroup())
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

    // ============================================
    // PRODUCT IMAGE METHODS
    // ============================================

    @Transactional
    public ProductImageDto addProductImage(Long productId, ProductImageRequest request) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // Eğer isPrimary true ise, diğer primary'leri false yap
        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            product.getImages().forEach(img -> img.setIsPrimary(false));
        }
        
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(request.getImageUrl());
        image.setAltText(request.getAltText());
        image.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        image.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);
        
        product.getImages().add(image);
        repo.save(product);
        
        return mapImageToDto(image);
    }

    @Transactional(readOnly = true)
    public List<ProductImageDto> getProductImages(Long productId) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        
        return product.getImages().stream()
                .sorted((a, b) -> {
                    // Primary olanı en başa
                    if (Boolean.TRUE.equals(a.getIsPrimary())) return -1;
                    if (Boolean.TRUE.equals(b.getIsPrimary())) return 1;
                    // Sonra displayOrder'a göre
                    return Integer.compare(
                        a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                        b.getDisplayOrder() != null ? b.getDisplayOrder() : 0
                    );
                })
                .map(this::mapImageToDto)
                .toList();
    }

    @Transactional
    public void deleteProductImage(Long productId, Long imageId) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        
        ProductImage image = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_IMAGE_NOT_FOUND));
        
        product.getImages().remove(image);
        productImageRepository.delete(image);
    }

    @Transactional
    public ProductImageDto setPrimaryImage(Long productId, Long imageId) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // Tüm primary'leri false yap
        product.getImages().forEach(img -> img.setIsPrimary(false));
        
        // Seçilen image'ı primary yap
        ProductImage image = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_IMAGE_NOT_FOUND));
        
        image.setIsPrimary(true);
        repo.save(product);
        
        return mapImageToDto(image);
    }

    private ProductImageDto mapImageToDto(ProductImage image) {
        return new ProductImageDto(
                image.getId(),
                image.getProduct().getId(),
                image.getImageUrl(),
                image.getAltText(),
                image.getDisplayOrder(),
                image.getIsPrimary()
        );
    }
}
