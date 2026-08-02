package com.NexTradeX.market;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.NexTradeX.binance.IBinanceService;
import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.common.RateLimit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/market")
@RequiredArgsConstructor
public class MarketController {

    private final IMarketService marketService;
    private final IBinanceService binanceService;
    
    @RateLimit(capacity = 5, refillRate = 2.0)
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
    
    @RateLimit(capacity = 5, refillRate = 2.0)
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

    @GetMapping("/binance/price/{symbol}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBinancePrice(
            @PathVariable String symbol) {
        try {
            Map<String, Object> ticker = binanceService.getTicker24h(symbol);
            if (ticker == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(400, "Failed to fetch price from Binance", null));
            }
            Map<String, Object> result = new HashMap<>();
            result.put("symbol", ticker.get("symbol"));
            result.put("price", ticker.get("lastPrice"));
            result.put("change24h", ticker.get("priceChange"));
            result.put("changePercent24h", ticker.get("priceChangePercent"));
            result.put("high24h", ticker.get("highPrice"));
            result.put("low24h", ticker.get("lowPrice"));
            result.put("volume24h", ticker.get("volume"));
            result.put("quoteVolume24h", ticker.get("quoteVolume"));
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Binance price retrieved", result));
        } catch (Exception e) {
            log.error("Error retrieving Binance price for {}: {}", symbol, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/binance/prices")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getBinanceAllPrices() {
        try {
            Map<String, BigDecimal> prices = binanceService.getAllPrices();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Binance prices retrieved", prices));
        } catch (Exception e) {
            log.error("Error retrieving Binance prices: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/binance/symbols")
    public ResponseEntity<ApiResponse<List<String>>> getBinanceSymbols() {
        try {
            List<String> symbols = binanceService.getAvailableSymbols();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Binance symbols retrieved", symbols));
        } catch (Exception e) {
            log.error("Error retrieving Binance symbols: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/binance/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBinanceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", binanceService.isConfigured());
        status.put("baseUrl", "https://api.binance.com");
        return ResponseEntity.ok()
                .body(new ApiResponse<>(200, "Binance status retrieved", status));
    }
}
