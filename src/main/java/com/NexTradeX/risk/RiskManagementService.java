package com.NexTradeX.risk;

import com.NexTradeX.futures.FuturesPosition;
import com.NexTradeX.futures.FuturesPositionRepository;
import com.NexTradeX.futures.FuturesTradingService;
import com.NexTradeX.futures.PositionStatus;
import com.NexTradeX.margin.MarginPosition;
import com.NexTradeX.margin.MarginPositionRepository;
import com.NexTradeX.margin.MarginTradingService;
import com.NexTradeX.market.MarketService;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import jakarta.persistence.EntityManager;

import com.NexTradeX.futures.IFuturesTradingService;
import com.NexTradeX.margin.IMarginTradingService;
import com.NexTradeX.market.IMarketService;
import com.NexTradeX.user.IUserService;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RiskManagementService implements IRiskManagementService {
    
    private final FuturesPositionRepository futuresPositionRepository;
    private final MarginPositionRepository marginPositionRepository;
    private final IFuturesTradingService futuresTradingService;
    private final IMarginTradingService marginTradingService;
    private final IMarketService marketService;
    private final IUserService userService;
    private final EntityManager entityManager;
    private final PositionRiskCalculator riskCalculator;
    
    @Scheduled(fixedDelay = 5000) // Run every 5 seconds
    @Transactional
    public void monitorAndLiquidatePositions() {
        try {
            monitorFuturesPositions();
            monitorMarginPositions();
        } catch (Exception e) {
            log.error("Error during risk monitoring: ", e);
        }
    }
    
    private void monitorFuturesPositions() {
        List<FuturesPosition> openPositions = futuresPositionRepository.findAllByStatus(PositionStatus.OPEN);
        
        for (FuturesPosition position : openPositions) {
            try {
                entityManager.detach(position);
                BigDecimal currentPrice = marketService.getPrice(position.getSymbol()).getCurrentPrice();
                updateFuturesPosition(position, currentPrice);
            } catch (Exception e) {
                log.error("Error monitoring futures position {}: ", position.getId(), e);
            }
        }
    }
    
    private void monitorMarginPositions() {
        List<MarginPosition> openPositions = marginPositionRepository.findAllByStatus("OPEN");
        
        for (MarginPosition position : openPositions) {
            try {
                entityManager.detach(position);
                BigDecimal currentPrice = marketService.getPrice(position.getSymbol()).getCurrentPrice();
                updateMarginPosition(position, currentPrice);
            } catch (Exception e) {
                log.error("Error monitoring margin position {}: ", position.getId(), e);
            }
        }
    }
    
    private void updateFuturesPosition(FuturesPosition position, BigDecimal currentPrice) {
        position.setMarkPrice(currentPrice);
        
        // Calculate unrealized PnL
        BigDecimal unrealizedPnL = riskCalculator.calculatePnl(
                position.getPositionMode(), position.getEntryPrice(), currentPrice, position.getQuantity());
        position.setUnrealizedPnL(unrealizedPnL);

        BigDecimal marginRatio = riskCalculator.futuresMarginRatio(
                currentPrice, position.getQuantity(), position.getCollateral(), unrealizedPnL);
        
        position.setMarginRatio(marginRatio);
        
        
        // Check SL/TP triggers
        boolean triggered = false;
        String triggerRemark = "";
        
        if (position.getPositionMode() == com.NexTradeX.futures.PositionMode.LONG) {
            if (position.getStopLoss() != null && currentPrice.compareTo(position.getStopLoss()) <= 0) {
                triggered = true;
                triggerRemark = "Closed via Stop Loss at " + currentPrice;
            } else if (position.getTakeProfit() != null && currentPrice.compareTo(position.getTakeProfit()) >= 0) {
                triggered = true;
                triggerRemark = "Closed via Take Profit at " + currentPrice;
            }
        } else { // SHORT
            if (position.getStopLoss() != null && currentPrice.compareTo(position.getStopLoss()) >= 0) {
                triggered = true;
                triggerRemark = "Closed via Stop Loss at " + currentPrice;
            } else if (position.getTakeProfit() != null && currentPrice.compareTo(position.getTakeProfit()) <= 0) {
                triggered = true;
                triggerRemark = "Closed via Take Profit at " + currentPrice;
            }
        }

        if (triggered) {
            log.info("Triggering SL/TP for position {}: {}", position.getId(), triggerRemark);
            futuresTradingService.closeFuturesPosition(position.getId(), position.getUser().getId(), triggerRemark);
            return;
        }
        
        int updated = futuresPositionRepository.updateRiskFields(position.getId(), currentPrice, unrealizedPnL, marginRatio);
        
        // Check liquidation condition only if position was still OPEN and updated
        if (updated > 0 && marginRatio.compareTo(BigDecimal.ONE) < 0) {
            log.warn("Liquidating futures position {} with margin ratio: {}", position.getId(), marginRatio);
            futuresTradingService.liquidatePosition(position.getId());
        }
    }
    
    private void updateMarginPosition(MarginPosition position, BigDecimal currentPrice) {
        // Calculate unrealized PnL
        BigDecimal unrealizedPnL = riskCalculator.calculatePnl(
                com.NexTradeX.order.OrderSide.valueOf(position.getSide()),
                position.getEntryPrice(), currentPrice, position.getQuantity());
        position.setUnrealizedPnL(unrealizedPnL);

        BigDecimal marginRatio = riskCalculator.marginRatio(
                position.getCollateral(), unrealizedPnL,
                position.getInterestAccrued(), position.getBorrowedAmount());
        position.setMarginRatio(marginRatio);
        
        int updated = marginPositionRepository.updateRiskFields(position.getId(), unrealizedPnL, marginRatio);
        
        // Check liquidation condition only if position was still OPEN and updated
        if (updated > 0 && marginRatio.compareTo(PositionRiskCalculator.MARGIN_MAINTENANCE_RATIO) < 0) {
            log.warn("Liquidating margin position {} with margin ratio: {}", position.getId(), marginRatio);
            marginTradingService.liquidatePosition(position.getId());
        }
    }
    
    public RiskAnalysis analyzeUserRisk(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<FuturesPosition> futuresPositions =
                futuresPositionRepository.findAllByUserAndStatus(user, PositionStatus.OPEN);
        List<MarginPosition> marginPositions =
                marginPositionRepository.findAllByUserAndStatus(user, "OPEN");
        
        BigDecimal totalUnrealizedPnL = BigDecimal.ZERO;
        BigDecimal totalCollateral = BigDecimal.ZERO;
        BigDecimal minimumMarginRatio = null;
        
        for (FuturesPosition pos : futuresPositions) {
            totalUnrealizedPnL = totalUnrealizedPnL.add(pos.getUnrealizedPnL());
            totalCollateral = totalCollateral.add(pos.getCollateral());
            if (minimumMarginRatio == null || pos.getMarginRatio().compareTo(minimumMarginRatio) < 0) {
                minimumMarginRatio = pos.getMarginRatio();
            }
        }
        
        for (MarginPosition pos : marginPositions) {
            totalUnrealizedPnL = totalUnrealizedPnL.add(pos.getUnrealizedPnL());
            totalCollateral = totalCollateral.add(pos.getCollateral());
            if (minimumMarginRatio == null || pos.getMarginRatio().compareTo(minimumMarginRatio) < 0) {
                minimumMarginRatio = pos.getMarginRatio();
            }
        }
        
        return RiskAnalysis.builder()
                .userId(userId)
                .totalUnrealizedPnL(totalUnrealizedPnL)
                .totalCollateral(totalCollateral)
                .maxLiquidationRisk(minimumMarginRatio == null ? BigDecimal.ZERO : minimumMarginRatio)
                .futuresPositionCount(futuresPositions.size())
                .marginPositionCount(marginPositions.size())
                .isHighRisk(minimumMarginRatio != null && minimumMarginRatio.compareTo(new BigDecimal("1.5")) < 0)
                .build();
    }
}
