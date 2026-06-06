package com.NexTradeX.order;

import com.NexTradeX.market.MarketService;
import com.NexTradeX.spot.SpotTradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderMatchingScheduler {

    private final OrderRepository orderRepository;
    private final SpotTradingService spotTradingService;
    private final MarketService marketService;

    @Scheduled(fixedDelay = 5000)
    public void matchOpenOrders() {
        List<Order> openOrders = orderRepository.findByStatus(OrderStatus.OPEN);
        if (openOrders.isEmpty()) {
            return;
        }

        log.debug("Matching {} open orders against current market prices", openOrders.size());
        for (Order order : openOrders) {
            try {
                var priceData = marketService.getPrice(order.getSymbol());
                if (priceData == null || priceData.getCurrentPrice() == null) {
                    continue; // no price available yet; try again next cycle
                }
                BigDecimal currentPrice = priceData.getCurrentPrice();
                boolean shouldTrigger = false;

                if (order.getOrderType() == OrderType.LIMIT) {
                    if (order.getSide() == OrderSide.BUY && currentPrice.compareTo(order.getPrice()) <= 0) {
                        shouldTrigger = true;
                    } else if (order.getSide() == OrderSide.SELL && currentPrice.compareTo(order.getPrice()) >= 0) {
                        shouldTrigger = true;
                    }
                } else if (order.getOrderType() == OrderType.STOP_MARKET || order.getOrderType() == OrderType.STOP_LIMIT) {
                    BigDecimal stopPrice = order.getStopPrice();
                    if (stopPrice != null) {
                        if (order.getSide() == OrderSide.BUY && currentPrice.compareTo(stopPrice) >= 0) {
                            shouldTrigger = true;
                        } else if (order.getSide() == OrderSide.SELL && currentPrice.compareTo(stopPrice) <= 0) {
                            shouldTrigger = true;
                        }
                    }
                } else if (order.getOrderType() == OrderType.TAKE_PROFIT_MARKET || order.getOrderType() == OrderType.TAKE_PROFIT_LIMIT) {
                    BigDecimal stopPrice = order.getStopPrice();
                    if (stopPrice != null) {
                        if (order.getSide() == OrderSide.BUY && currentPrice.compareTo(stopPrice) <= 0) {
                            shouldTrigger = true;
                        } else if (order.getSide() == OrderSide.SELL && currentPrice.compareTo(stopPrice) >= 0) {
                            shouldTrigger = true;
                        }
                    }
                }

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
