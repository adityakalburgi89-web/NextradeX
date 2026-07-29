package com.NexTradeX.margin;

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
public class MarginTradingService implements IMarginTradingService {

    private final MarginPositionRepository marginPositionRepository;
    private final OrderRepository orderRepository;
    private final IUserService userService;
    private final IWalletService walletService;
    private final IMarketService marketService;
    private final PositionRiskCalculator riskCalculator;

    private static final BigDecimal DAILY_INTEREST_RATE = new BigDecimal("0.0005"); // 0.05% per day

    public Order openMarginPosition(Long userId, String symbol, OrderSide side,
            BigDecimal quantity, BigDecimal leverage) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOrderException("Quantity must be greater than zero");
        }

        if (symbol.toUpperCase().startsWith("BTC") && quantity.compareTo(new BigDecimal("11")) > 0) {
            throw new InvalidOrderException("Quantity cannot exceed 11 BTC for BTC trading");
        }

        if (leverage.compareTo(new BigDecimal("2")) < 0 || leverage.compareTo(new BigDecimal("10")) > 0) {
            throw new InvalidOrderException("Margin leverage must be between 2x and 10x");
        }

        BigDecimal entryPrice = marketService.getPrice(symbol).getCurrentPrice();
        BigDecimal totalCost = entryPrice.multiply(quantity);
        if (totalCost.compareTo(new BigDecimal("99999999999.99999999")) > 0) {
            throw new InvalidOrderException("Total position value exceeds maximum allowed precision");
        }
        BigDecimal collateral = totalCost.divide(leverage, 8, RoundingMode.HALF_UP);
        BigDecimal borrowedAmount = totalCost.subtract(collateral);
        BigDecimal initialMarginRatio = riskCalculator.marginRatio(
                collateral, BigDecimal.ZERO, BigDecimal.ZERO, borrowedAmount);

        // Check wallet balance
        var wallet = walletService.getWallet(userId, WalletType.MARGIN);
        if (!walletService.hasEnoughBalance(wallet.getId(), collateral)) {
            throw new InvalidOrderException("Insufficient collateral balance");
        }

        // Lock funds
        walletService.lockFunds(wallet.getId(), collateral);

        // Create position
        MarginPosition position = MarginPosition.builder()
                .user(user)
                .symbol(symbol)
                .side(side.name())
                .status("OPEN")
                .quantity(quantity)
                .entryPrice(entryPrice)
                .leverage(leverage)
                .collateral(collateral)
                .borrowedAmount(borrowedAmount)
                .interestRate(DAILY_INTEREST_RATE)
                .marginRatio(initialMarginRatio)
                .build();

        MarginPosition savedPosition = marginPositionRepository.save(position);

        // Create order
        Order order = Order.builder()
                .user(user)
                .symbol(symbol)
                .side(side)
                .quantity(quantity)
                .price(entryPrice)
                .status(OrderStatus.FILLED)
                .tradeType(TradeType.MARGIN)
                .leverage(leverage)
                .filledQuantity(quantity)
                .averagePrice(entryPrice)
                .filledAt(LocalDateTime.now())
                .build();

        orderRepository.save(order);

        log.info("Margin position opened for user {}: {} {} {} {}", userId, symbol, side, quantity, leverage);
        return order;
    }

    public void updatePositionPrice(Long positionId, BigDecimal currentPrice) {
        MarginPosition position = marginPositionRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        // Calculate unrealized PnL
        BigDecimal unrealizedPnL = riskCalculator.calculatePnl(
                OrderSide.valueOf(position.getSide()), position.getEntryPrice(), currentPrice, position.getQuantity());
        position.setUnrealizedPnL(unrealizedPnL);

        // Update margin ratio
        BigDecimal marginRatio = riskCalculator.marginRatio(
                position.getCollateral(), unrealizedPnL, position.getInterestAccrued(), position.getBorrowedAmount());
        position.setMarginRatio(marginRatio);

        marginPositionRepository.save(position);

        // Check liquidation
        if (marginRatio.compareTo(PositionRiskCalculator.MARGIN_MAINTENANCE_RATIO) < 0) {
            liquidatePosition(positionId);
        }
    }

    public void closeMarginPosition(Long positionId, Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MarginPosition position = marginPositionRepository.findByIdAndUser(positionId, user)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        if (!"OPEN".equals(position.getStatus())) {
            throw new InvalidOrderException("Position is not open");
        }

        BigDecimal exitPrice = marketService.getPrice(position.getSymbol()).getCurrentPrice();
        position.setExitPrice(exitPrice);

        // Calculate realized PnL
        BigDecimal realizedPnL = riskCalculator.calculatePnl(
                OrderSide.valueOf(position.getSide()), position.getEntryPrice(), exitPrice, position.getQuantity())
                .subtract(position.getInterestAccrued());
        realizedPnL = riskCalculator.capLossAtCollateral(realizedPnL, position.getCollateral());
        position.setRealizedPnL(realizedPnL);
        position.setStatus("CLOSED");
        position.setClosedAt(LocalDateTime.now());

        // Unlock collateral and add PnL
        var wallet = walletService.getWallet(userId, WalletType.MARGIN);
        walletService.unlockFunds(wallet.getId(), position.getCollateral());
        walletService.updateBalance(wallet.getId(), realizedPnL);

        marginPositionRepository.save(position);
        log.info("Margin position closed: {} PnL: {}", positionId, realizedPnL);
    }

    public void liquidatePosition(Long positionId) {
        MarginPosition position = marginPositionRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        if (!"OPEN".equals(position.getStatus())) {
            return;
        }

        BigDecimal liquidationPrice = marketService.getPrice(position.getSymbol()).getCurrentPrice();
        position.setExitPrice(liquidationPrice);
        position.setStatus("LIQUIDATED");
        position.setClosedAt(LocalDateTime.now());

        BigDecimal rawPnl = riskCalculator.calculatePnl(
                OrderSide.valueOf(position.getSide()), position.getEntryPrice(), liquidationPrice, position.getQuantity())
                .subtract(position.getInterestAccrued());
        BigDecimal realizedPnl = riskCalculator.capLossAtCollateral(rawPnl, position.getCollateral());
        position.setRealizedPnL(realizedPnl);

        var wallet = walletService.getWallet(position.getUser().getId(), WalletType.MARGIN);
        walletService.unlockFunds(wallet.getId(), position.getCollateral());
        walletService.updateBalance(wallet.getId(), realizedPnl);

        marginPositionRepository.save(position);
        log.warn("Margin position {} liquidated at price {}", positionId, liquidationPrice);
    }

    public List<MarginPosition> getUserOpenPositions(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return marginPositionRepository.findAllByUserAndStatus(user, "OPEN");
    }

    public List<MarginPosition> getUserAllPositions(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return marginPositionRepository.findAllByUser(user);
    }
}
