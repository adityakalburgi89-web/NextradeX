package com.NexTradeX.auth;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {
    
    private final String username;
    private final Long userId;
    private final String token;
    
    public JwtAuthenticationToken(String username, Long userId, String token,
                                   Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.username = username;
        this.userId = userId;
        this.token = token;
        setAuthenticated(true);
    }
    
    @Override
    public Object getCredentials() {
        return token;
    }
    
    @Override
    public Object getPrincipal() {
        return username;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public String getUsername() {
        return username;
    }
}
