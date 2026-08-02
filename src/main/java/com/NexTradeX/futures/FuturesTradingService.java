package com.NexTradeX.futures;

import com.NexTradeX.exception.InvalidOrderException;
import com.NexTradeX.market.IMarketService;
import com.NexTradeX.order.Order;
import com.NexTradeX.order.OrderRepository;
import com.NexTradeX.order.OrderSide;
import com.NexTradeX.order.OrderStatus;
import com.NexTradeX.order.TradeType;
import com.NexTradeX.risk.PositionRiskCalculator;
import com.NexTradeX.user.User;
import com.NexTradeX.user.IUserService;
import com.NexTradeX.wallet.IWalletService;
import com.NexTradeX.wallet.WalletType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FuturesTradingService implements IFuturesTradingService {

    private final FuturesPositionRepository futuresPositionRepository;
    private final OrderRepository orderRepository;
    private final IUserService userService;
    private final IWalletService walletService;
    private final IMarketService marketService;
    private final PositionRiskCalculator riskCalculator;

    public Order openFuturesPosition(Long userId, String symbol, OrderSide side,
            BigDecimal quantity, BigDecimal leverage) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOrderException("Quantity must be greater than zero");
        }

        if (symbol.toUpperCase().startsWith("BTC") && quantity.compareTo(new BigDecimal("11")) > 0) {
            throw new InvalidOrderException("Quantity cannot exceed 11 BTC for BTC trading");
        }

        if (leverage.compareTo(BigDecimal.ONE) < 0 || leverage.compareTo(new BigDecimal("20")) > 0) {
            throw new InvalidOrderException("Leverage must be between 1x and 20x");
        }

        BigDecimal entryPrice = marketService.getPrice(symbol).getCurrentPrice();
        BigDecimal totalCost = entryPrice.multiply(quantity);
        if (totalCost.compareTo(new BigDecimal("99999999999.99999999")) > 0) {
            throw new InvalidOrderException("Total position value exceeds maximum allowed precision");
        }
        BigDecimal collateral = totalCost.divide(leverage, 8, RoundingMode.HALF_UP);
        BigDecimal initialMarginRatio = riskCalculator.futuresMarginRatio(
                entryPrice, quantity, collateral, BigDecimal.ZERO);

        // Check wallet balance
        var wallet = walletService.getWallet(userId, WalletType.FUTURES);
        if (!walletService.hasEnoughBalance(wallet.getId(), collateral)) {
            throw new InvalidOrderException("Insufficient balance for collateral");
        }

        // Lock funds
        walletService.lockFunds(wallet.getId(), collateral);

        // Create position
        PositionMode mode = side == OrderSide.BUY ? PositionMode.LONG : PositionMode.SHORT;
        FuturesPosition position = FuturesPosition.builder()
                .user(user)
                .symbol(symbol)
                .positionMode(mode)
                .status(PositionStatus.OPEN)
                .quantity(quantity)
                .entryPrice(entryPrice)
                .leverage(leverage)
                .collateral(collateral)
                .markPrice(entryPrice)
                .marginRatio(initialMarginRatio)
                .build();

        FuturesPosition savedPosition = futuresPositionRepository.save(position);

        // Create order
        Order order = Order.builder()
                .user(user)
                .symbol(symbol)
                .side(side)
                .quantity(quantity)
                .price(entryPrice)
                .status(OrderStatus.FILLED)
                .tradeType(TradeType.FUTURES)
                .leverage(leverage)
                .filledQuantity(quantity)
                .averagePrice(entryPrice)
                .filledAt(LocalDateTime.now())
                .build();

        orderRepository.save(order);

        log.info("Futures position opened for user {}: {} {} {} {}", userId, symbol, side, quantity, leverage);
        return order;
    }

    public void updatePositionMarkPrice(Long positionId, BigDecimal markPrice) {
        FuturesPosition position = futuresPositionRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        position.setMarkPrice(markPrice);

        // Calculate unrealized PnL
        BigDecimal unrealizedPnL = riskCalculator.calculatePnl(
                position.getPositionMode(), position.getEntryPrice(), markPrice, position.getQuantity());
        position.setUnrealizedPnL(unrealizedPnL);

        BigDecimal marginRatio = riskCalculator.futuresMarginRatio(
                markPrice, position.getQuantity(), position.getCollateral(), unrealizedPnL);
        position.setMarginRatio(marginRatio);

        futuresPositionRepository.save(position);
        log.debug("Updated mark price for position {}: {}", positionId, markPrice);

        // Check liquidation
        if (marginRatio.compareTo(BigDecimal.ONE) < 0) {
            liquidatePosition(positionId);
        }
    }

    public void closeFuturesPosition(Long positionId, Long userId) {
        closeFuturesPosition(positionId, userId, "Position closed manually");
    }

    public void closeFuturesPosition(Long positionId, Long userId, String remarks) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FuturesPosition position = futuresPositionRepository.findByIdAndUser(positionId, user)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        if (position.getStatus() != PositionStatus.OPEN) {
            throw new InvalidOrderException("Position is not open");
        }

        BigDecimal exitPrice = marketService.getPrice(position.getSymbol()).getCurrentPrice();
        position.setExitPrice(exitPrice);

        // Calculate realized PnL
        BigDecimal realizedPnL = riskCalculator.calculatePnl(
                position.getPositionMode(), position.getEntryPrice(), exitPrice, position.getQuantity());
        realizedPnL = riskCalculator.capLossAtCollateral(realizedPnL, position.getCollateral());
        position.setRealizedPnL(realizedPnL);
        position.setStatus(PositionStatus.CLOSED);
        position.setClosedAt(LocalDateTime.now());
        position.setRemarks(remarks);

        // Unlock collateral and add PnL
        var wallet = walletService.getWallet(userId, WalletType.FUTURES);
        walletService.unlockFunds(wallet.getId(), position.getCollateral());
        walletService.updateBalance(wallet.getId(), realizedPnL);

        futuresPositionRepository.save(position);
        log.info("Futures position closed ({}): {} PnL: {}", remarks, positionId, realizedPnL);
    }

    public FuturesPosition updateSlTp(Long positionId, Long userId, BigDecimal stopLoss, BigDecimal takeProfit) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FuturesPosition position = futuresPositionRepository.findByIdAndUser(positionId, user)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        if (position.getStatus() != PositionStatus.OPEN) {
            throw new InvalidOrderException("Position is not open");
        }

        BigDecimal currentPrice = position.getMarkPrice() != null ? position.getMarkPrice() : position.getEntryPrice();

        if (position.getPositionMode() == PositionMode.LONG) {
            if (stopLoss != null && stopLoss.compareTo(BigDecimal.ZERO) > 0 && stopLoss.compareTo(currentPrice) >= 0) {
                throw new InvalidOrderException(
                        "Stop Loss for Long position must be below current price (" + currentPrice + ")");
            }
            if (takeProfit != null && takeProfit.compareTo(BigDecimal.ZERO) > 0
                    && takeProfit.compareTo(currentPrice) <= 0) {
                throw new InvalidOrderException(
                        "Take Profit for Long position must be above current price (" + currentPrice + ")");
            }
        } else { // SHORT
            if (stopLoss != null && stopLoss.compareTo(BigDecimal.ZERO) > 0 && stopLoss.compareTo(currentPrice) <= 0) {
                throw new InvalidOrderException(
                        "Stop Loss for Short position must be above current price (" + currentPrice + ")");
            }
            if (takeProfit != null && takeProfit.compareTo(BigDecimal.ZERO) > 0
                    && takeProfit.compareTo(currentPrice) >= 0) {
                throw new InvalidOrderException(
                        "Take Profit for Short position must be below current price (" + currentPrice + ")");
            }
        }

        position.setStopLoss(stopLoss != null && stopLoss.compareTo(BigDecimal.ZERO) > 0 ? stopLoss : null);
        position.setTakeProfit(takeProfit != null && takeProfit.compareTo(BigDecimal.ZERO) > 0 ? takeProfit : null);

        return futuresPositionRepository.save(position);
    }

    public void liquidatePosition(Long positionId) {
        FuturesPosition position = futuresPositionRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        if (position.getStatus() != PositionStatus.OPEN) {
            return;
        }

        BigDecimal liquidationPrice = marketService.getPrice(position.getSymbol()).getCurrentPrice();
        position.setExitPrice(liquidationPrice);
        position.setStatus(PositionStatus.LIQUIDATED);
        position.setClosedAt(LocalDateTime.now());
        position.setRemarks("Position liquidated");

        // Calculate loss
        BigDecimal rawPnl = riskCalculator.calculatePnl(
                position.getPositionMode(), position.getEntryPrice(), liquidationPrice, position.getQuantity());
        BigDecimal realizedPnL = riskCalculator.capLossAtCollateral(rawPnl, position.getCollateral());
        position.setRealizedPnL(realizedPnL);

        var wallet = walletService.getWallet(position.getUser().getId(), WalletType.FUTURES);
        walletService.unlockFunds(wallet.getId(), position.getCollateral());
        walletService.updateBalance(wallet.getId(), realizedPnL);

        futuresPositionRepository.save(position);
        log.warn("Position {} liquidated at price {}", positionId, liquidationPrice);
    }

    public List<FuturesPosition> getUserOpenPositions(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return futuresPositionRepository.findAllByUserAndStatus(user, PositionStatus.OPEN);
    }

    public List<FuturesPosition> getUserAllPositions(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return futuresPositionRepository.findAllByUser(user);
    }
}
