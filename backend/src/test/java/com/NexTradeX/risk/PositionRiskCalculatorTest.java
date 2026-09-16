package com.nextradex.modules.risk;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import com.nextradex.modules.trading.futures.PositionMode;

class PositionRiskCalculatorTest {

    private final PositionRiskCalculator calculator = new PositionRiskCalculator();

    @Test
    void calculatesLongPnlAndMaintenanceMarginRatio() {
        BigDecimal pnl = calculator.calculatePnl(
                PositionMode.LONG, new BigDecimal("100"), new BigDecimal("90"), new BigDecimal("2"));
        BigDecimal ratio = calculator.futuresMarginRatio(
                new BigDecimal("90"), new BigDecimal("2"), new BigDecimal("25"), pnl);

        assertEquals(0, pnl.compareTo(new BigDecimal("-20")));
        assertEquals(0, ratio.compareTo(new BigDecimal("0.5556")));
    }

    @Test
    void capsLiquidationLossAtPostedCollateral() {
        assertEquals(0, calculator.capLossAtCollateral(
                new BigDecimal("-90"), new BigDecimal("25")).compareTo(new BigDecimal("-25")));
    }
}
