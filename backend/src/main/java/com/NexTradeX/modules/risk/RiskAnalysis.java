package com.nextradex.modules.risk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAnalysis {
    private Long userId;
    private BigDecimal totalUnrealizedPnL;
    private BigDecimal totalCollateral;
    private BigDecimal maxLiquidationRisk;
    private Integer futuresPositionCount;
    private Integer marginPositionCount;
    private Boolean isHighRisk;
}
