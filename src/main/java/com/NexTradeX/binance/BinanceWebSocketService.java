package com.NexTradeX.binance;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDateTime;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.NexTradeX.market.MarketService;
import com.NexTradeX.market.CryptoPrice;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PreDestroy;

@Service
public class BinanceWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final MarketService marketService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private WebSocketClient client;
    private boolean reconnecting = false;
    private volatile boolean shuttingDown = false;

    public BinanceWebSocketService(
            SimpMessagingTemplate messagingTemplate,
            MarketService marketService
    ) {
        this.messagingTemplate = messagingTemplate;
        this.marketService = marketService;
        connect();
    }

    public synchronized void connect() {
        if (client != null && 
            client.getReadyState() != org.java_websocket.enums.ReadyState.CLOSED && 
            client.getReadyState() != org.java_websocket.enums.ReadyState.CLOSING) {
            return;
        }

        String socketUrl =
                "wss://stream.binance.com:9443/stream?streams="
                + "btcusdt@ticker/"
                + "ethusdt@ticker/"
                + "bnbusdt@ticker/"
                + "solusdt@ticker/"
                + "dotusdt@ticker";

        System.out.println("[Binance WS] Connecting to: " + socketUrl);

        client = new WebSocketClient(URI.create(socketUrl)) {

            @Override
            public void onOpen(ServerHandshake handshake) {
                System.out.println("[Binance WS] Connected successfully");
            }

            @Override
            public void onMessage(String message) {
                if (shuttingDown) {
                    return;
                }
                try {
                    JsonNode root = objectMapper.readTree(message);
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

                        // Broadcast the live tick FIRST so clients always receive real-time
                        // prices even if the database is temporarily unavailable (e.g. during
                        // shutdown or a connection-pool hiccup).
                        CryptoPrice tick = CryptoPrice.builder()
                                .symbol(symbol)
                                .currentPrice(price)
                                .highPrice(high)
                                .lowPrice(low)
                                .openPrice(open)
                                .priceChange24h(priceChange)
                                .percentChange24h(percentChange)
                                .volume24h(volume)
                                .updatedAt(LocalDateTime.now())
                                .build();
                        messagingTemplate.convertAndSend("/topic/prices", tick);

                        // Best-effort persistence (debounced inside MarketService). A failure
                        // here must never stop the live stream above.
                        try {
                            marketService.updateOrCreatePrice(
                                symbol, price, high, low, open, priceChange, percentChange, volume, null
                            );
                        } catch (Exception persistEx) {
                            // DB unavailable (often during shutdown) — streaming still works.
                        }
                    }
                } catch (Exception e) {
                    System.err.println("[Binance WS] Error parsing stream message: " + e.getMessage());
                }
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {
                System.out.println("[Binance WS] Closed: code=" + code + ", reason=" + reason + ", remote=" + remote);
                triggerReconnect();
            }

            @Override
            public void onError(Exception ex) {
                System.err.println("[Binance WS] Error occurred: " + ex.getMessage());
                triggerReconnect();
            }
        };

        client.connect();
    }

    @PreDestroy
    public synchronized void shutdown() {
        shuttingDown = true;
        if (client != null) {
            try {
                client.close();
            } catch (Exception ignored) {
                // best effort
            }
        }
    }

    private synchronized void triggerReconnect() {
        if (shuttingDown || reconnecting) {
            return;
        }
        reconnecting = true;

        new Thread(() -> {
            try {
                System.out.println("[Binance WS] Disconnected. Will attempt auto-reconnect in 5 seconds...");
                Thread.sleep(5000);
                connect();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("[Binance WS] Reconnect thread interrupted");
            } finally {
                reconnecting = false;
            }
        }).start();
    }
}