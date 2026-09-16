package com.nextradex.modules.market.binance;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Interface contract for Binance exchange data integration.
 */
public interface IBinanceService {
    String getEffectiveBaseUrl();
    String getEffectiveWsBaseUrl();
    boolean isRequestAllowed();
    boolean isTickerFetchAllowed(String symbol);
    boolean checkAndRecordTickerFetch(String symbol);
    void recordTickerFetch(String symbol);
    void triggerCooldown(String baseUrl);
    void triggerWsCooldown(String baseUrl);
    void triggerGlobalCooldown();
    BigDecimal getPrice(String symbol);
    Map<String, BigDecimal> getAllPrices();
    Map<String, Object> getTicker24h(String symbol);
    List<List<Object>> getKlines(String symbol, String interval, int limit);
    List<String> getAvailableSymbols();
    String getEffectiveWebSocketUrl();
    String getActiveProviderName();
    boolean isConfigured();
}
