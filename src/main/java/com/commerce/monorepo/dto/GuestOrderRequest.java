package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.Address;
import com.commerce.monorepo.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Misafir (login olmadan) sipariş isteği.
 * CreateOrderRequest'e ek olarak guestEmail zorunlu.
 */
@Data
public class GuestOrderRequest {

    @NotBlank(message = "Misafir email adresi zorunludur")
    @Email(message = "Geçerli bir email adresi girin")
    private String guestEmail;

    @NotEmpty(message = "Sipariş kalemleri boş olamaz")
    @Valid
    private List<OrderItemRequest> items;

    @NotNull(message = "Teslimat adresi zorunludur")
    @Valid
    private Address shippingAddress;

    @NotNull(message = "Fatura adresi zorunludur")
    @Valid
    private Address billingAddress;

    private String notes;
    private String couponCode;

    /** Ödeme yöntemi — varsayılan kredi kartı */
    private PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;
}
