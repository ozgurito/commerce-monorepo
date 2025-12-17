package com.commerce.monorepo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wishlist_items", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class WishlistItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}

