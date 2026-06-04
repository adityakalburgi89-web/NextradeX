package com.NexTradeX.order;

import com.NexTradeX.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByUser(User user);
    List<Order> findAllByUserAndStatus(User user, OrderStatus status);
    List<Order> findAllBySymbol(String symbol);
    List<Order> findAllByUserAndSymbol(User user, String symbol);
    List<Order> findAllByUserAndCreatedAtBetween(User user, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT o FROM Order o WHERE o.user = :user AND o.status IN ('OPEN', 'PARTIALLY_FILLED')")
    List<Order> findActiveOrdersByUser(@Param("user") User user);
    
    Optional<Order> findByIdAndUser(Long orderId, User user);
    List<Order> findByStatus(OrderStatus status);
}
