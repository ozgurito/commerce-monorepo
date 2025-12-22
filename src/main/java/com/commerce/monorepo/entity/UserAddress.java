package com.commerce.monorepo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_addresses")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class UserAddress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(length = 200)
    private String neighborhood;

    @Column(name = "address_line", nullable = false, columnDefinition = "TEXT")
    private String addressLine;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "address_type", nullable = false, length = 20)
    private AddressType addressType = AddressType.SHIPPING;

    public enum AddressType {
        SHIPPING,
        BILLING
    }

    /**
     * Tek satırlık adres formatı
     */
    public String getFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(addressLine);
        if (neighborhood != null && !neighborhood.isBlank()) {
            sb.append(", ").append(neighborhood);
        }
        sb.append(", ").append(district);
        sb.append(", ").append(city);
        if (postalCode != null && !postalCode.isBlank()) {
            sb.append(" ").append(postalCode);
        }
        return sb.toString();
    }
}

