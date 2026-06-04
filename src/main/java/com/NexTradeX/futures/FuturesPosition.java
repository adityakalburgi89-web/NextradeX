package com.NexTradeX.futures;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.NexTradeX.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "futures_positions",
    indexes = {
        @Index(
            name = "idx_user_symbol_mode",
            columnList = "user_id,symbol,position_mode"
        ),
        @Index(
            name = "idx_futures_user_status",
            columnList = "user_id,status"
        )
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuturesPosition {

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
    private PositionMode positionMode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PositionStatus status;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal entryPrice;

    @Column(precision = 19, scale = 8)
    private BigDecimal exitPrice;

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal leverage;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal collateral;

    @Builder.Default
    @Column(precision = 19, scale = 8)
    private BigDecimal unrealizedPnL = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 19, scale = 8)
    private BigDecimal realizedPnL = BigDecimal.ZERO;

    @Column(precision = 19, scale = 8)
    private BigDecimal markPrice;

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

    private String remarks;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
