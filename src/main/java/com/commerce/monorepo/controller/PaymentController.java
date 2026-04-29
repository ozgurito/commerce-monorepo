package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.dto.payment.*;
import com.commerce.monorepo.service.payment.BankTransferPaymentService;
import com.commerce.monorepo.service.payment.CodPaymentService;
import com.commerce.monorepo.service.payment.IyzicoPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Ödeme işlemleri — iyzico, havale/EFT, kapıda ödeme")
public class PaymentController {

    private final IyzicoPaymentService iyzicoPaymentService;
    private final BankTransferPaymentService bankTransferPaymentService;
    private final CodPaymentService codPaymentService;

    // ====== iyzico ======

    @PostMapping("/iyzico/init")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "iyzico ödeme başlat", description = "Checkout form token döner")
    public ResponseEntity<IyzicoCheckoutInitResponse> initIyzico(
            @Valid @RequestBody IyzicoCheckoutInitRequest request) {
        return ResponseEntity.ok(iyzicoPaymentService.initCheckout(request));
    }

    @PostMapping("/iyzico/callback")
    @Operation(summary = "iyzico 3D callback", description = "iyzico'dan gelen token ile ödemeyi doğrular (permitAll)")
    public ResponseEntity<OrderDto> iyzicoCallback(
            @Valid @RequestBody IyzicoCallbackRequest request) {
        return ResponseEntity.ok(iyzicoPaymentService.handleCallback(request));
    }

    // ====== Havale / EFT ======

    @PostMapping("/bank-transfer/init")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Havale başlat", description = "IBAN ve banka bilgilerini döner, sipariş WAITING_TRANSFER'a alınır")
    public ResponseEntity<BankTransferInitResponse> initBankTransfer(
            @Valid @RequestBody BankTransferInitRequest request) {
        return ResponseEntity.ok(bankTransferPaymentService.initTransfer(request));
    }

    @PostMapping("/bank-transfer/callback")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Havale onayla (ADMIN)", description = "Admin havaleyi onaylar, sipariş PAID'a geçer")
    public ResponseEntity<OrderDto> confirmBankTransfer(
            @Valid @RequestBody BankTransferCallbackRequest request) {
        return ResponseEntity.ok(bankTransferPaymentService.confirmTransfer(request));
    }

    // ====== Kapıda Ödeme ======

    @PostMapping("/cod/confirm")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Kapıda ödeme onayla", description = "Siparişi WAITING_COD durumuna alır")
    public ResponseEntity<OrderDto> confirmCod(
            @Valid @RequestBody CodConfirmRequest request) {
        return ResponseEntity.ok(codPaymentService.confirmCod(request));
    }
}
