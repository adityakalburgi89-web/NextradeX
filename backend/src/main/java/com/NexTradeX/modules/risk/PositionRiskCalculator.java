package com.nextradex.modules.risk;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;

import com.nextradex.modules.trading.futures.PositionMode;
import com.nextradex.modules.trading.order.OrderSide;

@Component
public class PositionRiskCalculator {

    public static final BigDecimal FUTURES_MAINTENANCE_RATE = new BigDecimal("0.05");
    public static final BigDecimal MARGIN_MAINTENANCE_RATIO = new BigDecimal("0.20");

    public BigDecimal calculatePnl(PositionMode mode, BigDecimal entryPrice,
            BigDecimal currentPrice, BigDecimal quantity) {
        BigDecimal movement = mode == PositionMode.LONG
                ? currentPrice.subtract(entryPrice)
                : entryPrice.subtract(currentPrice);
        return movement.multiply(quantity);
    }

    public BigDecimal calculatePnl(OrderSide side, BigDecimal entryPrice,
            BigDecimal currentPrice, BigDecimal quantity) {
        BigDecimal movement = side == OrderSide.BUY
                ? currentPrice.subtract(entryPrice)
                : entryPrice.subtract(currentPrice);
        return movement.multiply(quantity);
    }

    public BigDecimal futuresMarginRatio(BigDecimal currentPrice, BigDecimal quantity,
            BigDecimal collateral, BigDecimal unrealizedPnl) {
        BigDecimal maintenanceMargin = currentPrice.multiply(quantity)
                .multiply(FUTURES_MAINTENANCE_RATE);
        if (maintenanceMargin.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return collateral.add(unrealizedPnl)
                .divide(maintenanceMargin, 4, RoundingMode.HALF_UP);
    }

    public BigDecimal marginRatio(BigDecimal collateral, BigDecimal unrealizedPnl,
            BigDecimal accruedInterest, BigDecimal borrowedAmount) {
        if (borrowedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return collateral.add(unrealizedPnl).subtract(accruedInterest)
                .divide(borrowedAmount, 4, RoundingMode.HALF_UP);
    }

    public BigDecimal capLossAtCollateral(BigDecimal pnl, BigDecimal collateral) {
        return pnl.max(collateral.negate());
    }
}
