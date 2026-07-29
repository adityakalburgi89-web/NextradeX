package com.NexTradeX;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;

import com.NexTradeX.market.IMarketService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@ConfigurationPropertiesScan
@RequiredArgsConstructor
@Slf4j
public class NexTradeXApplication {

    private final IMarketService marketService;

	public static void main(String[] args) {
		SpringApplication.run(NexTradeXApplication.class, args);
	}
	
	
	@Bean
	@ConditionalOnProperty(prefix = "nextradex.bootstrap", name = "enabled", havingValue = "true", matchIfMissing = true)
	public CommandLineRunner init() {
	    return args -> {
	        try {
	            marketService.syncMarketPrices();
	        } catch (Exception e) {
	            log.warn("Initial market price sync failed: {}", e.getMessage());
	        }
	    };
	}
}

