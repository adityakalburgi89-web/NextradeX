package com.NexTradeX.market;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MarketWebSocketController {

    private final MarketService marketService;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, CryptoPrice> lastPrices = new ConcurrentHashMap<>();

    @MessageMapping("/price.subscribe")
    @SendTo("/topic/prices")
    public CryptoPrice subscribeToPrices(String symbol) {
        try {
            CryptoPrice price = marketService.getPrice(symbol);
            lastPrices.put(symbol, price);
            return price;
        } catch (Exception e) {
            log.error("Error fetching price for {}: {}", symbol, e.getMessage());
            CryptoPrice cached = lastPrices.get(symbol);
            if (cached != null) {
                return cached;
            }
            return CryptoPrice.builder()
                    .symbol(symbol)
                    .currentPrice(BigDecimal.ZERO)
                    .updatedAt(java.time.LocalDateTime.now())
                    .build();
        }
    }

    @MessageMapping("/price.subscribe.all")
    @SendTo("/topic/prices")
    public List<CryptoPrice> subscribeToAllPrices() {
        try {
            List<CryptoPrice> prices = marketService.getAllPrices();
            for (CryptoPrice price : prices) {
                lastPrices.put(price.getSymbol(), price);
            }
            return prices;
        } catch (Exception e) {
            log.error("Error fetching all prices: {}", e.getMessage());
            return List.of();
        }
    }

    //@Scheduled(fixedRate = 50000)
    public void broadcastPrices() {
        try {
            marketService.syncMarketPrices();
            List<CryptoPrice> prices = marketService.getAllPrices();
            if (!prices.isEmpty()) {
                log.debug("[WS] Broadcasting prices for {} symbols to /topic/prices", prices.size());
                messagingTemplate.convertAndSend("/topic/prices", prices);
            } else {
                log.warn("[WS] No prices to broadcast");
            }
        } catch (Exception e) {
            log.error("[WS] Scheduled price broadcast failed: {}", e.getMessage());
        }
    }
}
