package com.NexTradeX.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.NexTradeX.auth.JwtAuthenticationToken;
import com.NexTradeX.auth.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractTokenFromRequest(request);
            String requestPath = request.getRequestURI();
            
            // DEBUG: Log token extraction
            if (jwt != null) {
                log.debug("[JwtFilter] Token found in request for path: {}", requestPath);
            } else {
                log.debug("[JwtFilter] No token found for path: {}", requestPath);
            }
            
            // FIX #1: Only process if token exists (always override session/OAuth2 authentication with JWT)
            if (jwt != null) {
                try {
                    String username = jwtService.extractUsername(jwt);
                    Long userId = jwtService.extractUserId(jwt);
                    
                    log.debug("[JwtFilter] Extracted username: {}, userId: {} from token", username, userId);
                    
                    // FIX #2: Load user details
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                    
                    // FIX #3: Validate token
                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        // FIX #4: Create and set authentication with userId
                        JwtAuthenticationToken authToken = 
                            new JwtAuthenticationToken(
                                username, userId, jwt, userDetails.getAuthorities());
                        authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        log.debug("[JwtFilter] JWT Token valid. Authentication set for user: {} (ID: {})", 
                            username, userId);
                    } else {
                        log.warn("[JwtFilter] JWT Token validation failed for user: {}", username);
                    }
                } catch (Exception e) {
                    log.error("[JwtFilter] Error processing JWT token: {}", e.getMessage());
                    // Continue filter chain even if JWT processing fails
                    // Spring Security will handle the 401 if authentication is required
                }
            }
        } catch (Exception e) {
            log.error("[JwtFilter] Unexpected error in JWT filter: {}", e.getMessage());
        }
        
        // FIX #5: Continue filter chain regardless of JWT processing result
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT token from Authorization header
     * Expected format: "Bearer <token>"
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
