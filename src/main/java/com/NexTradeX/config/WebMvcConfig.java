package com.NexTradeX.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // No path prefix is added here because 'server.servlet.context-path=/api' is already configured
        // in application.properties. Adding a prefix here causes double-prefixing issues.
    }
}

