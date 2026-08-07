package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.Order;
import com.commerce.monorepo.entity.OrderStatus;
import com.commerce.monorepo.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Long countByStatus(OrderStatus status);

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.items WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(Long orderId);

    Long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')")
    BigDecimal calculateTotalRevenue();

    @Query(value = "SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.items item LEFT JOIN FETCH item.product ORDER BY o.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT o) FROM Order o")
    Page<Order> findAllWithUserAndItems(Pageable pageable);

    @Query(value = "SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.items item LEFT JOIN FETCH item.product WHERE o.status = :status ORDER BY o.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT o) FROM Order o WHERE o.status = :status")
    Page<Order> findByStatusWithUserAndItems(OrderStatus status, Pageable pageable);

    @Query(value = """
        SELECT
            CAST(EXTRACT(YEAR FROM o.created_at) AS integer)  AS year,
            CAST(EXTRACT(MONTH FROM o.created_at) AS integer) AS month,
            COUNT(o.id)                           AS orderCount,
            COALESCE(SUM(o.total_amount), 0)      AS revenue
        FROM orders o
        WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
          AND o.created_at >= NOW() - INTERVAL '6 months'
        GROUP BY EXTRACT(YEAR FROM o.created_at), EXTRACT(MONTH FROM o.created_at)
        ORDER BY year ASC, month ASC
        """, nativeQuery = true)
    java.util.List<Object[]> findMonthlyStats();

    // Paket 6 — Pending payment cleanup: 60dk+ eski, ödenmemiş PENDING siparişleri bulur.
    // DISTINCT şart: left join fetch o.items ile birden fazla item'lı siparişler duplicate dönmesin.
    @Query("""
        select distinct o from Order o
        left join fetch o.items i
        left join fetch i.product p
        where o.status = :status
          and o.paymentStatus in :paymentStatuses
          and o.createdAt < :cutoff
    """)
    List<Order> findExpiredPendingOrders(
        @Param("status") OrderStatus status,
        @Param("paymentStatuses") List<PaymentStatus> paymentStatuses,
        @Param("cutoff") LocalDateTime cutoff
    );
}
