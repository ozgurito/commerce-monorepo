package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.WishlistItemDto;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.entity.WishlistItem;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Favorileri listele
     */
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getMyWishlist() {
        User user = getCurrentUser();
        return wishlistRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Favorileri listele (paginated)
     */
    @Transactional(readOnly = true)
    public Page<WishlistItemDto> getMyWishlist(Pageable pageable) {
        User user = getCurrentUser();
        return wishlistRepository.findByUserId(user.getId(), pageable)
                .map(this::mapToDto);
    }

    /**
     * Favorilere ekle
     */
    public WishlistItemDto addToWishlist(Long productId) {
        User user = getCurrentUser();
        
        // Ürün var mı?
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

        // Zaten favorilerde mi?
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            // Zaten var, mevcut olanı dön
            WishlistItem existing = wishlistRepository
                    .findByUserIdAndProductId(user.getId(), productId)
                    .orElseThrow();
            return mapToDto(existing);
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        
        WishlistItem saved = wishlistRepository.save(item);
        return mapToDto(saved);
    }

    /**
     * Favorilerden çıkar
     */
    public void removeFromWishlist(Long productId) {
        User user = getCurrentUser();
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    /**
     * Ürün favorilerde mi?
     */
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long productId) {
        User user = getCurrentUser();
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    /**
     * Favori sayısı
     */
    @Transactional(readOnly = true)
    public Long getWishlistCount() {
        User user = getCurrentUser();
        Long count = wishlistRepository.countByUserId(user.getId());
        return count != null ? count : 0L;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
    }

    private WishlistItemDto mapToDto(WishlistItem item) {
        Product product = item.getProduct();

        // Görsel önceliği: 1) İlk variant görsel  2) Primary  3) İlk görsel
        // Wishlist'te renk bilgisi yok, ürünün ilk renginin görselini göster
        String imageUrl = product.getImages().stream()
                .filter(img -> img.getVariant() != null)
                .sorted(java.util.Comparator.comparingInt(
                        img -> img.getDisplayOrder() != null ? img.getDisplayOrder() : 0))
                .map(img -> img.getImageUrl())
                .findFirst()
                .orElseGet(() -> product.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                        .findFirst()
                        .map(img -> img.getImageUrl())
                        .orElse(product.getImages().isEmpty() ? null :
                                product.getImages().get(0).getImageUrl()));

        return new WishlistItemDto(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getPrice(),
                imageUrl,
                product.getStock() > 0,
                item.getCreatedAt()
        );
    }
}

