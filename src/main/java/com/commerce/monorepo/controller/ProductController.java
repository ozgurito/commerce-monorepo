package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.service.ProductService;
import com.commerce.monorepo.ratelimit.RateLimit;
import io.swagger.v3.oas.annotations.Operation;
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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    // ============================================
    // LİSTE & ARAMA
    // ============================================

    @GetMapping
    @RateLimit(key = "product:list", limit = 60, windowSeconds = 60)
    public Page<ProductDto> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<String> colors,
            @RequestParam(required = false) List<String> sizes,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "false") boolean expandByColor) {

        ProductSearchRequest req = ProductSearchRequest.builder()
                .categoryId(categoryId)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .colors(colors)
                .sizes(sizes)
                .keyword(keyword)
                .inStockOnly(inStockOnly)
                .featuredOnly(featured)   // frontend "featured" → spec "featuredOnly"
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .page(page)
                .size(size)
                .expandByColor(expandByColor)
                .build();

        return service.listFiltered(req);
    }

    @GetMapping("/search")
    @RateLimit(key = "product:search", limit = 30, windowSeconds = 60)
    public Page<ProductDto> search(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return service.searchProducts(q, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @GetMapping("/featured")
    @RateLimit(key = "product:featured", limit = 60, windowSeconds = 60)
    public List<ProductDto> getFeaturedProducts() {
        return service.getFeaturedProducts();
    }

    @GetMapping("/flash-deals")
    @RateLimit(key = "product:flashdeals", limit = 60, windowSeconds = 60)
    public List<ProductDto> getFlashDealProducts() {
        return service.getFlashDealProducts();
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:lowstock", limit = 10, windowSeconds = 60)
    public List<ProductDto> getLowStockProducts() {
        return service.getLowStockProducts();
    }

    @GetMapping("/category/{categoryId}")
    @RateLimit(key = "product:category", limit = 40, windowSeconds = 60)
    public Page<ProductDto> getByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(size = 20) Pageable pageable) {
        return service.getProductsByCategory(categoryId, pageable);
    }

    @GetMapping("/slug/{slug}")
    @RateLimit(key = "product:slug", limit = 30, windowSeconds = 60)
    public ProductDetailDto getBySlug(@PathVariable String slug) {
        return service.getDetailBySlug(slug);
    }

    /** Model Kodu (SKU) ile ürün bul — Excel içe aktarımda "zaten var mı" kontrolü için (admin) */
    @GetMapping("/by-sku/{sku}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:by-sku", limit = 30, windowSeconds = 60)
    public ProductDto getBySku(@PathVariable String sku) {
        return service.getBySku(sku);
    }

    // ============================================
    // TEK ÜRÜN
    // ============================================

    @GetMapping("/{id}")
    @RateLimit(key = "product:get", limit = 30, windowSeconds = 60)
    public ProductDto get(@PathVariable Long id) {
        return service.get(id);
    }

    /** Variants + images dahil tam detay — ürün sayfası için */
    @GetMapping("/{id}/detail")
    @RateLimit(key = "product:detail", limit = 30, windowSeconds = 60)
    public ProductDetailDto getDetail(@PathVariable Long id) {
        return service.getDetail(id);
    }

    @GetMapping("/{id}/related")
    @RateLimit(key = "product:related", limit = 60, windowSeconds = 60)
    public List<ProductDto> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "8") int limit) {
        return service.getRelatedProducts(id, limit);
    }

    // ============================================
    // ADMIN — ÜRÜN CRUD
    // ============================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@Valid @RequestBody ProductCreateRequest r) {
        return service.create(r);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:update", limit = 10, windowSeconds = 60)
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:delete", limit = 10, windowSeconds = 60)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Tüm ürünleri sil (admin only — dikkatli kullanın!)")
    public void deleteAll() {
        service.deleteAll();
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:stock", limit = 20, windowSeconds = 60)
    @Operation(summary = "Ürün stok miktarını güncelle (admin)")
    public ProductDto updateStock(
            @PathVariable Long id,
            @RequestParam int stock) {
        return service.updateStock(id, stock);
    }

    // ============================================
    // ADMIN — VARYANT CRUD
    // ============================================

    @GetMapping("/{productId}/variants")
    @RateLimit(key = "variant:list", limit = 60, windowSeconds = 60)
    public List<ProductVariantDto> getVariants(@PathVariable Long productId) {
        return service.getVariants(productId);
    }

    @PostMapping("/{productId}/variants")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductVariantDto createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantCreateRequest req) {
        return service.createVariant(productId, req);
    }

    @PutMapping("/{productId}/variants/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "variant:update", limit = 20, windowSeconds = 60)
    public ProductVariantDto updateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantUpdateRequest req) {
        return service.updateVariant(productId, variantId, req);
    }

    @DeleteMapping("/{productId}/variants/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "variant:delete", limit = 20, windowSeconds = 60)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId) {
        service.deleteVariant(productId, variantId);
    }

    @PatchMapping("/{productId}/variants/{variantId}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "variant:stock", limit = 30, windowSeconds = 60)
    @Operation(summary = "Varyant stok miktarını güncelle (admin)")
    public ProductVariantDto updateVariantStock(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @RequestParam int stock) {
        return service.updateVariantStock(productId, variantId, stock);
    }

    // ============================================
    // ÜRÜN GÖRSELLERİ
    // ============================================

    @GetMapping("/{productId}/images")
    public List<ProductImageDto> getProductImages(@PathVariable Long productId) {
        return service.getProductImages(productId);
    }

    @PostMapping("/{productId}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductImageDto addProductImage(
            @PathVariable Long productId,
            @Valid @RequestBody ProductImageRequest request) {
        return service.addProductImage(productId, request);
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:image:delete", limit = 20, windowSeconds = 60)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProductImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        service.deleteProductImage(productId, imageId);
    }

    @PutMapping("/{productId}/images/{imageId}/primary")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:image:primary", limit = 20, windowSeconds = 60)
    public ProductImageDto setPrimaryImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        return service.setPrimaryImage(productId, imageId);
    }

    public record ImageOrderRequest(Long id, Integer displayOrder) {}

    @PutMapping("/{productId}/images/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(key = "product:image:reorder", limit = 20, windowSeconds = 60)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderImages(
            @PathVariable Long productId,
            @RequestBody List<ImageOrderRequest> order) {
        service.reorderImages(productId, order.stream()
                .map(r -> new ProductService.ImageOrderItem(r.id(), r.displayOrder()))
                .toList());
    }

    // ============================================
    // GELİŞMİŞ ARAMA & FİLTRELER
    // ============================================

    @PostMapping("/search/advanced")
    @RateLimit(key = "product:search:advanced", limit = 30, windowSeconds = 60)
    public ProductSearchResponse advancedSearch(@RequestBody ProductSearchRequest request) {
        return service.searchProducts(request);
    }

    @GetMapping("/search/quick")
    @RateLimit(key = "product:search:quick", limit = 60, windowSeconds = 60)
    public List<ProductDto> quickSearch(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return service.quickSearch(q, limit);
    }

    @GetMapping("/filters")
    @RateLimit(key = "product:filters", limit = 60, windowSeconds = 60)
    public ProductSearchResponse.FilterOptions getFilterOptions() {
        return service.getFilterOptions();
    }
}
