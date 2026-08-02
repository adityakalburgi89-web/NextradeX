package com.NexTradeX.futures;

import com.NexTradeX.order.Order;
import com.NexTradeX.order.OrderSide;
import java.math.BigDecimal;
import java.util.List;

/**
 * Interface contract for Futures Trading operations.
 */
public interface IFuturesTradingService {
    Order openFuturesPosition(Long userId, String symbol, OrderSide side, BigDecimal quantity, BigDecimal leverage);
    void closeFuturesPosition(Long positionId, Long userId);
    void closeFuturesPosition(Long positionId, Long userId, String remarks);
    FuturesPosition updateSlTp(Long positionId, Long userId, BigDecimal stopLoss, BigDecimal takeProfit);
    void liquidatePosition(Long positionId);
    List<FuturesPosition> getUserOpenPositions(Long userId);
    List<FuturesPosition> getUserAllPositions(Long userId);
}
