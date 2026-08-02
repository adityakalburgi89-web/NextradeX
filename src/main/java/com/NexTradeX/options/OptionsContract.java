package com.NexTradeX.options;

import com.NexTradeX.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "options_contracts", indexes = {
        @Index(name = "idx_options_user_symbol", columnList = "user_id,symbol"),
        @Index(name = "idx_expiry", columnList = "expiry_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionsContract {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String symbol;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OptionType optionType; // CALL or PUT
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OptionStatus status;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal strikePrice;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal premium;
    
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal quantity;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal settlementPrice;
    
    @Builder.Default
    @Column(precision = 19, scale = 8)
    private BigDecimal profitLoss = BigDecimal.ZERO;
    
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    private LocalDateTime settledAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
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
