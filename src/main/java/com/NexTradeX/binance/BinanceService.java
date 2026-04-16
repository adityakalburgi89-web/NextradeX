package com.NexTradeX.binance;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import com.NexTradeX.config.BinanceProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BinanceService {

    private static final String BASE_URL = "https://api.binance.com";

    private final BinanceProperties binanceProperties;
    private final RestTemplate restTemplate;
    private final RestClient restClient = RestClient.create();

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
        try {
            String url = BASE_URL + "/api/v3/ticker/24hr?symbol=" + symbol.toUpperCase();
            log.info("Fetching ticker from: {}", url);
            return restClient.get().uri(url).retrieve().body(Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch 24h ticker for {}: {}", symbol, e.getMessage());
            return null;
        }
    }

    public List<List<Object>> getKlines(String symbol, String interval, int limit) {
        try {
            String url = BASE_URL + "/api/v3/klines?symbol=" + symbol.toUpperCase() + "&interval=" + interval + "&limit=" + limit;
            @SuppressWarnings("unchecked")
            List<List<Object>> response = restClient.get().uri(url).retrieve().body(List.class);
            return response;
        } catch (Exception e) {
            log.error("Failed to fetch klines for {}: {}", symbol, e.getMessage());
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