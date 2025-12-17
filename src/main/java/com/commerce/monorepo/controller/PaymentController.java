package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.dto.payment.IyzicoCallbackRequest;
import com.commerce.monorepo.dto.payment.IyzicoCheckoutInitRequest;
import com.commerce.monorepo.dto.payment.IyzicoCheckoutInitResponse;
import com.commerce.monorepo.service.payment.IyzicoPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/iyzico")
@RequiredArgsConstructor
public class PaymentController {

    private final IyzicoPaymentService iyzicoPaymentService;

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "iyzico ödeme başlat", description = "Checkout form token ve ödeme sayfası linki döner")
    public ResponseEntity<IyzicoCheckoutInitResponse> initCheckout(@Valid @RequestBody IyzicoCheckoutInitRequest request) {
        return ResponseEntity.ok(iyzicoPaymentService.initCheckout(request));
    }

    @PostMapping("/callback")
    @Operation(summary = "iyzico callback", description = "iyzico tarafından gönderilen token ile ödemeyi doğrular")
    public ResponseEntity<OrderDto> handleCallback(@Valid @RequestBody IyzicoCallbackRequest request) {
        return ResponseEntity.ok(iyzicoPaymentService.handleCallback(request));
    }
}

