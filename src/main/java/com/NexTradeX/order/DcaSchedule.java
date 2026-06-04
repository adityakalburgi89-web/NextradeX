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
@Table(name = "dca_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DcaSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal amountUSDT;

    @Column(nullable = false)
    private int frequencySeconds; // e.g. 10s or daily (86400s)

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime nextRunTime = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
