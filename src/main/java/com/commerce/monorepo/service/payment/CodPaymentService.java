package com.commerce.monorepo.service.payment;

import com.commerce.monorepo.dto.OrderDto;
import com.commerce.monorepo.dto.payment.CodConfirmRequest;
import com.commerce.monorepo.entity.*;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodPaymentService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    /**
     * Kapıda ödeme siparişini WAITING_COD durumuna alır.
     * Sipariş oluşturulurken çağrılır, kargo gönderildiğinde gerçek ödeme alınır.
     */
    @Transactional
    public OrderDto confirmCod(CodConfirmRequest request) {
        Order order = orderRepository.findByIdWithItems(request.getOrderId())
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BaseException(ErrorCode.PAYMENT_ALREADY_PROCESSED,
                    "Sipariş PENDING durumunda değil");
        }
        if (order.getPaymentMethod() != PaymentMethod.CASH_ON_DELIVERY) {
            throw new BaseException(ErrorCode.PAYMENT_INIT_FAILED,
                    "Bu sipariş kapıda ödeme yöntemiyle oluşturulmamış");
        }

        order.setPaymentStatus(PaymentStatus.WAITING_COD);
        Order saved = orderRepository.save(order);

        log.info("Kapıda ödeme onaylandı — sipariş: {}", order.getOrderNumber());

        return orderService.mapToDtoPublic(saved);
    }
}
