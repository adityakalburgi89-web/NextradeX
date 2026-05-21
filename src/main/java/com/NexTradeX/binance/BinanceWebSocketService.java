package com.NexTradeX.binance;

import java.math.BigDecimal;
import java.net.URI;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.NexTradeX.market.MarketService;
import com.NexTradeX.market.CryptoPrice;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BinanceWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final MarketService marketService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private WebSocketClient client;
    private boolean reconnecting = false;

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
                + "bnbusdt@ticker";

        System.out.println("[Binance WS] Connecting to: " + socketUrl);

        client = new WebSocketClient(URI.create(socketUrl)) {

            @Override
            public void onOpen(ServerHandshake handshake) {
                System.out.println("[Binance WS] Connected successfully");
            }

            @Override
            public void onMessage(String message) {
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

                        // Update database
                        CryptoPrice updatedPrice = marketService.updateOrCreatePrice(
                            symbol,
                            price,
                            high,
 api.js:122 
 POST http://localhost:8080/api/oauth2/complete-profile 500 (Internal Server Error)
completeProfile	@	api.js:122
(anonymous)	@	AuthPage.jsx:73

installHook.js:1 [API] ❌ Response error: No static resource oauth2/complete-profile. Status: 500
overrideMethod	@	installHook.js:1
handleResponse	@	api.js:48
await in handleResponse		
completeProfile	@	api.js:125
await in completeProfile		
(anonymous)	@	AuthPage.jsx:73
﻿
                           low,
                            open,
                            priceChange,
                            percentChange,
                            volume,
                            null
                        );

                        // Broadcast updated price
                        messagingTemplate.convertAndSend("/topic/prices", updatedPrice);
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

    private synchronized void triggerReconnect() {
        if (reconnecting) {
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