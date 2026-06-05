package com.NexTradeX.binance;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import com.NexTradeX.config.BinanceProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BinanceService {

    private static final String BASE_URL = "https://api.binance.com";
    private static final long TICKER_COOLDOWN_MS = 60000; // 60 seconds
    private static final long GLOBAL_COOLDOWN_MS = 300000; // 5 minutes (300 seconds)

    private final BinanceProperties binanceProperties;
    private final RestTemplate restTemplate;
    private final RestClient restClient = RestClient.create();

    private final Map<String, Long> lastTickerRequestTimes = new ConcurrentHashMap<>();
    private volatile long globalCooldownUntil = 0L;

    public boolean isTickerFetchAllowed(String symbol) {
        long now = System.currentTimeMillis();
        if (now < globalCooldownUntil) {
            log.warn("[Binance] 🚫 Global cooldown active until {}. Skipping REST fetch.", new java.util.Date(globalCooldownUntil));
            return false;
        }
        String sym = symbol.toUpperCase();
        long lastRequest = lastTickerRequestTimes.getOrDefault(sym, 0L);
        return (now - lastRequest) >= TICKER_COOLDOWN_MS;
    }

    public void recordTickerFetch(String symbol) {
        lastTickerRequestTimes.put(symbol.toUpperCase(), System.currentTimeMillis());
    }

    public void triggerGlobalCooldown() {
        globalCooldownUntil = System.currentTimeMillis() + GLOBAL_COOLDOWN_MS;
        log.warn("[Binance] 🚫 Global ban protection cooldown activated for 5 minutes (until {}).", new java.util.Date(globalCooldownUntil));
    }

    public BigDecimal getPrice(String symbol) {
        try {
            String url = BASE_URL + "/api/v3/ticker/price?symbol=" + symbol.toUpperCase();
            Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
            if (response != null && response.containsKey("price")) {
                return new BigDecimal(response.get("price").toString());
            }
        } catch (Exception e) {
            log.error("Failed to fetch price for {}: {}", symbol, e.getMessage());
        }
        return null;
    }

    public Map<String, BigDecimal> getAllPrices() {
        Map<String, BigDecimal> prices = new HashMap<>();
        try {
            String url = BASE_URL + "/api/v3/ticker/price";
            List<Map<String, Object>> response = restClient.get().uri(url).retrieve().body(List.class);
            if (response != null) {
                for (Map<String, Object> item : response) {
                    String sym = item.get("symbol").toString();
                    if (sym.endsWith("USDT")) {
                        BigDecimal price = new BigDecimal(item.get("price").toString());
                        prices.put(sym, price);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch all prices: {}", e.getMessage());
        }
        return prices;
    }

    public Map<String, Object> getTicker24h(String symbol) {
        String sym = symbol.toUpperCase();
        if (!isTickerFetchAllowed(sym)) {
            log.debug("[Binance] ⏳ Fetch ticker for {} is on cooldown. Returning null to protect API limit.", sym);
            return null;
        }
        
        recordTickerFetch(sym);
        
        try {
            String url = BASE_URL + "/api/v3/ticker/24hr?symbol=" + sym;
            log.info("[Binance] 🌐 Fetching 24h ticker for {} from: {}", sym, url);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
            if (response != null) {
                log.info("[Binance] ✅ Successfully fetched ticker for {}. Last Price: {}", sym, response.get("lastPrice"));
            } else {
                log.warn("[Binance] ⚠️ Received empty response for {}", sym);
            }
            return response;
        } catch (RestClientResponseException e) {
            log.error("[Binance] ❌ HTTP error fetching 24h ticker for {}: Status={}, Body={}", sym, e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 429 || e.getStatusCode().value() == 418) {
                triggerGlobalCooldown();
            }
            return null;
        } catch (Exception e) {
            log.error("[Binance] ❌ Failed to fetch 24h ticker for {}: {}", sym, e.getMessage());
            return null;
        }
    }

    public List<List<Object>> getKlines(String symbol, String interval, int limit) {
        try {
            String url = BASE_URL + "/api/v3/klines?symbol=" + symbol.toUpperCase() + "&interval=" + interval + "&limit=" + limit;
            log.info("[Binance] 📊 Fetching klines for {} from: {}", symbol, url);
            @SuppressWarnings("unchecked")
            List<List<Object>> response = restClient.get().uri(url).retrieve().body(List.class);
            if (response != null) {
                log.info("[Binance] ✅ Successfully fetched {} klines for {}", response.size(), symbol);
            }
            return response;
        } catch (Exception e) {
            log.error("[Binance] ❌ Failed to fetch klines for {}: {}", symbol, e.getMessage());
            return null;
        }
    }

    public List<String> getAvailableSymbols() {
        try {
            String url = BASE_URL + "/api/v3/exchangeInfo";
            Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
            if (response != null && response.containsKey("symbols")) {
                @SuppressWarnings("unchecked")
                List<Map<String, String>> symbols = (List<Map<String, String>>) response.get("symbols");
                return symbols.stream()
                        .filter(s -> "USDT".equals(s.get("quoteAsset")))
                        .map(s -> s.get("symbol"))
                        .toList();
            }
        } catch (Exception e) {
            log.error("Failed to fetch available symbols: {}", e.getMessage());
        }
        return List.of();
    }

    public boolean isConfigured() {
        String key = binanceProperties.getApiKey();
        String secret = binanceProperties.getApiSecret();
        return key != null && !key.isBlank() && secret != null && !secret.isBlank();
    }
}