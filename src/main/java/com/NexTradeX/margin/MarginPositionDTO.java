package com.NexTradeX.margin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarginPositionDTO {
    private Long id;
    private String symbol;
    private String side;
    private String status;
    private BigDecimal quantity;
    private BigDecimal entryPrice;
    private BigDecimal exitPrice;
    private BigDecimal leverage;
    private BigDecimal borrowedAmount;
    private BigDecimal collateral;
    private BigDecimal interestAccrued;
    private BigDecimal interestRate;
    private BigDecimal unrealizedPnL;
    private BigDecimal realizedPnL;
    private BigDecimal marginRatio;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
}
