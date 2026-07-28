package com.NexTradeX.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.NexTradeX.auth.JwtAuthenticationToken;
import com.NexTradeX.common.RateLimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private final IRateLimiter redisRateLimiter;

    public RateLimitInterceptor(IRateLimiter redisRateLimiter) {
        this.redisRateLimiter = redisRateLimiter;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // Get annotation from method first, fall back to class level
        RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);
        if (rateLimit == null) {
            rateLimit = handlerMethod.getBeanType().getAnnotation(RateLimit.class);
        }

        if (rateLimit != null) {
            String clientKey = getClientIdentifier(request);
            String endpoint = handlerMethod.getMethod().getName();

            log.info("[RateLimitInterceptor] Intercepted request for method: {} from client: {}. Checking limit: capacity={}, refillRate={}", 
                endpoint, clientKey, rateLimit.capacity(), rateLimit.refillRate());

            boolean allowed = redisRateLimiter.isAllowed(clientKey, endpoint, rateLimit.capacity(), rateLimit.refillRate());

            log.info("[RateLimitInterceptor] Rate limiter result: allowed={}", allowed);

            if (!allowed) {
                log.warn("[RateLimitInterceptor] Client {} rate limited on method: {}", clientKey, endpoint);
                response.setStatus(429); // Too Many Requests
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"status\":429,\"message\":\"Too many requests. Please wait a moment before trying again.\",\"data\":null}");
                return false;
            }
        }

        return true;
    }

    private String getClientIdentifier(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return "user_" + jwtAuth.getUserId();
        }

        // Fallback to IP address
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return "ip_" + xForwardedFor.split(",")[0].trim().replace(":", "_");
        }
        return "ip_" + request.getRemoteAddr().replace(":", "_");
    }
}
