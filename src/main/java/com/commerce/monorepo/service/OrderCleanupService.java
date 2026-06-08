package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.Order;
import com.commerce.monorepo.entity.OrderItem;
import com.commerce.monorepo.entity.OrderStatus;
import com.commerce.monorepo.entity.PaymentStatus;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.ProductRepository;
import com.commerce.monorepo.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Paket 6 — Pending Payment Cleanup
 *
 * Sipariş oluşturulurken stok hemen düşüyor. Kullanıcı kredi kartı ödemesini tamamlamaz/3D Secure'dan
 * dönmez/ödeme başarısız olursa sipariş PENDING kalır ve stok kilitlenmiş kalır. Bu servis, belirli bir
 * süreden (varsayılan 60dk) eski ve ödemesi alınmamış PENDING siparişleri otomatik olarak CANCELLED yapar
 * ve stoklarını geri koyar.
 *
 * Idempotency: Sadece OrderStatus.PENDING olan siparişler sorgulanır; işlem sonrası CANCELLED yapılan
 * sipariş bir sonraki çalışmada sorguya hiç girmez. Ek olarak loop içinde status/paymentStatus guard'ları
 * vardır — aynı siparişin stoğu ikinci kez artırılamaz.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    @Value("${order.cleanup.expire-after-minutes:60}")
    private long expireAfterMinutes;

    @Transactional
    public int cleanupExpiredPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(expireAfterMinutes);

        // Sadece online ödeme yarıda kalmış siparişler hedeflenir.
        // WAITING_TRANSFER (havale bekliyor), WAITING_COD (kapıda ödeme), PAID, REFUNDED dahil edilmez.
        List<PaymentStatus> statuses = List.of(
                PaymentStatus.WAITING,
                PaymentStatus.INITIATED,
                PaymentStatus.FAILED
        );

        List<Order> orders = orderRepository.findExpiredPendingOrders(
                OrderStatus.PENDING,
                statuses,
                cutoff
        );

        int cleaned = 0;

        for (Order order : orders) {
            // Idempotency guard — sorgu sonrası başka bir akışla durum değişmiş olabilir
            if (order.getStatus() != OrderStatus.PENDING) {
                continue;
            }
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                continue;
            }

            restoreStock(order);
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            cleaned++;
            log.info("Expired pending order cancelled and stock restored. orderId={}, orderNumber={}",
                    order.getId(), order.getOrderNumber());
        }

        return cleaned;
    }

    /**
     * OrderService.cancelOrder() (satır 262-273) ile BİREBİR aynı stok geri koyma mantığı.
     * Variant varsa variant stoku, yoksa (geriye dönük uyumluluk için) ürün stoku artırılır.
     */
    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProductVariantId() != null) {
                productVariantRepository.increaseStock(item.getProductVariantId(), item.getQuantity());
            } else {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
    }
}
