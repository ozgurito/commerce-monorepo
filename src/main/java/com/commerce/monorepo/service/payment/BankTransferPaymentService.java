package com.commerce.monorepo.service.payment;

import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.dto.payment.BankTransferCallbackRequest;
import com.commerce.monorepo.dto.payment.BankTransferInitRequest;
import com.commerce.monorepo.dto.payment.BankTransferInitResponse;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.service.EmailService;
import com.commerce.monorepo.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankTransferPaymentService {

    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final OrderService orderService;

    @Value("${app.bank.iban:TR000000000000000000000000}")
    private String iban;

    @Value("${app.bank.account-holder:Your Store Ltd.}")
    private String accountHolder;

    @Value("${app.bank.name:}")
    private String bankName;

    @Value("${app.bank.transfer-deadline-hours:48}")
    private String deadlineHours;

    /**
     * Havale/EFT bilgilerini döner ve siparişi WAITING_TRANSFER durumuna alır.
     */
    @Transactional
    public BankTransferInitResponse initTransfer(BankTransferInitRequest request) {
        Order order = orderRepository.findByIdWithItems(request.getOrderId())
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BaseException(ErrorCode.PAYMENT_ALREADY_PROCESSED,
                    "Sipariş PENDING durumunda değil");
        }
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BaseException(ErrorCode.PAYMENT_ALREADY_PROCESSED,
                    "Bu sipariş zaten ödenmiş");
        }
        if (order.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            throw new BaseException(ErrorCode.PAYMENT_INIT_FAILED,
                    "Bu sipariş havale/EFT ödeme yöntemiyle oluşturulmamış");
        }

        order.setPaymentStatus(PaymentStatus.WAITING_TRANSFER);
        orderRepository.save(order);

        log.info("Havale başlatıldı — sipariş: {}, tutar: {}",
                order.getOrderNumber(), order.getTotal());

        String description = "Sipariş No: " + order.getOrderNumber();

        return BankTransferInitResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .amount(order.getTotal())
                .iban(iban)
                .accountHolder(accountHolder)
                .bankName(bankName)
                .description(description)
                .deadlineHours(deadlineHours)
                .message(deadlineHours + " saat içinde havaleyi gerçekleştirin. "
                        + "Açıklama kısmına sipariş numaranızı (" + order.getOrderNumber() + ") yazmayı unutmayın.")
                .build();
    }

    /**
     * Admin tarafından havale onayı — siparişi PAID durumuna geçirir.
     */
    @Transactional
    public OrderDto confirmTransfer(BankTransferCallbackRequest request) {
        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getPaymentStatus() != PaymentStatus.WAITING_TRANSFER) {
            throw new BaseException(ErrorCode.PAYMENT_ALREADY_PROCESSED,
                    "Bu sipariş WAITING_TRANSFER durumunda değil");
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.PAID);
        Order saved = orderRepository.save(order);

        log.info("Havale onaylandı — sipariş: {}, admin notu: {}",
                order.getOrderNumber(), request.getAdminNote());

        emailService.sendPaymentSuccessEmail(saved);

        return orderService.mapToDtoPublic(saved);
    }
}
