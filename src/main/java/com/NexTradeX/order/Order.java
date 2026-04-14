package com.NexTradeX.order;

import com.NexTradeX.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_user_id", columnList = "user_id"),
        @Index(name = "idx_orders_symbol", columnList = "symbol"),
        @Index(name = "idx_orders_status", columnList = "status"),
        @Index(name = "idx_orders_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String symbol;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderSide side;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType orderType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.OPEN;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeType tradeType;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal quantity;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal price;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal filledQuantity = BigDecimal.ZERO;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal averagePrice = BigDecimal.ZERO;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal commission = BigDecimal.ZERO;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal leverage = BigDecimal.ONE;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    private LocalDateTime filledAt;
    
    private String remarks;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
