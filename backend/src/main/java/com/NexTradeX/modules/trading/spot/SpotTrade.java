package com.nextradex.modules.trading.spot;

import com.nextradex.modules.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "spot_trades", indexes = {
        @Index(name = "idx_spot_trades_user_symbol", columnList = "user_id,symbol"),
        @Index(name = "idx_spot_trades_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpotTrade {
    
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
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal quantity;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal executionPrice;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal totalValue;
    
    @Builder.Default
    @Column(precision = 19, scale = 8)
    private BigDecimal commission = BigDecimal.ZERO;
    
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private String remarks;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
