package com.nextradex.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import com.nextradex.modules.security.auth.JwtService;

@Component
@RequiredArgsConstructor
public class WebSocketJwtAuthenticationInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT != accessor.getCommand()) {
            return message;
        }

        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return message;
        }

        String token = authorization.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            Long userId = jwtService.extractUserId(token);
            if (username == null || userId == null) {
                throw new BadCredentialsException("Invalid WebSocket credentials");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (!jwtService.isTokenValid(token, userDetails)) {
                throw new BadCredentialsException("Invalid WebSocket credentials");
            }

            accessor.setUser(new UsernamePasswordAuthenticationToken(
                    userId.toString(), null, userDetails.getAuthorities()));
            return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new BadCredentialsException("Invalid WebSocket credentials", ex);
        }
    }
}
