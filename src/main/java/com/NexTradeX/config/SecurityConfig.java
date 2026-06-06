package com.NexTradeX.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.NexTradeX.auth.AuthService;
import com.NexTradeX.auth.JwtService;

import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final AuthService authService;
    private final JwtService jwtService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    
    @Value("${cors.allowed.origins}")
    private String corsAllowedOrigins;
    
    @Value("${oauth.frontend.callback-url}")
    private String frontendCallbackUrl;
    
    public SecurityConfig(@Lazy AuthService authService, JwtService jwtService,
                         OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
    }
    
    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtService, authService);
    }

    @Bean
    public HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository() {
        return new HttpCookieOAuth2AuthorizationRequestRepository();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session
                // IF_REQUIRED: allows Spring Security to create a temporary session
                // for the OAuth2 state parameter cookie handshake only.
                // API endpoints remain effectively stateless via JWT.
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/code/**").permitAll()
                .requestMatchers("/health/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/market/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/swagger-ui.html").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(endpoint -> endpoint
                    .authorizationRequestRepository(cookieAuthorizationRequestRepository())
                )
                .redirectionEndpoint(endpoint -> endpoint
                    .baseUri("/login/oauth2/code/*")
                )
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler((request, response, exception) -> {
                    log.error("[OAuth2] Login failed: {}", exception.getMessage());
                    response.sendRedirect(frontendCallbackUrl + "?error=oauth_failed&message=" +
                        java.net.URLEncoder.encode("OAuth login failed: " + exception.getMessage(),
                        java.nio.charset.StandardCharsets.UTF_8));
                })
            )
            .logout(logout -> logout
                .logoutUrl("/auth/logout")
                .logoutSuccessUrl(frontendCallbackUrl)
                .permitAll()
            )
            .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // FIX #1: Explicitly set allowed origins (not wildcard with credentials)
        String[] allowedOriginArray = corsAllowedOrigins.split(",");
        List<String> allowedOrigins = Arrays.stream(allowedOriginArray)
            .map(String::trim)
            .toList();
        configuration.setAllowedOrigins(allowedOrigins);
        
        // FIX #2: Allow Authorization header explicitly for CORS preflight
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type", 
            "Authorization", 
            "Accept",
            "X-Requested-With"
        ));
        
        // FIX #3: Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            HttpMethod.GET.name(),
            HttpMethod.POST.name(),
            HttpMethod.PUT.name(),
            HttpMethod.DELETE.name(),
            HttpMethod.PATCH.name(),
            HttpMethod.OPTIONS.name()
        ));
        
        // FIX #4: Enable credentials for Authorization header
        configuration.setAllowCredentials(true);
        
        // FIX #5: Cache preflight for 1 hour
        configuration.setMaxAge(3600L);
        
        // FIX #6: Expose Authorization and custom headers in response
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
