package com.NexTradeX.order.strategy;

import com.NexTradeX.order.Order;
import java.math.BigDecimal;

/**
 * Strategy interface for order execution matching rules (OCP).
 */
public interface OrderMatchingStrategy {
    boolean shouldTrigger(Order order, BigDecimal currentPrice);
}
