package com.nextradex.modules.trading.spot;

import com.nextradex.shared.exception.InsufficientBalanceException;
import com.nextradex.shared.exception.InvalidOrderException;
import com.nextradex.shared.exception.OrderNotFoundException;
import com.nextradex.modules.market.market.IMarketService;
import com.nextradex.modules.trading.order.*;
import com.nextradex.modules.user.User;
import com.nextradex.modules.user.IUserService;
import com.nextradex.modules.wallet.IWalletService;
import com.nextradex.modules.wallet.WalletType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SpotTradingService {
    
    private final SpotTradeRepository spotTradeRepository;
    private final IOrderService orderService;
    private final OrderRepository orderRepository;
    private final IUserService userService;
    private final IWalletService walletService;
    private final IMarketService marketService;
    private final SpotHoldingService spotHoldingService;
    
    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.001"); // 0.1%
    
    public Order createSpotOrder(Long userId, String symbol, OrderSide side,
                                 OrderType orderType, BigDecimal quantity, BigDecimal price, BigDecimal stopPrice) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOrderException("Quantity must be greater than zero");
        }

        if (symbol.toUpperCase().startsWith("BTC") && quantity.compareTo(new BigDecimal("11")) > 0) {
            throw new InvalidOrderException("Quantity cannot exceed 11 BTC for BTC trading");
        }
        
        // For market orders, get current price
        BigDecimal executionPrice = price;
        if (orderType == OrderType.MARKET) {
            executionPrice = marketService.getPrice(symbol).getCurrentPrice();
        } else if (orderType == OrderType.LIMIT && (price == null || price.compareTo(BigDecimal.ZERO) <= 0)) {
            throw new InvalidOrderException("Price must be specified for limit orders");
        }

        if ((orderType == OrderType.STOP_LIMIT || orderType == OrderType.STOP_MARKET ||
             orderType == OrderType.TAKE_PROFIT_LIMIT || orderType == OrderType.TAKE_PROFIT_MARKET) && 
            (stopPrice == null || stopPrice.compareTo(BigDecimal.ZERO) <= 0)) {
            throw new InvalidOrderException("Stop/Trigger price must be specified for Stop/Take-Profit orders");
        }

        BigDecimal checkPrice = executionPrice;
        if (checkPrice == null) {
            checkPrice = stopPrice != null ? stopPrice : marketService.getPrice(symbol).getCurrentPrice();
        }
        BigDecimal totalCost = checkPrice.multiply(quantity);
        if (totalCost.compareTo(new BigDecimal("99999999999.99999999")) > 0) {
            throw new InvalidOrderException("Total order value exceeds maximum allowed precision");
        }
        
        Order order = Order.builder()
                .user(user)
                .symbol(symbol)
                .side(side)
                .orderType(orderType)
                .quantity(quantity)
                .price(executionPrice)
                .stopPrice(stopPrice)
                .status(OrderStatus.OPEN)
                .tradeType(TradeType.SPOT)
                .leverage(BigDecimal.ONE)
                .build();
        
        Order savedOrder = orderRepository.save(order);
        
        // For market orders, execute immediately
        if (orderType == OrderType.MARKET) {
            executeSpotOrder(savedOrder.getId(), userId);
        }
        
        log.info("Spot order created for user {}: {} {} {}", userId, symbol, side, quantity);
        return savedOrder;
    }
    
    @Transactional(noRollbackFor = InsufficientBalanceException.class)
    public void executeSpotOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new OrderNotFoundException("Order not found");
        }
        
        if (order.getStatus() != OrderStatus.OPEN) {
            throw new InvalidOrderException("Order is not open");
        }
        
        BigDecimal executionPrice = order.getPrice();
        if (executionPrice == null || order.getOrderType() == OrderType.STOP_MARKET || order.getOrderType() == OrderType.TAKE_PROFIT_MARKET) {
            executionPrice = marketService.getPrice(order.getSymbol()).getCurrentPrice();
            order.setPrice(executionPrice);
        }
        BigDecimal totalCost = executionPrice.multiply(order.getQuantity());
        BigDecimal commission = totalCost.multiply(COMMISSION_RATE);
        BigDecimal totalWithCommission = totalCost.add(commission);
        String baseAsset = extractBaseAsset(order.getSymbol());
        
        // Get wallet
        var wallet = walletService.getWallet(userId, WalletType.SPOT);
        
        if (order.getSide() == OrderSide.BUY) {
            // Check balance
            if (!walletService.hasEnoughBalance(wallet.getId(), totalWithCommission)) {
                order.setStatus(OrderStatus.REJECTED);
                order.setRemarks("Insufficient balance");
                orderRepository.save(order);
                throw new InsufficientBalanceException("Insufficient balance for purchase");
            }
            
            // Deduct from balance
            walletService.updateBalance(wallet.getId(), totalWithCommission.negate());
            spotHoldingService.recordPurchase(order.getUser(), baseAsset, order.getQuantity(), executionPrice);
        } else { // SELL
            try {
                spotHoldingService.recordSale(order.getUser(), baseAsset, order.getQuantity());
            } catch (InsufficientBalanceException exception) {
                order.setStatus(OrderStatus.REJECTED);
                order.setRemarks(exception.getMessage());
                orderRepository.save(order);
                throw exception;
            }

            // Add to balance after commission
            BigDecimal netProceeds = totalCost.subtract(commission);
            walletService.updateBalance(wallet.getId(), netProceeds);
        }
        
        // Fill order
        orderService.fillOrder(orderId, order.getQuantity(), executionPrice);
        
        // Record trade
        SpotTrade trade = SpotTrade.builder()
                .user(order.getUser())
                .symbol(order.getSymbol())
                .side(order.getSide().name())
                .quantity(order.getQuantity())
                .executionPrice(executionPrice)
                .totalValue(totalCost)
                .commission(commission)
                .build();
        
        spotTradeRepository.save(trade);
        log.info("Spot order executed: {} {} {}", order.getSymbol(), order.getSide(), order.getQuantity());
    }
    
    public List<SpotTrade> getUserSpotTrades(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return spotTradeRepository.findAllByUser(user);
    }
    
    public List<SpotTrade> getUserSpotTradesBySymbol(Long userId, String symbol) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return spotTradeRepository.findAllByUserAndSymbol(user, symbol);
    }

    private String extractBaseAsset(String symbol) {
        String normalized = symbol == null ? "" : symbol.trim().toUpperCase();
        for (String quoteAsset : List.of("USDT", "USDC", "BUSD")) {
            if (normalized.endsWith(quoteAsset) && normalized.length() > quoteAsset.length()) {
                return normalized.substring(0, normalized.length() - quoteAsset.length());
            }
        }
        throw new InvalidOrderException("Unsupported spot symbol: " + symbol);
    }
}
