package com.nextradex.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${ws.allowed.origins}")
    private String wsAllowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = wsAllowedOrigins != null && !wsAllowedOrigins.isBlank() 
                ? wsAllowedOrigins.split(",") 
                : new String[]{"http://localhost:3000"};
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
            if ("*".equals(origins[i])) {
                throw new IllegalStateException("Wildcard WebSocket origins are not allowed");
            }
        }
        registry.addEndpoint("/ws")
                .setAllowedOrigins(origins)
                .withSockJS();
    }
}
