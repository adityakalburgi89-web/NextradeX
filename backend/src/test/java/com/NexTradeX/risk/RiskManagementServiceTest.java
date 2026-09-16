package com.nextradex.modules.risk;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nextradex.modules.market.market.CryptoPrice;
import com.nextradex.modules.market.market.IMarketService;
import com.nextradex.modules.trading.futures.FuturesPosition;
import com.nextradex.modules.trading.futures.FuturesPositionRepository;
import com.nextradex.modules.trading.futures.IFuturesTradingService;
import com.nextradex.modules.trading.futures.PositionMode;
import com.nextradex.modules.trading.futures.PositionStatus;
import com.nextradex.modules.trading.margin.IMarginTradingService;
import com.nextradex.modules.trading.margin.MarginPositionRepository;
import com.nextradex.modules.user.IUserService;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class RiskManagementServiceTest {

    @Test
    void unavailablePriceSkipsOnePositionWithoutStoppingTheMonitoringCycle() {
        FuturesPositionRepository futuresRepository = mock(FuturesPositionRepository.class);
        MarginPositionRepository marginRepository = mock(MarginPositionRepository.class);
        IFuturesTradingService futuresTradingService = mock(IFuturesTradingService.class);
        IMarketService marketService = mock(IMarketService.class);

        RiskManagementService service = new RiskManagementService(
                futuresRepository,
                marginRepository,
                futuresTradingService,
                mock(IMarginTradingService.class),
                marketService,
                mock(IUserService.class),
                mock(EntityManager.class),
                new PositionRiskCalculator());

        FuturesPosition unavailable = position(264L, "FUNUSDT");
        FuturesPosition available = position(265L, "BTCUSDT");
        when(futuresRepository.findAllByStatus(PositionStatus.OPEN))
                .thenReturn(List.of(unavailable, available));
        when(marginRepository.findAllByStatus("OPEN")).thenReturn(List.of());
        when(marketService.getPriceOptional("FUNUSDT")).thenReturn(Optional.empty());
        when(marketService.getPriceOptional("BTCUSDT")).thenReturn(Optional.of(
                CryptoPrice.builder()
                        .symbol("BTCUSDT")
                        .currentPrice(new BigDecimal("110"))
                        .build()));
        when(futuresRepository.updateRiskFields(
                eq(265L), any(BigDecimal.class), any(BigDecimal.class), any(BigDecimal.class)))
                .thenReturn(1);

        service.monitorAndLiquidatePositions();

        verify(futuresRepository, never()).updateRiskFields(
                eq(264L), any(BigDecimal.class), any(BigDecimal.class), any(BigDecimal.class));
        verify(futuresRepository).updateRiskFields(
                eq(265L), eq(new BigDecimal("110")), eq(new BigDecimal("10")), eq(new BigDecimal("20.0000")));
        verify(futuresTradingService, never()).liquidatePosition(any());
        verify(marketService, never()).getPrice(any());
    }

    private FuturesPosition position(Long id, String symbol) {
        return FuturesPosition.builder()
                .id(id)
                .symbol(symbol)
                .positionMode(PositionMode.LONG)
                .status(PositionStatus.OPEN)
                .quantity(BigDecimal.ONE)
                .entryPrice(new BigDecimal("100"))
                .leverage(BigDecimal.ONE)
                .collateral(new BigDecimal("100"))
                .build();
    }
}
