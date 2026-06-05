package com.NexTradeX.futures;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuturesPositionDTO {
    private Long id;
    private String symbol;
    private String positionMode;
    private BigDecimal quantity;
    private BigDecimal entryPrice;
    private BigDecimal markPrice;
    private BigDecimal unrealizedPnL;
    private BigDecimal leverage;
    private BigDecimal marginRatio;
    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
    private String remarks;
}
