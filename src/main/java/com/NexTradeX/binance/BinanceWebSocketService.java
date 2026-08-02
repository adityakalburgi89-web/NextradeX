package com.NexTradeX.binance;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.NexTradeX.market.MarketService;
import com.NexTradeX.market.CryptoPrice;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@ConditionalOnProperty(prefix = "nextradex.market.websocket", name = "enabled", havingValue = "true", matchIfMissing = true)
public class BinanceWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final MarketService marketService;
    private final BinanceService binanceService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private WebSocketClient client;
    private boolean reconnecting = false;
    private int consecutiveFailureCount = 0;
    private static final int MAX_FAILURE_THRESHOLD = 3;

    public BinanceWebSocketService(
            SimpMessagingTemplate messagingTemplate,
            MarketService marketService,
            BinanceService binanceService
    ) {
        this.messagingTemplate = messagingTemplate;
        this.marketService = marketService;
        this.binanceService = binanceService;
        connect();
    }

    public synchronized void connect() {
        if (client != null && 
            client.getReadyState() != org.java_websocket.enums.ReadyState.CLOSED && 
            client.getReadyState() != org.java_websocket.enums.ReadyState.CLOSING) {
            return;
        }

        String socketUrl = binanceService.getEffectiveWebSocketUrl();
        String activeProvider = binanceService.getActiveProviderName();

        System.out.println("[Market WS] Connecting to " + activeProvider + " WS: " + socketUrl);

        client = new WebSocketClient(URI.create(socketUrl)) {

            @Override
            public void onOpen(ServerHandshake handshake) {
                System.out.println("[Market WS] Connected successfully to " + activeProvider);
                consecutiveFailureCount = 0; // reset on successful connection
                
                try {
                    if ("BYBIT".equals(activeProvider)) {
                        String subMessage = "{\"op\":\"subscribe\",\"args\":[\"tickers.BTCUSDT\",\"tickers.ETHUSDT\",\"tickers.BNBUSDT\",\"tickers.SOLUSDT\",\"tickers.DOTUSDT\"]}";
                        send(subMessage);
                        System.out.println("[Market WS] Sent Bybit subscription payload");
                    } else if ("MEXC".equals(activeProvider)) {
                        String subMessage = "{\"method\":\"SUB\",\"params\":[\"spot@public.ticker.v3.api@BTCUSDT\",\"spot@public.ticker.v3.api@ETHUSDT\",\"spot@public.ticker.v3.api@BNBUSDT\",\"spot@public.ticker.v3.api@SOLUSDT\",\"spot@public.ticker.v3.api@DOTUSDT\"]}";
                        send(subMessage);
                        System.out.println("[Market WS] Sent MEXC subscription payload");
                    }
                } catch (Exception e) {
                    System.err.println("[Market WS] Error sending subscription payload: " + e.getMessage());
                }
            }

            @Override
            public void onMessage(String message) {
                try {
                    JsonNode root = objectMapper.readTree(message);
                    
                    if ("BINANCE".equals(activeProvider)) {
                        JsonNode data = root.get("data");
                        if (data != null) {
                            String symbol = data.get("s").asText().toUpperCase();
                            BigDecimal price = new BigDecimal(data.get("c").asText());
                            BigDecimal open = new BigDecimal(data.get("o").asText());
                            BigDecimal high = new BigDecimal(data.get("h").asText());
                            BigDecimal low = new BigDecimal(data.get("l").asText());
                            BigDecimal priceChange = new BigDecimal(data.get("p").asText());
                            BigDecimal percentChange = new BigDecimal(data.get("P").asText());
                            BigDecimal volume = new BigDecimal(data.get("v").asText());
                            broadcastPrice(symbol, price, high, low, open, priceChange, percentChange, volume);
                        }
                    } else if ("BYBIT".equals(activeProvider)) {
                        if (root.has("data")) {
                            JsonNode data = root.get("data");
                            if (data.isArray() && data.size() > 0) {
                                data = data.get(0);
                            }
                            if (data.has("symbol")) {
                                String symbol = data.get("symbol").asText().toUpperCase();
                                BigDecimal price = new BigDecimal(data.get("lastPrice").asText());
                                BigDecimal open = new BigDecimal(data.get("prevPrice24h").asText());
                                BigDecimal high = new BigDecimal(data.get("highPrice24h").asText());
                                BigDecimal low = new BigDecimal(data.get("lowPrice24h").asText());
                                BigDecimal priceChange = price.subtract(open);
                                BigDecimal percentChange = open.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO 
                                        : priceChange.divide(open, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                                BigDecimal volume = new BigDecimal(data.get("volume24h").asText());
                                broadcastPrice(symbol, price, high, low, open, priceChange, percentChange, volume);
                            }
                        }
                    } else if ("MEXC".equals(activeProvider)) {
                        JsonNode d = root.get("d");
                        if (d != null) {
                            String symbol = d.has("s") ? d.get("s").asText().toUpperCase() : null;
                            if (symbol == null && root.has("c")) {
                                String channel = root.get("c").asText();
                                String[] parts = channel.split("@");
                                if (parts.length > 2) {
                                    symbol = parts[2].toUpperCase();
                                }
                            }
                            if (symbol != null) {
                                BigDecimal price = new BigDecimal(d.get("p").asText());
                                BigDecimal high = new BigDecimal(d.get("h").asText());
                                BigDecimal low = new BigDecimal(d.get("l").asText());
                                BigDecimal open = new BigDecimal(d.get("o").asText());
                                BigDecimal priceChange = price.subtract(open);
                                BigDecimal percentChange = open.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO 
                                        : priceChange.divide(open, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                                BigDecimal volume = new BigDecimal(d.get("v").asText());
                                broadcastPrice(symbol, price, high, low, open, priceChange, percentChange, volume);
                            }
                        }
                    }
                } catch (Exception e) {
                    // Ignore parsing issues for malformed or heartbeat messages
                }
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {
                System.out.println("[Market WS] Closed: provider=" + activeProvider + ", code=" + code + ", reason=" + reason + ", remote=" + remote);
                handleFailure(activeProvider);
            }

            @Override
            public void onError(Exception ex) {
                System.err.println("[Market WS] Error occurred on provider " + activeProvider + ": " + ex.getMessage());
                handleFailure(activeProvider);
            }
        };

        client.connect();
    }

    private void broadcastPrice(String symbol, BigDecimal price, BigDecimal high, BigDecimal low, 
                                BigDecimal open, BigDecimal priceChange, BigDecimal percentChange, BigDecimal volume) {
        try {
            CryptoPrice updatedPrice = marketService.updateOrCreatePrice(
                symbol,
                price,
                high,
                low,
                open,
                priceChange,
                percentChange,
                volume,
                null
            );
            messagingTemplate.convertAndSend("/topic/prices", updatedPrice);
        } catch (Exception e) {
            System.err.println("[Market WS] Error updating/broadcasting price: " + e.getMessage());
        }
    }

    private synchronized void handleFailure(String provider) {
        consecutiveFailureCount++;
        System.out.println("[Market WS] Failure count for " + provider + ": " + consecutiveFailureCount);
        
        if (consecutiveFailureCount >= MAX_FAILURE_THRESHOLD) {
            System.out.println("[Market WS] Max failure threshold reached for " + provider + ". Triggering failover cooldown.");
            consecutiveFailureCount = 0; // reset
            
            String baseUrl = "https://api.binance.com";
            if ("BYBIT".equals(provider)) {
                baseUrl = "https://api.bybit.com";
            } else if ("MEXC".equals(provider)) {
                baseUrl = "https://api.mexc.com";
            }
            
            binanceService.triggerWsCooldown(baseUrl);
        }
        
        triggerReconnect();
    }

    private synchronized void triggerReconnect() {
        if (reconnecting) {
            return;
        }
        reconnecting = true;

        new Thread(() -> {
            try {
                System.out.println("[Market WS] Disconnected. Will attempt auto-reconnect in 5 seconds...");
                Thread.sleep(5000);
                connect();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("[Market WS] Reconnect thread interrupted");
            } finally {
                reconnecting = false;
            }
        }).start();
    }
}
