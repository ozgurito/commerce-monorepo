package com.commerce.api.service;

import com.commerce.api.domain.*;
import com.commerce.api.dto.*;
import com.commerce.api.repo.CartItemRepository;
import com.commerce.api.repo.CartRepository;
import com.commerce.api.repo.ProductRepository;
import com.commerce.api.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartDto getMyCart() {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateActiveCart(currentUser);
        return mapToDto(cart);
    }

    public CartDto addToCart(AddToCartRequest request) {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateActiveCart(currentUser);

        // Check product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"
                ));

        // Check stock
        if (product.getStock() < request.getQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock (Available: " + product.getStock() + ")"
            );
        }

        // Check if product already in cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // Update quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            if (product.getStock() < newQuantity) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock (Available: " + product.getStock() + ")"
                );
            }

            existingItem.setQuantity(newQuantity);
            existingItem.calculateTotalPrice();
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setUnitPrice(product.getPrice());
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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cart item not found"
                ));

        // Check stock
        Product product = cartItem.getProduct();
        if (product.getStock() < request.getQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock (Available: " + product.getStock() + ")"
            );
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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cart item not found"
                ));

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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"
                ));
    }

    private CartDto mapToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setStatus(cart.getStatus());
        dto.setTotalAmount(cart.getTotalAmount());
        dto.setItemCount(cart.getItems().size());

        dto.setItems(cart.getItems().stream()
                .map(item -> new CartItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice(),
                        item.getProduct().getStock()
                ))
                .collect(Collectors.toList())
        );

        return dto;
    }
}