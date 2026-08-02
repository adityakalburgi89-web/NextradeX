package com.NexTradeX.margin;

import com.NexTradeX.order.Order;
import com.NexTradeX.order.OrderSide;
import java.math.BigDecimal;
import java.util.List;

/**
 * Interface contract for Margin Trading operations.
 */
public interface IMarginTradingService {
    Order openMarginPosition(Long userId, String symbol, OrderSide side, BigDecimal quantity, BigDecimal leverage);
    void closeMarginPosition(Long positionId, Long userId);
    void updatePositionPrice(Long positionId, BigDecimal currentPrice);
    void liquidatePosition(Long positionId);
    List<MarginPosition> getUserOpenPositions(Long userId);
    List<MarginPosition> getUserAllPositions(Long userId);
}
