package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.dto.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.CartItemRepository;
import com.commerce.monorepo.repository.CartRepository;
import com.commerce.monorepo.repository.ProductImageRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.ProductVariantRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    public CartDto getMyCart() {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateActiveCart(currentUser);
        return mapToDto(cart);
    }

    public CartDto addToCart(AddToCartRequest request) {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateActiveCart(currentUser);

        // Product kontrolü
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BaseException(ErrorCode.PRODUCT_NOT_FOUND));

        // Variant kontrolü
        ProductVariant variant = null;
        if (request.getVariantId() != null && request.getVariantId() > 0) {
            variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new BaseException(ErrorCode.VARIANT_NOT_FOUND));

            // Variant bu ürüne ait mi?
            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new BaseException(ErrorCode.VARIANT_NOT_FOUND);
            }
        }

        // Ürünün aktif varyantları varsa varyant seçimi zorunlu
        boolean productHasVariants = productVariantRepository.existsByProductIdAndIsActiveTrue(product.getId());
        if (productHasVariants && variant == null) {
            throw new BaseException(ErrorCode.VARIANT_REQUIRED);
        }

        // Stok kontrolü:
        // - Variant seçilmişse variant.stock kullan, ancak 0 ise ürün stoğuna düş
        //   (admin varyantları stock:0 ile oluşturmuş olabilir — ürün stoğu gerçek kaynaktır)
        // - Variant yoksa direkt ürün stoğu
        int variantStock = variant != null ? variant.getStock() : -1;
        int availableStock = (variantStock > 0) ? variantStock : product.getStock();
        if (availableStock < request.getQuantity()) {
            throw new BaseException(ErrorCode.INSUFFICIENT_STOCK);
        }

        // Fiyat belirleme (variant varsa variant fiyatı)
        BigDecimal unitPrice = product.getPrice();
        if (variant != null && variant.getPriceModifier() != null) {
            unitPrice = unitPrice.add(variant.getPriceModifier());
        }

        // Sepette aynı ürün + aynı variant var mı?
        final ProductVariant finalVariant = variant;
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .filter(item -> {
                    if (finalVariant == null) {
                        return item.getProductVariant() == null;
                    }
                    return item.getProductVariant() != null && 
                           item.getProductVariant().getId().equals(finalVariant.getId());
                })
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (availableStock < newQuantity) {
                throw new BaseException(ErrorCode.INSUFFICIENT_STOCK);
            }
            existingItem.setQuantity(newQuantity);
            existingItem.calculateTotalPrice();
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setProductVariant(variant);
            newItem.setQuantity(request.getQuantity());
            newItem.setUnitPrice(unitPrice);
            newItem.calculateTotalPrice();
            cart.addItem(newItem);
        }

        cart.recalculateTotal();
        Cart savedCart = cartRepository.save(cart);
        return mapToDto(savedCart);
    }

    public CartDto updateCartItem(Long cartItemId, UpdateCartItemRequest request) {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateActiveCart(currentUser);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new BaseException(ErrorCode.CART_ITEM_NOT_FOUND));

        // Stok kontrolü — variant stoğu 0 ise ürün stoğuna düş
        Product product = cartItem.getProduct();
        int varStock = cartItem.getProductVariant() != null
                ? cartItem.getProductVariant().getStock()
                : -1;
        int availableStock = (varStock > 0) ? varStock : product.getStock();
        if (availableStock < request.getQuantity()) {
            throw new BaseException(ErrorCode.INSUFFICIENT_STOCK);
        }

        cartItem.setQuantity(request.getQuantity());
        cartItem.calculateTotalPrice();
        cart.recalculateTotal();

        Cart savedCart = cartRepository.save(cart);
        return mapToDto(savedCart);
    }

    public CartDto removeFromCart(Long cartItemId) {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateActiveCart(currentUser);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new BaseException(ErrorCode.CART_ITEM_NOT_FOUND));

        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);

        Cart savedCart = cartRepository.save(cart);
        return mapToDto(savedCart);
    }

    public void clearCart() {
        User currentUser = getCurrentUser();
        Cart cart = cartRepository.findByUserIdAndStatus(currentUser.getId(), CartStatus.ACTIVE)
                .orElse(null);

        if (cart != null) {
            cart.clear();
            cartRepository.save(cart);
        }
    }

    private Cart getOrCreateActiveCart(User user) {
        return cartRepository.findByUserIdAndStatusWithItems(user.getId(), CartStatus.ACTIVE)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setStatus(CartStatus.ACTIVE);
                    return cartRepository.save(newCart);
                });
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
    }

    private CartDto mapToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setStatus(cart.getStatus());
        dto.setTotalAmount(cart.getTotalAmount());
        // itemCount = toplam miktar (distinct item sayısı değil)
        dto.setItemCount(cart.getItems().stream().mapToInt(com.commerce.monorepo.entity.CartItem::getQuantity).sum());

        dto.setItems(cart.getItems().stream()
                .map(item -> {
                    CartItemDto itemDto = new CartItemDto();
                    itemDto.setId(item.getId());
                    itemDto.setProductId(item.getProduct().getId());
                    itemDto.setProductName(item.getProduct().getName());
                    itemDto.setProductSlug(item.getProduct().getSlug());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setUnitPrice(item.getUnitPrice());
                    itemDto.setTotalPrice(item.getTotalPrice());
                    
                    // Stok — variant stoğu 0 ise ürün stoğunu kullan
                    if (item.getProductVariant() != null) {
                        int varSt = item.getProductVariant().getStock() != null
                                ? item.getProductVariant().getStock() : 0;
                        itemDto.setAvailableStock(varSt > 0 ? varSt : item.getProduct().getStock());
                        itemDto.setVariantId(item.getProductVariant().getId());
                        itemDto.setVariantName(item.getProductVariant().getName());
                        itemDto.setSize(item.getProductVariant().getSize());
                        itemDto.setColor(item.getProductVariant().getColor());
                    } else {
                        itemDto.setAvailableStock(item.getProduct().getStock());
                    }

                    // Görsel: renk adı + ürün ID kombinasyonuyla ara (tüm bedenler için çalışır)
                    String resolvedImageUrl = null;
                    if (item.getProductVariant() != null &&
                            item.getProductVariant().getColor() != null &&
                            !item.getProductVariant().getColor().isBlank()) {
                        java.util.List<com.commerce.monorepo.entity.ProductImage> colorImgs =
                            productImageRepository.findByProductIdAndVariantColorOrderByDisplayOrder(
                                item.getProduct().getId(),
                                item.getProductVariant().getColor());
                        if (!colorImgs.isEmpty()) {
                            resolvedImageUrl = colorImgs.get(0).getImageUrl();
                        }
                    }
                    // Renk görseli bulunamadıysa ürünün ilk görseline düş
                    if (resolvedImageUrl == null &&
                            item.getProduct().getImages() != null &&
                            !item.getProduct().getImages().isEmpty()) {
                        resolvedImageUrl = item.getProduct().getImages().get(0).getImageUrl();
                    }
                    itemDto.setImageUrl(resolvedImageUrl);

                    return itemDto;
                })
                .collect(Collectors.toList())
        );

        return dto;
    }
}
