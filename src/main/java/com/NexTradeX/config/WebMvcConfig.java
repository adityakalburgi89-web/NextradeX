package com.NexTradeX.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Prefix all REST controllers with /api EXCEPT:
        // - RootController (handles root-level routes)
        // - SpringDoc internal controllers (swagger/openapi endpoints)
        configurer.addPathPrefix("/api", c ->
            c.isAnnotationPresent(RestController.class) &&
            !c.getSimpleName().equals("RootController") &&
            !c.getPackage().getName().startsWith("org.springdoc")
        );
    }
}
