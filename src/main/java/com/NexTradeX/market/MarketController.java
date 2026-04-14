package com.NexTradeX.market;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.NexTradeX.common.ApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/market")
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

    @GetMapping("/candles/{symbol}")
    public ResponseEntity<ApiResponse<List<CandlestickDataPoint>>> getCandlestickData(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1h") String interval,
            @RequestParam(defaultValue = "120") int limit) {
        try {
            List<CandlestickDataPoint> candles = marketService.getCandlestickData(symbol, interval, limit);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Candlestick data retrieved", candles));
        } catch (Exception e) {
            log.error("Error retrieving candlestick data for {}: {}", symbol, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}
