package com.nextradex.modules.trading.order.strategy;

import com.nextradex.modules.trading.order.Order;
import java.math.BigDecimal;

/**
 * Strategy interface for order execution matching rules (OCP).
 */
public interface OrderMatchingStrategy {
    boolean shouldTrigger(Order order, BigDecimal currentPrice);
}
