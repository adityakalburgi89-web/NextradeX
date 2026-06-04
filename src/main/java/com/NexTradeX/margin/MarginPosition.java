package com.NexTradeX.margin;

import com.NexTradeX.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "margin_positions", indexes = {
        @Index(name = "idx_margin_user_symbol", columnList = "user_id,symbol", unique = true),
        @Index(name = "idx_margin_user_status", columnList = "user_id,status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarginPosition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String symbol;
    
    @Column(nullable = false)
    private String side; // BUY or SELL
    
    @Column(nullable = false)
    private String status; // OPEN, CLOSED, LIQUIDATED
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal quantity;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal entryPrice;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal exitPrice;
    
    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal leverage;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal borrowedAmount;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal collateral;
    
    @Builder.Default
    @Column(precision = 19, scale = 8)
    private BigDecimal interestAccrued = BigDecimal.ZERO;
    
    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal interestRate = new BigDecimal("0.0005"); // 0.05% per day
    
    @Builder.Default
    @Column(precision = 19, scale = 8)
    private BigDecimal unrealizedPnL = BigDecimal.ZERO;
    
    @Builder.Default
    @Column(precision = 19, scale = 8)
    private BigDecimal realizedPnL = BigDecimal.ZERO;
    
    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal marginRatio = BigDecimal.ZERO;
    
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime openedAt = LocalDateTime.now();
    
    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    private LocalDateTime closedAt;
    
    @PrePersist
    protected void onCreate() {
        if (openedAt == null) {
            openedAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
