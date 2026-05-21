package com.NexTradeX.binance;

import java.net.URI;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class BinanceWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public BinanceWebSocketService(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
        connect();
    }

    public void connect() {

        String socketUrl =
                "wss://stream.binance.com:9443/stream?streams="
                + "btcusdt@ticker/"
                + "ethusdt@ticker/"
                + "bnbusdt@ticker";

        WebSocketClient client = new WebSocketClient(
                URI.create(socketUrl)
        ) {

            @Override
            public void onOpen(ServerHandshake handshake) {
                System.out.println(
                        "[Binance WS] Connected"
                );
            }

            @Override
            public void onMessage(String message) {

                System.out.println(
                        "[Binance WS] " + message
                );

                messagingTemplate.convertAndSend(
                        "/topic/prices",
                        message
                );
            }

            @Override
            public void onClose(
                    int code,
                    String reason,
                    boolean remote
            ) {

                System.out.println(
                        "[Binance WS] Closed: " + reason
                );
            }

            @Override
            public void onError(Exception ex) {
                ex.printStackTrace();
            }
        };

        client.connect();
    }
}