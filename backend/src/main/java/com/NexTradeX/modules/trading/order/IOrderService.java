package com.nextradex.modules.trading.order;

import java.math.BigDecimal;
import java.util.List;

/**
 * Interface contract for Order Service.
 */
public interface IOrderService {
    Order createOrder(Long userId, String symbol, OrderSide side, OrderType orderType, BigDecimal quantity, BigDecimal price, BigDecimal stopPrice, TradeType tradeType, BigDecimal leverage);
    Order fillOrder(Long orderId, BigDecimal filledQuantity, BigDecimal filledPrice);
    Order cancelOrder(Long orderId, Long userId);
    Order getOrder(Long orderId, Long userId);
    List<Order> getActiveOrders(Long userId);
    List<Order> getOrderHistory(Long userId);
    List<Order> getOrdersBySymbol(Long userId, String symbol);
}
