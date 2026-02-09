package com.NexTradeX.market;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.NexTradeX.common.ApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {
    
    private final MarketService marketService;
    
    @GetMapping("/prices")
    public ResponseEntity<ApiResponse<List<CryptoPrice>>> getAllPrices() {
        try {
            List<CryptoPrice> prices = marketService.getAllPrices();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Prices retrieved", prices));
        } catch (Exception e) {
            log.error("Error retrieving prices: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @GetMapping("/price/{symbol}")
    public ResponseEntity<ApiResponse<CryptoPrice>> getPrice(
            @PathVariable String symbol) {
        try {
            CryptoPrice price = marketService.getPrice(symbol);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Live price retrieved", price));
        } catch (Exception e) {
            log.error("Error retrieving live price for {}: {}", symbol, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}
