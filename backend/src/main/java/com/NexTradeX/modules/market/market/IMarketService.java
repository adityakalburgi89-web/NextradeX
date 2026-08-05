package com.nextradex.modules.market.market;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Interface contract for Market Service operations.
 */
public interface IMarketService {
    CryptoPrice getPrice(String symbol);
    Optional<CryptoPrice> getPriceOptional(String symbol);
    List<CryptoPrice> getAllPrices();
    List<CandlestickDataPoint> getCandlestickData(String symbol, String interval, int limit);
    void syncMarketPrices();
    CryptoPrice updateOrCreatePrice(String symbol, BigDecimal currentPrice, BigDecimal highPrice, BigDecimal lowPrice, BigDecimal openPrice, BigDecimal priceChange24h, BigDecimal percentChange24h, BigDecimal volume24h, BigDecimal marketCap);
    CryptoPrice updatePrice(String symbol, BigDecimal currentPrice);
    String fetchCoinMarketCapPrice(String symbol);
    String fetchCoinGeckoPrice(String coinId);
    java.util.Map<String, Object> getGlobalMarketStats();
}
