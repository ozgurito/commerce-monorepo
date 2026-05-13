package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.entity.ProductImage;
import com.commerce.monorepo.entity.ProductVariant;
import com.commerce.monorepo.entity.Review;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.CategoryRepository;
import com.commerce.monorepo.repository.ProductImageRepository;
import com.commerce.monorepo.repository.ProductVariantRepository;
import com.commerce.monorepo.repository.specification.ProductSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository variantRepository;

    @Transactional(readOnly = true)
    public Page<ProductDto> list(Pageable pageable) {
        return repo.findByIsActiveTrue(pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> findAll(Pageable pageable) {
        return repo.findAll(pageable).map(this::mapToDto);
    }

    /**
     * Filtreli ürün listesi — GET /api/products endpoint'i için.
     * ProductSpecification kullanarak tüm filtreleri (kategori, fiyat, renk, beden vb.) uygular.
     */
    @Transactional(readOnly = true)
    public Page<ProductDto> listFiltered(ProductSearchRequest request) {
        request = request.withDefaults();

        // Alt kategorileri dahil et: categoryId yerine tüm child id'leri kullan
        if (request.getCategoryId() != null && Boolean.TRUE.equals(request.getIncludeSubcategories())) {
            List<Long> categoryIds = categoryRepository.findCategoryAndChildIds(request.getCategoryId());
            if (categoryIds != null && !categoryIds.isEmpty()) {
                request.setCategoryIds(categoryIds);
                request.setCategoryId(null); // categoryIds kapsamı zaten içeriyor, tekrar ekleme
            }
        }

        Sort sort = createSort(request.getSortBy(), request.getSortDirection());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        return repo.findAll(
                ProductSpecification.buildSpecification(request),
                pageable
        ).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public ProductDto get(Long id) {
        var p = repo.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

        return mapToDto(p);
    }

    /** Variants + images dahil tam ürün detayı — ürün sayfası için */
    @Transactional(readOnly = true)
    public ProductDetailDto getDetail(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

        List<ProductImageDto> images = product.getImages().stream()
                .sorted((a, b) -> {
                    if (Boolean.TRUE.equals(a.getIsPrimary())) return -1;
                    if (Boolean.TRUE.equals(b.getIsPrimary())) return 1;
                    return Integer.compare(
                            a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                            b.getDisplayOrder() != null ? b.getDisplayOrder() : 0);
                })
                .map(this::mapImageToDto)
                .toList();

        List<ProductVariantDto> variants = variantRepository
                .findByProductIdAndIsActiveTrue(product.getId())
                .stream()
                .map(this::mapVariantToDto)
                .toList();

        double averageRating = 0.0;
        int totalReviews = 0;
        if (Hibernate.isInitialized(product.getReviews()) && !product.getReviews().isEmpty()) {
            var reviews = product.getReviews().stream()
                    .filter(r -> r.getRating() != null).toList();
            totalReviews = reviews.size();
            if (totalReviews > 0) {
                averageRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            }
        }

        return new ProductDetailDto(
                product.getId(), product.getName(), product.getSlug(),
                product.getDescription(), product.getShortDescription(),
                product.getPrice(), product.getComparePrice(),
                product.getStock(), product.getSku(),
                product.getIsActive(), product.getIsFeatured(), product.getAllowReviews(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                resolvePrimaryImage(product),
                images, variants, averageRating, totalReviews,
                product.getCreatedAt(), product.getUpdatedAt(),
                product.getFitType(), product.getFabricComposition(), product.getCareInstructions(),
                product.getModelInfo(), product.getSizeGuide(), product.getMaterial(),
                product.getSeason(), product.getOriginCountry(), product.getGender(), product.getAgeGroup()
        );
    }

    /** Ürün stoğunu manuel güncelle (admin) */
    @Transactional
    public ProductDto updateStock(Long id, int stock) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStock(stock);
        return mapToDto(repo.save(product));
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

    @Transactional
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

        if (r.isActive() != null)   p.setIsActive(r.isActive());
        if (r.isFeatured() != null) p.setIsFeatured(r.isFeatured());

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

    @Transactional
    public void deleteAll() {
        repo.deleteAll();
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

    /** Slug ile tam detay — galeri + varyantlar dahil (ürün sayfası için) */
    @Transactional(readOnly = true)
    public ProductDetailDto getDetailBySlug(String slug) {
        Product product = repo.findBySlug(slug)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new BaseException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        return getDetail(product.getId());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts() {
        return repo.findLowStockProducts()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Aynı kategorideki ilgili ürünleri döner (mevcut ürün hariç).
     * Öne çıkanlar önce, sonra en yeni. Varsayılan limit: 8.
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getRelatedProducts(Long productId, int limit) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        if (product.getCategory() == null) {
            return List.of();
        }
        Pageable pageable = PageRequest.of(0, Math.min(limit, 20));
        return repo.findRelatedProducts(product.getCategory().getId(), productId, pageable)
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

    public record ImageOrderItem(Long id, Integer displayOrder) {}

    @Transactional
    public void reorderImages(Long productId, List<ImageOrderItem> order) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));
        Map<Long, ProductImage> imageMap = product.getImages().stream()
                .collect(Collectors.toMap(ProductImage::getId, img -> img));
        for (ImageOrderItem item : order) {
            ProductImage img = imageMap.get(item.id());
            if (img != null) {
                img.setDisplayOrder(item.displayOrder());
            }
        }
        repo.save(product);
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

    // ============================================
    // PRODUCT VARIANT METHODS
    // ============================================

    @Transactional(readOnly = true)
    public List<ProductVariantDto> getVariants(Long productId) {
        if (!repo.existsById(productId)) throw new BaseException(ErrorCode.PRODUCT_NOT_FOUND);
        return variantRepository.findByProductIdAndIsActiveTrue(productId)
                .stream().map(this::mapVariantToDto).toList();
    }

    @Transactional
    public ProductVariantDto createVariant(Long productId, ProductVariantCreateRequest req) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

        if (req.sku() != null && variantRepository.existsBySku(req.sku())) {
            throw new BaseException(ErrorCode.SKU_ALREADY_EXISTS);
        }

        ProductVariant v = new ProductVariant();
        v.setProduct(product);
        v.setName(req.name());
        v.setVariantType(req.variantType());
        v.setSize(req.size());
        v.setColor(req.color());
        v.setColorHex(req.colorHex());
        v.setSku(req.sku());
        v.setPriceModifier(req.priceModifier() != null ? req.priceModifier() : BigDecimal.ZERO);
        v.setStock(req.stock());
        v.setIsActive(true);

        return mapVariantToDto(variantRepository.save(v));
    }

    @Transactional
    public ProductVariantDto updateVariant(Long productId, Long variantId, ProductVariantUpdateRequest req) {
        ProductVariant v = variantRepository.findById(variantId)
                .orElseThrow(() -> new BaseException(ErrorCode.VARIANT_NOT_FOUND));

        if (!v.getProduct().getId().equals(productId)) {
            throw new BaseException(ErrorCode.VARIANT_NOT_FOUND);
        }

        if (req.sku() != null && !req.sku().equals(v.getSku()) && variantRepository.existsBySku(req.sku())) {
            throw new BaseException(ErrorCode.SKU_ALREADY_EXISTS);
        }

        if (req.name() != null)          v.setName(req.name());
        if (req.size() != null)          v.setSize(req.size());
        if (req.color() != null)         v.setColor(req.color());
        if (req.colorHex() != null)      v.setColorHex(req.colorHex());
        if (req.sku() != null)           v.setSku(req.sku());
        if (req.priceModifier() != null) v.setPriceModifier(req.priceModifier());
        if (req.stock() != null)         v.setStock(req.stock());
        if (req.isActive() != null)      v.setIsActive(req.isActive());

        return mapVariantToDto(variantRepository.save(v));
    }

    @Transactional
    public void deleteVariant(Long productId, Long variantId) {
        ProductVariant v = variantRepository.findById(variantId)
                .orElseThrow(() -> new BaseException(ErrorCode.VARIANT_NOT_FOUND));

        if (!v.getProduct().getId().equals(productId)) {
            throw new BaseException(ErrorCode.VARIANT_NOT_FOUND);
        }

        // Soft delete
        v.setIsActive(false);
        variantRepository.save(v);
    }

    @Transactional
    public ProductVariantDto updateVariantStock(Long productId, Long variantId, int stock) {
        ProductVariant v = variantRepository.findById(variantId)
                .orElseThrow(() -> new BaseException(ErrorCode.VARIANT_NOT_FOUND));

        if (!v.getProduct().getId().equals(productId)) {
            throw new BaseException(ErrorCode.VARIANT_NOT_FOUND);
        }

        v.setStock(stock);
        return mapVariantToDto(variantRepository.save(v));
    }

    private ProductVariantDto mapVariantToDto(ProductVariant v) {
        return new ProductVariantDto(
                v.getId(), v.getName(), v.getVariantType(),
                v.getSize(), v.getColor(), v.getColorHex(),
                v.getSku(), v.getPriceModifier(), v.getStock(), v.getIsActive()
        );
    }

    // ========== GELİŞMİŞ ARAMA ==========

    /**
     * Gelişmiş ürün arama ve filtreleme
     */
    @Transactional(readOnly = true)
    public ProductSearchResponse searchProducts(ProductSearchRequest request) {
        request = request.withDefaults();

        // Alt kategorileri dahil et
        if (request.getCategoryId() != null && Boolean.TRUE.equals(request.getIncludeSubcategories())) {
            List<Long> categoryIds = categoryRepository.findCategoryAndChildIds(request.getCategoryId());
            if (request.getCategoryIds() == null || request.getCategoryIds().isEmpty()) {
                request.setCategoryIds(categoryIds);
            } else {
                // Mevcut categoryIds'e ekle
                categoryIds.addAll(request.getCategoryIds());
                request.setCategoryIds(categoryIds);
            }
        }

        // Sıralama
        Sort sort = createSort(request.getSortBy(), request.getSortDirection());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        // Specification ile arama
        Specification<Product> spec = ProductSpecification.buildSpecification(request);
        Page<Product> productPage = repo.findAll(spec, pageable);

        // DTO'ya dönüştür
        List<ProductDto> products = productPage.getContent()
                .stream()
                .map(this::mapToDto)
                .toList();

        // Filtre seçeneklerini hesapla
        ProductSearchResponse.FilterOptions filterOptions = buildFilterOptions();

        return ProductSearchResponse.builder()
                .products(products)
                .currentPage(productPage.getNumber())
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .pageSize(productPage.getSize())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .filterOptions(filterOptions)
                .build();
    }

    /**
     * Hızlı arama (autocomplete için)
     */
    @Transactional(readOnly = true)
    public List<ProductDto> quickSearch(String keyword, int limit) {
        if (!StringUtils.hasText(keyword) || keyword.length() < 2) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, limit);
        // Sadece isme göre ara — açıklamada geçen kategori etiketleri (ör: "Sweatshirt,Tişört;")
        // yanlış sonuç getirmesin
        Page<Product> products = repo.findByNameContainingIgnoreCaseAndIsActiveTrue(keyword, pageable);

        return products.getContent()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Filtre seçeneklerini hesapla
     */
    @Transactional(readOnly = true)
    public ProductSearchResponse.FilterOptions getFilterOptions() {
        return buildFilterOptions();
    }

    private ProductSearchResponse.FilterOptions buildFilterOptions() {
        // Kategoriler ve ürün sayıları
        List<Object[]> categoryCounts = repo.countByCategory();
        List<ProductSearchResponse.CategoryCount> categories = categoryCounts.stream()
                .filter(result -> result[0] != null)  // NULL category_id'leri filtrele
                .map(row -> {
                    Long categoryId = (Long) row[0];
                    Long count = (Long) row[1];
                    // Kategori bilgisini al
                    return categoryRepository.findById(categoryId)
                            .map(cat -> ProductSearchResponse.CategoryCount.builder()
                                    .categoryId(cat.getId())
                                    .categoryName(cat.getName())
                                    .categorySlug(cat.getSlug())
                                    .productCount(count)
                                    .build())
                            .orElse(null);
                })
                .filter(Objects::nonNull)
                .toList();

        // Mevcut renkler ve bedenler
        List<String> colors = repo.findDistinctColors();
        List<String> sizes = repo.findDistinctSizes();

        // Fiyat aralığı
        BigDecimal minPrice = repo.findMinPrice();
        BigDecimal maxPrice = repo.findMaxPrice();

        return ProductSearchResponse.FilterOptions.builder()
                .categories(categories)
                .availableColors(colors)
                .availableSizes(sizes)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .build();
    }

    private Sort createSort(String sortBy, String direction) {
        Sort.Direction dir = "ASC".equalsIgnoreCase(direction) ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        return switch (sortBy.toLowerCase()) {
            case "name" -> Sort.by(dir, "name");
            case "price" -> Sort.by(dir, "price");
            case "createdat", "newest" -> Sort.by(dir, "createdAt");
            case "stock" -> Sort.by(dir, "stock");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
