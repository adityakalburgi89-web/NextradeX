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
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RiskManagementService {
    
    private final FuturesPositionRepository futuresPositionRepository;
    private final MarginPositionRepository marginPositionRepository;
    private final FuturesTradingService futuresTradingService;
    private final MarginTradingService marginTradingService;
    private final MarketService marketService;
    private final UserService userService;
    
    private static final BigDecimal FUTURES_MAINTENANCE_MARGIN = new BigDecimal("0.05");
    private static final BigDecimal MARGIN_MAINTENANCE_MARGIN = new BigDecimal("0.20");
    
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
        List<FuturesPosition> openPositions = futuresPositionRepository
                .findAll()
                .stream()
                .filter(p -> p.getStatus() == PositionStatus.OPEN)
                .toList();
        
        for (FuturesPosition position : openPositions) {
            try {
                BigDecimal currentPrice = marketService.getPrice(position.getSymbol()).getCurrentPrice();
                updateFuturesPosition(position, currentPrice);
            } catch (Exception e) {
                log.error("Error monitoring futures position {}: ", position.getId(), e);
            }
        }
    }
    
    private void monitorMarginPositions() {
        List<MarginPosition> openPositions = marginPositionRepository
                .findAll()
                .stream()
                .filter(p -> "OPEN".equals(p.getStatus()))
                .toList();
        
        for (MarginPosition position : openPositions) {
            try {
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
        BigDecimal pnlPerUnit = position.getPositionMode().toString().equals("LONG") ?
                currentPrice.subtract(position.getEntryPrice()) :
                position.getEntryPrice().subtract(currentPrice);
        
        BigDecimal unrealizedPnL = pnlPerUnit.multiply(position.getQuantity());
        position.setUnrealizedPnL(unrealizedPnL);
        
        // Calculate margin ratio
        BigDecimal equity = position.getCollateral().add(unrealizedPnL);
        BigDecimal maintenanceMargin = position.getCollateral()
                .multiply(FUTURES_MAINTENANCE_MARGIN);
        
        BigDecimal marginRatio;
        if (maintenanceMargin.compareTo(BigDecimal.ZERO) > 0) {
            marginRatio = equity.divide(maintenanceMargin, 4, RoundingMode.HALF_UP);
        } else {
            marginRatio = BigDecimal.ZERO;
        }
        
        position.setMarginRatio(marginRatio);
        
        // Check SL/TP triggers
        boolean triggered = false;
        String triggerRemark = "";
        
        if (position.getPositionMode().toString().equals("LONG")) {
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
        
        futuresPositionRepository.save(position);
        
        // Check liquidation condition
        if (marginRatio.compareTo(BigDecimal.ONE) < 0) {
            log.warn("Liquidating futures position {} with margin ratio: {}", position.getId(), marginRatio);
            futuresTradingService.liquidatePosition(position.getId());
        }
    }
    
    private void updateMarginPosition(MarginPosition position, BigDecimal currentPrice) {
        // Calculate unrealized PnL
        BigDecimal pnlPerUnit = "BUY".equals(position.getSide()) ?
                currentPrice.subtract(position.getEntryPrice()) :
                position.getEntryPrice().subtract(currentPrice);
        
        BigDecimal unrealizedPnL = pnlPerUnit.multiply(position.getQuantity());
        position.setUnrealizedPnL(unrealizedPnL);
        
        // Calculate equity
        BigDecimal equity = position.getCollateral()
                .add(unrealizedPnL)
                .subtract(position.getInterestAccrued());
        
        // Calculate margin ratio
        BigDecimal marginRatio = equity.divide(position.getBorrowedAmount(), 4, RoundingMode.HALF_UP);
        position.setMarginRatio(marginRatio);
        
        marginPositionRepository.save(position);
        
        // Check liquidation condition
        if (marginRatio.compareTo(MARGIN_MAINTENANCE_MARGIN) < 0) {
            log.warn("Liquidating margin position {} with margin ratio: {}", position.getId(), marginRatio);
            marginTradingService.liquidatePosition(position.getId());
        }
    }
    
    public RiskAnalysis analyzeUserRisk(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<FuturesPosition> futuresPositions = futuresPositionRepository
                .findAll()
                .stream()
                .filter(p -> p.getUser().getId().equals(userId) && p.getStatus() == PositionStatus.OPEN)
                .toList();
        
        List<MarginPosition> marginPositions = marginPositionRepository
                .findAll()
                .stream()
                .filter(p -> p.getUser().getId().equals(userId) && "OPEN".equals(p.getStatus()))
                .toList();
        
        BigDecimal totalUnrealizedPnL = BigDecimal.ZERO;
        BigDecimal totalCollateral = BigDecimal.ZERO;
        BigDecimal maxLiquidationRisk = BigDecimal.ZERO;
        
        for (FuturesPosition pos : futuresPositions) {
            totalUnrealizedPnL = totalUnrealizedPnL.add(pos.getUnrealizedPnL());
            totalCollateral = totalCollateral.add(pos.getCollateral());
            if (pos.getMarginRatio().compareTo(maxLiquidationRisk) > 0) {
                maxLiquidationRisk = pos.getMarginRatio();
            }
        }
        
        for (MarginPosition pos : marginPositions) {
            totalUnrealizedPnL = totalUnrealizedPnL.add(pos.getUnrealizedPnL());
            totalCollateral = totalCollateral.add(pos.getCollateral());
            if (pos.getMarginRatio().compareTo(maxLiquidationRisk) > 0) {
                maxLiquidationRisk = pos.getMarginRatio();
            }
        }
        
        return RiskAnalysis.builder()
                .userId(userId)
                .totalUnrealizedPnL(totalUnrealizedPnL)
                .totalCollateral(totalCollateral)
                .maxLiquidationRisk(maxLiquidationRisk)
                .futuresPositionCount(futuresPositions.size())
                .marginPositionCount(marginPositions.size())
                .isHighRisk(maxLiquidationRisk.compareTo(new BigDecimal("1.5")) < 0)
                .build();
    }
}
