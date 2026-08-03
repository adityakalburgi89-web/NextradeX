package com.nextradex.modules.trading.order;

import com.nextradex.modules.market.market.IMarketService;
import com.nextradex.modules.trading.spot.SpotTradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

import com.nextradex.modules.trading.order.strategy.OrderMatchingStrategy;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderMatchingScheduler {

    private final OrderRepository orderRepository;
    private final SpotTradingService spotTradingService;
    private final IMarketService marketService;
    private final OrderMatchingStrategy orderMatchingStrategy;

    @Scheduled(fixedDelay = 5000)
    public void matchOpenOrders() {
        List<Order> openOrders = orderRepository.findByStatus(OrderStatus.OPEN);
        if (openOrders.isEmpty()) {
            return;
        }

        log.debug("Matching {} open orders against current market prices", openOrders.size());
        for (Order order : openOrders) {
            try {
                BigDecimal currentPrice = marketService.getPrice(order.getSymbol()).getCurrentPrice();
                boolean shouldTrigger = orderMatchingStrategy.shouldTrigger(order, currentPrice);

                if (shouldTrigger) {
                    if (order.getTradeType() == TradeType.SPOT) {
                        spotTradingService.executeSpotOrder(order.getId(), order.getUser().getId());
                    }
                }
            } catch (Exception e) {
                log.error("Failed to match order {}: {}", order.getId(), e.getMessage());
            }
        }
    }
}
