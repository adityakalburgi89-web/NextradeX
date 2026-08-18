package com.nextradex.market;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nextradex.modules.market.binance.IBinanceService;
import com.nextradex.modules.market.market.CryptoPrice;
import com.nextradex.modules.market.market.CryptoPriceRepository;
import com.nextradex.modules.market.market.MarketService;
import com.nextradex.modules.market.market.TechnicalAnalysisService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

class MarketServiceSyncTest {

    @Test
    void syncPreservesCachedPricesOutsideTheCoreMarketList() {
        CryptoPriceRepository repository = mock(CryptoPriceRepository.class);
        IBinanceService binanceService = mock(IBinanceService.class);
        MarketService service = new MarketService(
                repository,
                mock(RestTemplate.class),
                binanceService,
                mock(TechnicalAnalysisService.class));

        CryptoPrice dynamicPrice = CryptoPrice.builder()
                .symbol("FUNUSDT")
                .currentPrice(new BigDecimal("0.0025"))
                .build();
        when(repository.findAll()).thenReturn(List.of(dynamicPrice));

        service.syncMarketPrices();

        verify(repository, never()).delete(any(CryptoPrice.class));
    }
}
