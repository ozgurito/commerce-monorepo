package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.Order;
import com.commerce.monorepo.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Long countByStatus(OrderStatus status);

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :orderId")
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
}
