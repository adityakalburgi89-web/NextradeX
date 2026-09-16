package com.nextradex.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.messaging.access.intercept.AuthorizationChannelInterceptor;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.messaging.context.SecurityContextChannelInterceptor;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.config.ChannelRegistration;

@Configuration
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketJwtAuthenticationInterceptor jwtAuthenticationInterceptor;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(
                jwtAuthenticationInterceptor,
                new SecurityContextChannelInterceptor(),
                authorizationInterceptor());
    }

    private ChannelInterceptor authorizationInterceptor() {
        MessageMatcherDelegatingAuthorizationManager.Builder messages =
                MessageMatcherDelegatingAuthorizationManager.builder();
        messages
                .simpTypeMatchers(SimpMessageType.CONNECT, SimpMessageType.DISCONNECT,
                        SimpMessageType.UNSUBSCRIBE, SimpMessageType.HEARTBEAT).permitAll()
                .simpSubscribeDestMatchers("/topic/prices").permitAll()
                .simpSubscribeDestMatchers("/user/queue/orders", "/user/queue/notifications").authenticated()
                .simpDestMatchers("/app/**").authenticated()
                .simpTypeMatchers(SimpMessageType.MESSAGE, SimpMessageType.SUBSCRIBE).denyAll()
                .anyMessage().denyAll();
        AuthorizationManager<Message<?>> manager = messages.build();
        return new AuthorizationChannelInterceptor(manager);
    }
}
