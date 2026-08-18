package com.nextradex.api.config;

import com.nextradex.modules.security.oauth.OAuthLoginCodeService;
import com.nextradex.modules.user.User;
import com.nextradex.modules.user.UserService;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final OAuthLoginCodeService oAuthLoginCodeService;

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
            Boolean emailVerified = oauth2User.getAttribute("email_verified");
            String firstName = oauth2User.getAttribute("given_name");
            String lastName = oauth2User.getAttribute("family_name");
            String picture = oauth2User.getAttribute("picture");
            
            User user;
            
            if ("google".equals(provider)) {
                if (email == null || email.isBlank() || !Boolean.TRUE.equals(emailVerified)) {
                    throw new IllegalStateException("OAuth provider did not verify the email address");
                }
                String googleId = oauth2User.getName();
                user = userService.linkOrCreateGoogleUser(googleId, email, firstName, lastName, picture);
            } else {
                throw new RuntimeException("Unsupported provider: " + provider);
            }
            
            userService.updateLastLogin(user.getId());
            
            String code = oAuthLoginCodeService.issueCode(user.getId());
            if (request.getSession(false) != null) {
                request.getSession(false).invalidate();
            }

            String redirectUrl = frontendCallbackUrl + "?code=" + code;
            if (Boolean.TRUE.equals(user.getNeedsProfileSetup())) {
                redirectUrl += "&setup=true";
            }
            
            log.info("OAuth login successful for user: {} via {}", user.getUsername(), provider);
            
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            log.error("OAuth authentication failed", e);
            if (request.getSession(false) != null) {
                request.getSession(false).invalidate();
            }
            
            String redirectUrl;
            if ("EMAIL_EXISTS".equals(e.getMessage())) {
                redirectUrl = frontendCallbackUrl + "?error=email_exists";
            } else {
                redirectUrl = frontendCallbackUrl + "?error=oauth_failed";
            }
            
            response.sendRedirect(redirectUrl);
        }
    }
}
