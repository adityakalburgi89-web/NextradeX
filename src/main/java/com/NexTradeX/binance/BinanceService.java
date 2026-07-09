package com.NexTradeX.binance;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import java.math.RoundingMode;

import com.NexTradeX.config.BinanceProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BinanceService {

    private static final String BINANCE_URL = "https://api.binance.com";
    private static final String MEXC_URL = "https://api.mexc.com";
    private static final String BYBIT_URL = "https://api.bybit.com";
    private static final long TICKER_COOLDOWN_MS = 60000; // 60 seconds
    private static final long GLOBAL_COOLDOWN_MS = 300000; // 5 minutes (300 seconds)

    private final BinanceProperties binanceProperties;
    private final RestClient restClient = RestClient.builder()
            .requestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
                setConnectTimeout(2000);
                setReadTimeout(3000);
            }})
            .build();

    @Value("${bybit.api-key:}")
    private String bybitApiKey;

    @Value("${bybit.api-secret:}")
    private String bybitApiSecret;

    private final Map<String, Long> lastTickerRequestTimes = new ConcurrentHashMap<>();
    private volatile long binanceCooldownUntil = 0L;
    private volatile long mexcCooldownUntil = 0L;
    private volatile long bybitCooldownUntil = 0L;

    public String getEffectiveBaseUrl() {
        long now = System.currentTimeMillis();
        if (now >= binanceCooldownUntil) {
            return BINANCE_URL;
        } else if (now >= bybitCooldownUntil) {
            log.info("[Binance] Binance is on cooldown. Failing over to Bybit API: {}", BYBIT_URL);
            return BYBIT_URL;
        } else if (now >= mexcCooldownUntil) {
            log.info("[Binance] Binance and Bybit are on cooldown. Failing over to MEXC API: {}", MEXC_URL);
            return MEXC_URL;
        } else {
            return BINANCE_URL;
        }
    }

    public boolean isRequestAllowed() {
        long now = System.currentTimeMillis();
        return now >= binanceCooldownUntil || now >= mexcCooldownUntil || now >= bybitCooldownUntil;
    }

    private String adaptInterval(String activeUrl, String interval) {
        if (interval == null) {
            if (activeUrl.equals(MEXC_URL)) return "60m";
            if (activeUrl.equals(BYBIT_URL)) return "60";
            return "1h";
        }
        String clean = interval.trim().toLowerCase();
        if (activeUrl.equals(MEXC_URL)) {
            return switch (clean) {
                case "1h" -> "60m";
                case "1w" -> "1W";
                case "1m" -> "1m";
                case "5m" -> "5m";
                case "15m" -> "15m";
                case "30m" -> "30m";
                case "4h" -> "4h";
                case "1d" -> "1d";
                case "1mon", "1moth" -> "1M";
                default -> "60m";
            };
        } else if (activeUrl.equals(BYBIT_URL)) {
            return switch (clean) {
                case "1m" -> "1";
                case "5m" -> "5";
                case "15m" -> "15";
                case "30m" -> "30";
                case "1h" -> "60";
                case "4h" -> "240";
                case "1d" -> "D";
                case "1w" -> "W";
                case "1mon", "1moth" -> "M";
                default -> "60";
            };
        } else {
            return switch (clean) {
                case "1w" -> "1w";
                case "1mon", "1moth" -> "1M";
                default -> interval;
            };
        }
    }

    public boolean isTickerFetchAllowed(String symbol) {
        long now = System.currentTimeMillis();
        if (!isRequestAllowed()) {
            return false;
        }
        String sym = symbol.toUpperCase();
        long lastRequest = lastTickerRequestTimes.getOrDefault(sym, 0L);
        return (now - lastRequest) >= TICKER_COOLDOWN_MS;
    }

    public synchronized boolean checkAndRecordTickerFetch(String symbol) {
        if (!isTickerFetchAllowed(symbol)) {
            return false;
        }
        recordTickerFetch(symbol);
        return true;
    }

    public void recordTickerFetch(String symbol) {
        lastTickerRequestTimes.put(symbol.toUpperCase(), System.currentTimeMillis());
    }

    public synchronized void triggerCooldown(String baseUrl) {
        long now = System.currentTimeMillis();
        long cooldownUntil = now + GLOBAL_COOLDOWN_MS;
        if (baseUrl.equals(BINANCE_URL)) {
            binanceCooldownUntil = cooldownUntil;
            log.warn("[Binance] Binance rate limit/ban cooldown activated for 5 minutes (until {}). Failing over to Bybit.", new java.util.Date(cooldownUntil));
        } else if (baseUrl.equals(BYBIT_URL)) {
            bybitCooldownUntil = cooldownUntil;
            log.warn("[Binance] Bybit rate limit/ban cooldown activated for 5 minutes (until {}). Failing over to MEXC.", new java.util.Date(cooldownUntil));
        } else if (baseUrl.equals(MEXC_URL)) {
            mexcCooldownUntil = cooldownUntil;
            log.warn("[Binance] MEXC rate limit/ban cooldown activated for 5 minutes (until {}).", new java.util.Date(cooldownUntil));
        }
    }

    public synchronized void triggerGlobalCooldown() {
        triggerCooldown(BINANCE_URL);
    }

    private boolean shouldTriggerCooldown(org.springframework.http.HttpStatusCode statusCode) {
        int val = statusCode.value();
        return val == 429 || val == 418 || val == 403 || val == 451 || statusCode.is5xxServerError();
    }

    public BigDecimal getPrice(String symbol) {
        int attempts = 0;
        while (attempts < 3) {
            if (!isRequestAllowed()) {
                return null;
            }
            String activeUrl = getEffectiveBaseUrl();
            try {
                if (activeUrl.equals(BYBIT_URL)) {
                    String url = activeUrl + "/v5/market/tickers?category=spot&symbol=" + symbol.toUpperCase();
                    @SuppressWarnings("unchecked")
                    Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
                    if (response != null && response.containsKey("result")) {
                        Map<String, Object> result = (Map<String, Object>) response.get("result");
                        List<Map<String, Object>> list = (List<Map<String, Object>>) result.get("list");
                        if (list != null && !list.isEmpty()) {
                            return new BigDecimal(list.get(0).get("lastPrice").toString());
                        }
                    }
                    return null;
                }

                String url = activeUrl + "/api/v3/ticker/price?symbol=" + symbol.toUpperCase();
                Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
                if (response != null && response.containsKey("price")) {
                    return new BigDecimal(response.get("price").toString());
                }
            } catch (RestClientResponseException e) {
                log.error("[Binance] HTTP error fetching price for {} from {}: Status={}, Body={}", symbol, activeUrl, e.getStatusCode(), e.getResponseBodyAsString());
                if (shouldTriggerCooldown(e.getStatusCode())) {
                    triggerCooldown(activeUrl);
                }
            } catch (Exception e) {
                log.error("[Binance] Failed to fetch price for {} from {}: {}", symbol, activeUrl, e.getMessage());
                triggerCooldown(activeUrl);
            }
            attempts++;
        }
        return null;
    }

    public Map<String, BigDecimal> getAllPrices() {
        int attempts = 0;
        while (attempts < 3) {
            if (!isRequestAllowed()) {
                return Map.of();
            }
            String activeUrl = getEffectiveBaseUrl();
            Map<String, BigDecimal> prices = new HashMap<>();
            try {
                if (activeUrl.equals(BYBIT_URL)) {
                    String url = activeUrl + "/v5/market/tickers?category=spot";
                    @SuppressWarnings("unchecked")
                    Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
                    if (response != null && response.containsKey("result")) {
                        Map<String, Object> result = (Map<String, Object>) response.get("result");
                        List<Map<String, Object>> list = (List<Map<String, Object>>) result.get("list");
                        if (list != null) {
                            for (Map<String, Object> item : list) {
                                String sym = item.get("symbol").toString();
                                if (sym.endsWith("USDT")) {
                                    BigDecimal price = new BigDecimal(item.get("lastPrice").toString());
                                    prices.put(sym, price);
                                }
                            }
                        }
                    }
                    return prices;
                }

                String url = activeUrl + "/api/v3/ticker/price";
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
                return prices;
            } catch (RestClientResponseException e) {
                log.error("[Binance] HTTP error fetching all prices from {}: Status={}, Body={}", activeUrl, e.getStatusCode(), e.getResponseBodyAsString());
                if (shouldTriggerCooldown(e.getStatusCode())) {
                    triggerCooldown(activeUrl);
                }
            } catch (Exception e) {
                log.error("[Binance] Failed to fetch all prices from {}: {}", activeUrl, e.getMessage());
                triggerCooldown(activeUrl);
            }
            attempts++;
        }
        return Map.of();
    }

    public Map<String, Object> getTicker24h(String symbol) {
        String sym = symbol.toUpperCase();
        if (!checkAndRecordTickerFetch(sym)) {
            log.debug("[Binance] Fetch ticker for {} is on cooldown. Returning null to protect API limit.", sym);
            return null;
        }
        
        int attempts = 0;
        while (attempts < 3) {
            if (!isRequestAllowed()) {
                return null;
            }
            String activeUrl = getEffectiveBaseUrl();
            try {
                if (activeUrl.equals(BYBIT_URL)) {
                    String url = activeUrl + "/v5/market/tickers?category=spot&symbol=" + sym;
                    log.info("[Binance] Fetching Bybit 24h ticker for {} from: {}", sym, url);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
                    if (response != null && response.containsKey("result")) {
                        Map<String, Object> result = (Map<String, Object>) response.get("result");
                        List<Map<String, Object>> list = (List<Map<String, Object>>) result.get("list");
                        if (list != null && !list.isEmpty()) {
                            Map<String, Object> item = list.get(0);
                            Map<String, Object> translated = new HashMap<>();
                            translated.put("symbol", item.get("symbol"));
                            translated.put("lastPrice", item.get("lastPrice"));
                            translated.put("highPrice", item.get("highPrice24h"));
                            translated.put("lowPrice", item.get("lowPrice24h"));
                            
                            BigDecimal last = new BigDecimal(item.get("lastPrice").toString());
                            BigDecimal prev = new BigDecimal(item.get("prevPrice24h").toString());
                            translated.put("openPrice", prev);
                            
                            BigDecimal priceChange = last.subtract(prev);
                            translated.put("priceChange", priceChange);
                            
                            BigDecimal percentChange = prev.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO 
                                    : priceChange.divide(prev, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                            translated.put("priceChangePercent", percentChange);
                            
                            translated.put("volume", item.get("volume24h"));
                            log.info("[Binance] Successfully fetched ticker for {}. Last Price: {}", sym, last);
                            return translated;
                        }
                    }
                    return null;
                }

                String url = activeUrl + "/api/v3/ticker/24hr?symbol=" + sym;
                log.info("[Binance] Fetching 24h ticker for {} from: {}", sym, url);
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
                if (response != null) {
                    log.info("[Binance] Successfully fetched ticker for {}. Last Price: {}", sym, response.get("lastPrice"));
                }
                return response;
            } catch (RestClientResponseException e) {
                log.error("[Binance] HTTP error fetching 24h ticker for {} from {}: Status={}, Body={}", sym, activeUrl, e.getStatusCode(), e.getResponseBodyAsString());
                if (shouldTriggerCooldown(e.getStatusCode())) {
                    triggerCooldown(activeUrl);
                }
            } catch (Exception e) {
                log.error("[Binance] Failed to fetch 24h ticker for {} from {}: {}", sym, activeUrl, e.getMessage());
                triggerCooldown(activeUrl);
            }
            attempts++;
        }
        return null;
    }

    public List<List<Object>> getKlines(String symbol, String interval, int limit) {
        int attempts = 0;
        while (attempts < 3) {
            if (!isRequestAllowed()) {
                log.debug("[Binance] Fetch klines for {} is blocked (all providers on cooldown).", symbol);
                return null;
            }

            String activeUrl = getEffectiveBaseUrl();
            String adaptedInterval = adaptInterval(activeUrl, interval);
            try {
                if (activeUrl.equals(BYBIT_URL)) {
                    String url = activeUrl + "/v5/market/kline?category=spot&symbol=" + symbol.toUpperCase() + "&interval=" + adaptedInterval + "&limit=" + limit;
                    log.info("[Binance] Fetching klines for {} from Bybit: {}", symbol, url);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
                    if (response != null && response.containsKey("result")) {
                        Map<String, Object> result = (Map<String, Object>) response.get("result");
                        List<List<Object>> list = (List<List<Object>>) result.get("list");
                        if (list != null) {
                            log.info("[Binance] Successfully fetched {} klines for {} from Bybit", list.size(), symbol);
                            java.util.Collections.reverse(list);
                            return list;
                        }
                    }
                    return List.of();
                }

                String url = activeUrl + "/api/v3/klines?symbol=" + symbol.toUpperCase() + "&interval=" + adaptedInterval + "&limit=" + limit;
                log.info("[Binance] Fetching klines for {} from: {}", symbol, url);
                @SuppressWarnings("unchecked")
                List<List<Object>> response = restClient.get().uri(url).retrieve().body(List.class);
                if (response != null) {
                    log.info("[Binance] Successfully fetched {} klines for {} from {}", response.size(), symbol, activeUrl);
                }
                return response;
            } catch (RestClientResponseException e) {
                log.error("[Binance] HTTP error fetching klines for {} from {}: Status={}, Body={}", symbol, activeUrl, e.getStatusCode(), e.getResponseBodyAsString());
                if (shouldTriggerCooldown(e.getStatusCode())) {
                    triggerCooldown(activeUrl);
                }
            } catch (Exception e) {
                log.error("[Binance] Failed to fetch klines for {} from {}: {}", symbol, activeUrl, e.getMessage());
                triggerCooldown(activeUrl);
            }
            attempts++;
        }
        return null;
    }

    public List<String> getAvailableSymbols() {
        int attempts = 0;
        while (attempts < 3) {
            if (!isRequestAllowed()) {
                return List.of();
            }
            String activeUrl = getEffectiveBaseUrl();
            try {
                if (activeUrl.equals(BYBIT_URL)) {
                    String url = activeUrl + "/v5/market/instruments-info?category=spot";
                    @SuppressWarnings("unchecked")
                    Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
                    if (response != null && response.containsKey("result")) {
                        Map<String, Object> result = (Map<String, Object>) response.get("result");
                        List<Map<String, Object>> list = (List<Map<String, Object>>) result.get("list");
                        if (list != null) {
                            return list.stream()
                                    .map(s -> s.get("symbol").toString())
                                    .filter(sym -> sym.endsWith("USDT"))
                                    .toList();
                        }
                    }
                    return List.of();
                }

                String url = activeUrl + "/api/v3/exchangeInfo";
                Map<String, Object> response = restClient.get().uri(url).retrieve().body(Map.class);
                if (response != null && response.containsKey("symbols")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, String>> symbols = (List<Map<String, String>>) response.get("symbols");
                    return symbols.stream()
                            .filter(s -> "USDT".equals(s.get("quoteAsset")))
                            .map(s -> s.get("symbol"))
                            .toList();
                }
            } catch (RestClientResponseException e) {
                log.error("[Binance] HTTP error fetching available symbols from {}: Status={}, Body={}", activeUrl, e.getStatusCode(), e.getResponseBodyAsString());
                if (shouldTriggerCooldown(e.getStatusCode())) {
                    triggerCooldown(activeUrl);
                }
            } catch (Exception e) {
                log.error("[Binance] Failed to fetch available symbols from {}: {}", activeUrl, e.getMessage());
                triggerCooldown(activeUrl);
            }
            attempts++;
        }
        return List.of();
    }

    public String getEffectiveWebSocketUrl() {
        String activeUrl = getEffectiveBaseUrl();
        if (activeUrl.equals(BYBIT_URL)) {
            return "wss://stream.bybit.com/v5/public/spot";
        } else if (activeUrl.equals(MEXC_URL)) {
            return "wss://wbs.mexc.com/ws";
        } else {
            return "wss://stream.binance.com:9443/stream?streams="
                    + "btcusdt@ticker/"
                    + "ethusdt@ticker/"
                    + "bnbusdt@ticker/"
                    + "solusdt@ticker/"
                    + "dotusdt@ticker";
        }
    }

    public String getActiveProviderName() {
        String activeUrl = getEffectiveBaseUrl();
        if (activeUrl.equals(BYBIT_URL)) {
            return "BYBIT";
        } else if (activeUrl.equals(MEXC_URL)) {
            return "MEXC";
        } else {
            return "BINANCE";
        }
    }

    public boolean isConfigured() {
        String key = binanceProperties.getApiKey();
        String secret = binanceProperties.getApiSecret();
        return key != null && !key.isBlank() && secret != null && !secret.isBlank();
    }
}