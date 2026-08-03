package com.nextradex.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "binance")
public class BinanceProperties {
    private String apiKey;
    private String apiSecret;
    private String baseUrl = "https://api.binance.com";
}