package com.NexTradeX.order.strategy;

import com.NexTradeX.order.Order;
import com.NexTradeX.order.OrderSide;
import com.NexTradeX.order.OrderType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DefaultOrderMatchingStrategy implements OrderMatchingStrategy {

    @Override
    public boolean shouldTrigger(Order order, BigDecimal currentPrice) {
        if (order == null || currentPrice == null) {
            return false;
        }

        OrderType type = order.getOrderType();
        if (type == OrderType.LIMIT) {
            return isLimitTriggered(order, currentPrice);
        } else if (type == OrderType.STOP_MARKET || type == OrderType.STOP_LIMIT) {
            return isStopTriggered(order, currentPrice);
        } else if (type == OrderType.TAKE_PROFIT_MARKET || type == OrderType.TAKE_PROFIT_LIMIT) {
            return isTakeProfitTriggered(order, currentPrice);
        }

        return false;
    }

    private boolean isLimitTriggered(Order order, BigDecimal currentPrice) {
        if (order.getPrice() == null) return false;
        if (order.getSide() == OrderSide.BUY) {
            return currentPrice.compareTo(order.getPrice()) <= 0;
        } else {
            return currentPrice.compareTo(order.getPrice()) >= 0;
        }
    }

    private boolean isStopTriggered(Order order, BigDecimal currentPrice) {
        BigDecimal stopPrice = order.getStopPrice();
        if (stopPrice == null) return false;
        if (order.getSide() == OrderSide.BUY) {
            return currentPrice.compareTo(stopPrice) >= 0;
        } else {
            return currentPrice.compareTo(stopPrice) <= 0;
        }
    }

    private boolean isTakeProfitTriggered(Order order, BigDecimal currentPrice) {
        BigDecimal stopPrice = order.getStopPrice();
        if (stopPrice == null) return false;
        if (order.getSide() == OrderSide.BUY) {
            return currentPrice.compareTo(stopPrice) <= 0;
        } else {
            return currentPrice.compareTo(stopPrice) >= 0;
        }
    }
}
