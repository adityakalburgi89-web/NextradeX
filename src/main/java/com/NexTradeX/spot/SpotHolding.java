package com.NexTradeX.spot;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import com.NexTradeX.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "spot_holdings",
        uniqueConstraints = @UniqueConstraint(name = "uk_spot_holding_user_asset", columnNames = {"user_id", "asset"}),
        indexes = @Index(name = "idx_spot_holding_user", columnList = "user_id"))
@Getter
@NoArgsConstructor
public class SpotHolding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 16)
    private String asset;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal averageEntryPrice = BigDecimal.ZERO;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public static SpotHolding create(User user, String asset) {
        SpotHolding holding = new SpotHolding();
        holding.user = user;
        holding.asset = asset;
        return holding;
    }

    public void recordPurchase(BigDecimal purchasedQuantity, BigDecimal unitPrice) {
        requirePositive(purchasedQuantity, "Purchased quantity");
        requirePositive(unitPrice, "Unit price");
        BigDecimal nextQuantity = quantity.add(purchasedQuantity);
        BigDecimal totalCost = averageEntryPrice.multiply(quantity)
                .add(unitPrice.multiply(purchasedQuantity));
        quantity = nextQuantity;
        averageEntryPrice = totalCost.divide(nextQuantity, 8, RoundingMode.HALF_UP);
    }

    public void recordSale(BigDecimal soldQuantity) {
        requirePositive(soldQuantity, "Sold quantity");
        if (quantity.compareTo(soldQuantity) < 0) {
            throw new IllegalArgumentException("Insufficient asset quantity");
        }
        quantity = quantity.subtract(soldQuantity);
        if (quantity.compareTo(BigDecimal.ZERO) == 0) {
            averageEntryPrice = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private void requirePositive(BigDecimal value, String fieldName) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }
}
