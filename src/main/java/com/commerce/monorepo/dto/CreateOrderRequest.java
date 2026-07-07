package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.Address;
import com.commerce.monorepo.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    private List<OrderItemRequest> items;

    @NotNull(message = "Shipping address is required")
    @Valid
    private Address shippingAddress;

    @NotNull(message = "Billing address is required")
    @Valid
    private Address billingAddress;

    private String notes;

    private String couponCode;

    /** Ödeme yöntemi — varsayılan kredi kartı */
    private PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;

    /** Misafir müşteri email adresi (login olmadıysa) */
    @Email(message = "Geçerli bir email adresi girin")
    private String guestEmail;
}