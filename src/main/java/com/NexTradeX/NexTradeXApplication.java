package com.NexTradeX;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.NexTradeX.market.MarketService;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
import com.NexTradeX.wallet.WalletService;

import lombok.RequiredArgsConstructor;

@SpringBootApplication
@EnableScheduling
@ConfigurationPropertiesScan
@RequiredArgsConstructor
public class NexTradeXApplication {
    
    private final UserService userService;
    private final WalletService walletService;
    private final MarketService marketService;

	public static void main(String[] args) {
		SpringApplication.run(NexTradeXApplication.class, args);
	}
	
	
	@Bean
	public CommandLineRunner init(org.springframework.core.env.Environment env) {
	    return args -> {
	        System.out.println("=== SPRING ENVIRONMENT DEBUG ===");
	        System.out.println("spring.data.redis.host: " + env.getProperty("spring.data.redis.host"));
	        System.out.println("spring.data.redis.port: " + env.getProperty("spring.data.redis.port"));
	        System.out.println("spring.data.redis.password: " + env.getProperty("spring.data.redis.password"));
	        System.out.println("spring.data.redis.ssl.enabled: " + env.getProperty("spring.data.redis.ssl.enabled"));
	        System.out.println("spring.datasource.url: " + env.getProperty("spring.datasource.url"));
	        System.out.println("REDIS_HOST: " + env.getProperty("REDIS_HOST"));
	        System.out.println("=================================");

	        // Initialize default prices
	        marketService.initializeDefaultPrices();
	        
	        // Sync market prices from Binance/MEXC/Bybit asynchronously on startup
	        java.util.concurrent.CompletableFuture.runAsync(() -> {
	            try {
	                System.out.println("[Startup] Syncing market prices asynchronously...");
	                marketService.syncMarketPrices();
	                System.out.println("[Startup] Market prices synced asynchronously successfully.");
	            } catch (Exception e) {
	                System.err.println("[Startup] Failed to sync market prices asynchronously: " + e.getMessage());
	            }
	        });
	        
	        // Create test user if not exists
	        try {
	            User testUser = userService.createUser(
	                    "testuser",
	                    "test@nextradev.com",
	                    "TestPassword123",
	                    "Test",
	                    "User"
	            );
	            
	            // Initialize wallets for test user
	            walletService.initializeUserWallets(testUser);
	        } catch (Exception e) {
	            // User might already exist
	        }
	    };
	}
}

