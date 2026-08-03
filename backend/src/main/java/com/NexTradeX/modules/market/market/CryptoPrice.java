package com.nextradex.modules.market.market;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "crypto_prices", indexes = {
        @Index(name = "idx_symbol", columnList = "symbol", unique = true),
        @Index(name = "idx_updated_at", columnList = "updated_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoPrice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String symbol;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal currentPrice;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal highPrice;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal lowPrice;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal openPrice;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal priceChange24h;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal percentChange24h;
    
    @Column(precision = 25, scale = 0)
    private BigDecimal volume24h;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal marketCap;
    
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
