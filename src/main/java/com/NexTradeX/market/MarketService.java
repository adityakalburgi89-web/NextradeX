package com.NexTradeX.market;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MarketService {

    private static final String COINMARKETCAP_API = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final CryptoPriceRepository cryptoPriceRepository;
    private final RestTemplate restTemplate;

    @Value("${coinmarketcap.api.key}")
    private String coinMarketCapApiKey;

    public CryptoPrice getPrice(String symbol) {
        String normalizedSymbol = normalizeSymbol(symbol);

        try {
            CryptoPrice livePrice = fetchLivePrice(normalizedSymbol);
            return persistPrice(livePrice);
        } catch (Exception exception) {
            log.warn("Falling back to cached market price for {}: {}", normalizedSymbol, exception.getMessage());
            return cryptoPriceRepository.findBySymbol(normalizedSymbol)
                    .orElseGet(() -> createFallbackPrice(normalizedSymbol));
        }
    }

    public Optional<CryptoPrice> getPriceOptional(String symbol) {
        try {
            return Optional.of(getPrice(symbol));
        } catch (Exception exception) {
            return Optional.empty();
        }
    }

    public List<CryptoPrice> getAllPrices() {
        return cryptoPriceRepository.findAll().stream()
                .sorted(Comparator.comparing(CryptoPrice::getSymbol))
                .toList();
    }

    public List<CandlestickDataPoint> getCandlestickData(String symbol, String interval, int limit) {
        String normalizedSymbol = normalizeSymbol(symbol);
        int sanitizedLimit = Math.min(Math.max(limit, 24), 240);
        int minutesPerCandle = resolveIntervalMinutes(interval);
        CryptoPrice snapshot = cryptoPriceRepository.findBySymbol(normalizedSymbol)
                .orElseGet(() -> getPrice(normalizedSymbol));

        BigDecimal currentClose = safe(snapshot.getCurrentPrice(), BigDecimal.valueOf(100));
        BigDecimal dailyMove = safe(snapshot.getPercentChange24h(), BigDecimal.ZERO)
                .divide(HUNDRED, 8, RoundingMode.HALF_UP);
        BigDecimal volatility = dailyMove.abs().max(new BigDecimal("0.004"));

        List<CandlestickDataPoint> candles = new ArrayList<>(sanitizedLimit);
        long closeTime = LocalDateTime.now()
                .withSecond(0)
                .withNano(0)
                .toEpochSecond(ZoneOffset.UTC);

        BigDecimal previousClose = currentClose
                .multiply(BigDecimal.ONE.subtract(dailyMove.multiply(BigDecimal.valueOf(sanitizedLimit / 3.0))))
                .max(new BigDecimal("0.0001"));

        for (int index = sanitizedLimit - 1; index >= 0; index--) {
            long candleTime = closeTime - ((long) minutesPerCandle * 60 * index);
            double oscillation = Math.sin((sanitizedLimit - index) * 0.65D + normalizedSymbol.hashCode() * 0.0001D);
            double drift = index == 0 ? 0.0D : (double) index / sanitizedLimit;

            BigDecimal open = previousClose;
            BigDecimal directionalMove = volatility
                    .multiply(BigDecimal.valueOf(0.85D - (drift * 0.35D)))
                    .multiply(BigDecimal.valueOf(oscillation * 0.8D));
            BigDecimal noiseMove = volatility
                    .multiply(BigDecimal.valueOf(randomRange(-0.45D, 0.45D)));
            BigDecimal close = open
                    .multiply(BigDecimal.ONE.add(directionalMove.add(noiseMove)))
                    .max(new BigDecimal("0.0001"));

            BigDecimal wickFactor = volatility.max(new BigDecimal("0.006"));
            BigDecimal wickUp = close.max(open)
                    .multiply(wickFactor.multiply(BigDecimal.valueOf(randomRange(0.35D, 1.1D))));
            BigDecimal wickDown = close.min(open)
                    .multiply(wickFactor.multiply(BigDecimal.valueOf(randomRange(0.25D, 0.9D))));

            BigDecimal high = close.max(open).add(wickUp).setScale(4, RoundingMode.HALF_UP);
            BigDecimal low = close.min(open).subtract(wickDown).max(new BigDecimal("0.0001")).setScale(4, RoundingMode.HALF_UP);
            BigDecimal volumeBase = safe(snapshot.getVolume24h(), BigDecimal.valueOf(1_000_000))
                    .divide(BigDecimal.valueOf(24), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(randomRange(0.55D, 1.45D)));

            CandlestickDataPoint candle = CandlestickDataPoint.builder()
                    .time(candleTime)
                    .open(open.setScale(4, RoundingMode.HALF_UP))
                    .high(high)
                    .low(low)
                    .close(close.setScale(4, RoundingMode.HALF_UP))
                    .volume(volumeBase.setScale(2, RoundingMode.HALF_UP))
                    .build();

            candles.add(candle);
            previousClose = close;
        }

        if (!candles.isEmpty()) {
            CandlestickDataPoint last = candles.get(candles.size() - 1);
            last.setClose(currentClose.setScale(4, RoundingMode.HALF_UP));
            last.setHigh(last.getHigh().max(last.getClose()).setScale(4, RoundingMode.HALF_UP));
            last.setLow(last.getLow().min(last.getClose()).setScale(4, RoundingMode.HALF_UP));
        }

        return candles;
    }

    public synchronized void simulateMarketMovement() {
        List<CryptoPrice> prices = cryptoPriceRepository.findAll();
        if (prices.isEmpty()) {
            return;
        }

        for (CryptoPrice price : prices) {
            BigDecimal current = safe(price.getCurrentPrice(), BigDecimal.ONE);
            BigDecimal open = safe(price.getOpenPrice(), current);
            BigDecimal movement = BigDecimal.valueOf(randomRange(-0.008D, 0.008D));
            BigDecimal next = current.multiply(BigDecimal.ONE.add(movement)).max(new BigDecimal("0.0001"));

            price.setCurrentPrice(next.setScale(4, RoundingMode.HALF_UP));
            price.setHighPrice(safe(price.getHighPrice(), next).max(next).setScale(4, RoundingMode.HALF_UP));
            price.setLowPrice(safe(price.getLowPrice(), next).min(next).setScale(4, RoundingMode.HALF_UP));
            price.setOpenPrice(open.setScale(4, RoundingMode.HALF_UP));

            BigDecimal priceChange = next.subtract(open);
            BigDecimal percentChange = open.compareTo(BigDecimal.ZERO) == 0
                    ? BigDecimal.ZERO
                    : priceChange.divide(open, 4, RoundingMode.HALF_UP).multiply(HUNDRED);

            price.setPriceChange24h(priceChange.setScale(2, RoundingMode.HALF_UP));
            price.setPercentChange24h(percentChange.setScale(2, RoundingMode.HALF_UP));
            price.setVolume24h(safe(price.getVolume24h(), BigDecimal.valueOf(100_000))
                    .multiply(BigDecimal.valueOf(randomRange(0.995D, 1.006D)))
                    .setScale(0, RoundingMode.HALF_UP));
            price.setUpdatedAt(LocalDateTime.now());
        }

        cryptoPriceRepository.saveAll(prices);
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

        BigDecimal openPrice = safe(price.getOpenPrice(), currentPrice);
        BigDecimal priceChange = currentPrice.subtract(openPrice);
        BigDecimal percentChange = openPrice.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : priceChange.divide(openPrice, 4, RoundingMode.HALF_UP).multiply(HUNDRED);

        price.setCurrentPrice(currentPrice);
        price.setHighPrice(safe(price.getHighPrice(), currentPrice).max(currentPrice));
        price.setLowPrice(safe(price.getLowPrice(), currentPrice).min(currentPrice));
        price.setPriceChange24h(priceChange);
        price.setPercentChange24h(percentChange);
        price.setUpdatedAt(LocalDateTime.now());

        CryptoPrice saved = cryptoPriceRepository.save(price);
        log.debug("Updated price for {}: {}", symbol, currentPrice);
        return saved;
    }

    public synchronized void initializeDefaultPrices() {
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

    private CryptoPrice fetchLivePrice(String symbol) throws Exception {
        if (coinMarketCapApiKey == null
                || coinMarketCapApiKey.isBlank()
                || "demo".equalsIgnoreCase(coinMarketCapApiKey)
                || coinMarketCapApiKey.contains("your_coinmarketcap_api_key_here")) {
            throw new IllegalStateException("No market data provider key configured");
        }

        String providerSymbol = extractProviderSymbol(symbol);
        String json = fetchCoinMarketCapPrice(providerSymbol);
        JsonNode root = OBJECT_MAPPER.readTree(json);
        JsonNode data = root.path("data").path(providerSymbol);
        JsonNode quote = data.path("quote").path("USD");

        if (quote.isMissingNode()) {
            throw new IllegalStateException("Unexpected provider response for symbol " + providerSymbol);
        }

        return CryptoPrice.builder()
                .symbol(symbol)
                .currentPrice(new BigDecimal(quote.path("price").asText("0")))
                .highPrice(new BigDecimal(quote.path("high_24h").asText("0")))
                .lowPrice(new BigDecimal(quote.path("low_24h").asText("0")))
                .openPrice(new BigDecimal(quote.path("open_24h").asText("0")))
                .priceChange24h(new BigDecimal(quote.path("volume_change_24h").asText("0")))
                .percentChange24h(new BigDecimal(quote.path("percent_change_24h").asText("0")))
                .volume24h(new BigDecimal(quote.path("volume_24h").asText("0")))
                .marketCap(new BigDecimal(quote.path("market_cap").asText("0")))
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private CryptoPrice persistPrice(CryptoPrice nextPrice) {
        CryptoPrice existing = cryptoPriceRepository.findBySymbol(nextPrice.getSymbol()).orElse(new CryptoPrice());
        existing.setSymbol(nextPrice.getSymbol());
        existing.setCurrentPrice(nextPrice.getCurrentPrice());
        existing.setHighPrice(nextPrice.getHighPrice());
        existing.setLowPrice(nextPrice.getLowPrice());
        existing.setOpenPrice(nextPrice.getOpenPrice());
        existing.setPriceChange24h(nextPrice.getPriceChange24h());
        existing.setPercentChange24h(nextPrice.getPercentChange24h());
        existing.setVolume24h(nextPrice.getVolume24h());
        existing.setMarketCap(nextPrice.getMarketCap());
        existing.setUpdatedAt(LocalDateTime.now());
        return cryptoPriceRepository.save(existing);
    }

    private CryptoPrice createFallbackPrice(String symbol) {
        BigDecimal seeded = switch (symbol) {
            case "ETHUSDT" -> BigDecimal.valueOf(2280.75);
            case "BNBUSDT" -> BigDecimal.valueOf(618.50);
            default -> BigDecimal.valueOf(43250.50);
        };

        return updateOrCreatePrice(
                symbol,
                seeded,
                seeded.multiply(BigDecimal.valueOf(1.02)),
                seeded.multiply(BigDecimal.valueOf(0.98)),
                seeded.multiply(BigDecimal.valueOf(0.99)),
                seeded.multiply(BigDecimal.valueOf(0.01)),
                BigDecimal.valueOf(1.10),
                BigDecimal.valueOf(1_500_000_000L),
                BigDecimal.valueOf(90_000_000_000L)
        );
    }

    private String extractProviderSymbol(String symbol) {
        String normalized = normalizeSymbol(symbol);
        for (String suffix : List.of("USDT", "USDC", "BUSD")) {
            if (normalized.endsWith(suffix) && normalized.length() > suffix.length()) {
                return normalized.substring(0, normalized.length() - suffix.length());
            }
        }
        return normalized;
    }

    private String normalizeSymbol(String symbol) {
        return symbol == null ? "BTCUSDT" : symbol.trim().toUpperCase();
    }

    private int resolveIntervalMinutes(String interval) {
        if (interval == null || interval.isBlank()) {
            return 60;
        }

        return switch (interval.trim().toLowerCase()) {
            case "5m" -> 5;
            case "15m" -> 15;
            case "30m" -> 30;
            case "4h" -> 240;
            case "1d" -> 1440;
            default -> 60;
        };
    }

    private BigDecimal safe(BigDecimal value, BigDecimal fallback) {
        return value == null ? fallback : value;
    }

    private double randomRange(double min, double max) {
        return ThreadLocalRandom.current().nextDouble(min, max);
    }
}
