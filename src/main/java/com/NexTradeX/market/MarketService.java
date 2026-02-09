package com.NexTradeX.market;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MarketService {
    
    private final CryptoPriceRepository cryptoPriceRepository;
    private final RestTemplate restTemplate;
    
    @Value("${coinmarketcap.api.key}")
    private String coinMarketCapApiKey;
    
    private static final String COINMARKETCAP_API = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
    
    public CryptoPrice getPrice(String symbol) {
        // Fetch live price from CoinMarketCap
        String json = fetchCoinMarketCapPrice(symbol);
        try {
            // Parse JSON response
            com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(json);
            com.fasterxml.jackson.databind.JsonNode data = root.get("data").get(symbol);
            BigDecimal currentPrice = new BigDecimal(data.get("quote").get("USD").get("price").asText());
            BigDecimal highPrice = new BigDecimal(data.get("quote").get("USD").get("high_24h").asText());
            BigDecimal lowPrice = new BigDecimal(data.get("quote").get("USD").get("low_24h").asText());
            BigDecimal openPrice = new BigDecimal(data.get("quote").get("USD").get("open_24h").asText());
            BigDecimal priceChange24h = new BigDecimal(data.get("quote").get("USD").get("volume_change_24h").asText());
            BigDecimal percentChange24h = new BigDecimal(data.get("quote").get("USD").get("percent_change_24h").asText());
            BigDecimal volume24h = new BigDecimal(data.get("quote").get("USD").get("volume_24h").asText());
            BigDecimal marketCap = new BigDecimal(data.get("quote").get("USD").get("market_cap").asText());
            java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();
            return CryptoPrice.builder()
                .symbol(symbol)
                .currentPrice(currentPrice)
                .highPrice(highPrice)
                .lowPrice(lowPrice)
                .openPrice(openPrice)
                .priceChange24h(priceChange24h)
                .percentChange24h(percentChange24h)
                .volume24h(volume24h)
                .marketCap(marketCap)
                .updatedAt(updatedAt)
                .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch live price for symbol: " + symbol, e);
        }
    }
    
    public Optional<CryptoPrice> getPriceOptional(String symbol) {
        try {
            return Optional.of(getPrice(symbol));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public List<CryptoPrice> getAllPrices() {
        return cryptoPriceRepository.findAll();
    }
    
    @Transactional
    public CryptoPrice updateOrCreatePrice(String symbol, BigDecimal currentPrice,
                                          BigDecimal highPrice, BigDecimal lowPrice,
                                          BigDecimal openPrice, BigDecimal priceChange24h,
                                          BigDecimal percentChange24h, BigDecimal volume24h,
                                          BigDecimal marketCap) {
        Optional<CryptoPrice> existing = cryptoPriceRepository.findBySymbol(symbol);
        
        CryptoPrice price = existing.orElse(new CryptoPrice());
        price.setSymbol(symbol);
        price.setCurrentPrice(currentPrice);
        price.setHighPrice(highPrice);
        price.setLowPrice(lowPrice);
        price.setOpenPrice(openPrice);
        price.setPriceChange24h(priceChange24h);
        price.setPercentChange24h(percentChange24h);
        price.setVolume24h(volume24h);
        price.setMarketCap(marketCap);
        price.setUpdatedAt(LocalDateTime.now());
        
        CryptoPrice saved = cryptoPriceRepository.save(price);
        log.info("Updated price for {}: {}", symbol, currentPrice);
        return saved;
    }
    
    public CryptoPrice updatePrice(String symbol, BigDecimal currentPrice) {
        CryptoPrice price = cryptoPriceRepository.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Price not found for symbol: " + symbol));
        
        BigDecimal priceChange = currentPrice.subtract(price.getOpenPrice());
        BigDecimal percentChange = priceChange.divide(price.getOpenPrice(), 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        
        price.setCurrentPrice(currentPrice);
        price.setPriceChange24h(priceChange);
        price.setPercentChange24h(percentChange);
        price.setUpdatedAt(LocalDateTime.now());
        
        CryptoPrice saved = cryptoPriceRepository.save(price);
        log.debug("Updated price for {}: {}", symbol, currentPrice);
        return saved;
    }
    
    // Sample data initialization
    public void initializeDefaultPrices() {
        if (!cryptoPriceRepository.existsBySymbol("BTCUSDT")) {
            updateOrCreatePrice("BTCUSDT", 
                    BigDecimal.valueOf(43250.50),
                    BigDecimal.valueOf(44000.00),
                    BigDecimal.valueOf(42500.00),
                    BigDecimal.valueOf(43100.00),
                    BigDecimal.valueOf(1250.50),
                    BigDecimal.valueOf(2.97),
                    BigDecimal.valueOf(28_000_000_000L),
                    BigDecimal.valueOf(850_000_000_000L));
        }
        
        if (!cryptoPriceRepository.existsBySymbol("ETHUSDT")) {
            updateOrCreatePrice("ETHUSDT",
                    BigDecimal.valueOf(2280.75),
                    BigDecimal.valueOf(2350.00),
                    BigDecimal.valueOf(2200.00),
                    BigDecimal.valueOf(2250.00),
                    BigDecimal.valueOf(30.75),
                    BigDecimal.valueOf(1.38),
                    BigDecimal.valueOf(15_000_000_000L),
                    BigDecimal.valueOf(273_000_000_000L));
        }
        
        if (!cryptoPriceRepository.existsBySymbol("BNBUSDT")) {
            updateOrCreatePrice("BNBUSDT",
                    BigDecimal.valueOf(618.50),
                    BigDecimal.valueOf(630.00),
                    BigDecimal.valueOf(610.00),
                    BigDecimal.valueOf(615.00),
                    BigDecimal.valueOf(3.50),
                    BigDecimal.valueOf(0.57),
                    BigDecimal.valueOf(3_000_000_000L),
                    BigDecimal.valueOf(94_000_000_000L));
        }
    }
    
    /**
     * Fetch price data from CoinMarketCap for a given symbol (e.g., BTC, ETH).
     */
    public String fetchCoinMarketCapPrice(String symbol) {
        String url = COINMARKETCAP_API + "?symbol=" + symbol;
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("X-CMC_PRO_API_KEY", coinMarketCapApiKey);
        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
        org.springframework.http.ResponseEntity<String> response = restTemplate.exchange(
                url,
                org.springframework.http.HttpMethod.GET,
                entity,
                String.class
        );
        return response.getBody();
    }
}