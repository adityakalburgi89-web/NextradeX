package com.NexTradeX.config;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Value("${oauth.frontend.callback-url}")
    private String frontendCallbackUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = authToken.getPrincipal();
        
        String provider = authToken.getAuthorizedClientRegistrationId();
        
        try {
            String email = oauth2User.getAttribute("email");
            String firstName = oauth2User.getAttribute("given_name");
            String lastName = oauth2User.getAttribute("family_name");
            String picture = oauth2User.getAttribute("picture");
            
            User user;
            
            if ("google".equals(provider)) {
                String googleId = oauth2User.getName();
                
                user = userService.findByGoogleId(googleId)
                        .orElseGet(() -> {
                            if (userService.findByEmail(email).isPresent()) {
                                throw new RuntimeException("EMAIL_EXISTS");
                            }
                            return userService.createGoogleUser(googleId, email, firstName, lastName, picture);
                        });
            } else {
                throw new RuntimeException("Unsupported provider: " + provider);
            }
            
            userService.updateLastLogin(user.getId());
            
            String token = jwtService.generateTokenWithUserId(user.getUsername(), user.getId());
            
            String redirectUrl = frontendCallbackUrl + "?token=" + token;
            if (Boolean.TRUE.equals(user.getNeedsProfileSetup())) {
                redirectUrl += "&setup=true";
            }
            
            log.info("OAuth login successful for user: {} via {}", user.getUsername(), provider);
            
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            log.error("OAuth authentication error: {}", e.getMessage());
            
            String redirectUrl;
            if ("EMAIL_EXISTS".equals(e.getMessage())) {
                redirectUrl = frontendCallbackUrl + "?error=email_exists&message=" + 
                        URLEncoder.encode("Email already registered, please login normally", StandardCharsets.UTF_8);
            } else {
                redirectUrl = frontendCallbackUrl + "?error=oauth_failed&message=" + 
                        URLEncoder.encode("OAuth login failed: " + e.getMessage(), StandardCharsets.UTF_8);
            }
            
            response.sendRedirect(redirectUrl);
        }
    }
}
