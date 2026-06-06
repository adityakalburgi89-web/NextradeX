package com.NexTradeX.spot;

import com.NexTradeX.exception.InsufficientBalanceException;
import com.NexTradeX.exception.InvalidOrderException;
import com.NexTradeX.market.MarketService;
import com.NexTradeX.order.*;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
import com.NexTradeX.wallet.WalletService;
import com.NexTradeX.wallet.WalletType;
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
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final WalletService walletService;
    private final MarketService marketService;
    
    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.001"); // 0.1%
    
    public Order createSpotOrder(Long userId, String symbol, OrderSide side,
                                 OrderType orderType, BigDecimal quantity, BigDecimal price, BigDecimal stopPrice) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOrderException("Quantity must be greater than zero");
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
    
    @Transactional
    public void executeSpotOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != OrderStatus.OPEN) {
            throw new InvalidOrderException("Order is not open");
        }

        // Market-type triggered orders (STOP_MARKET / TAKE_PROFIT_MARKET) carry no
        // limit price, so resolve the live market price at execution time. This also
        // guards against a null/zero stored price which previously caused a NPE on
        // BigDecimal.multiply during scheduled order matching.
        BigDecimal executionPrice = order.getPrice();
        if (executionPrice == null || executionPrice.compareTo(BigDecimal.ZERO) <= 0) {
            var marketPrice = marketService.getPrice(order.getSymbol());
            executionPrice = marketPrice != null ? marketPrice.getCurrentPrice() : null;
        }
        if (executionPrice == null || executionPrice.compareTo(BigDecimal.ZERO) <= 0) {
            order.setStatus(OrderStatus.REJECTED);
            order.setRemarks("No valid market price available for execution");
            orderRepository.save(order);
            throw new InvalidOrderException("No valid market price available for execution");
        }

        BigDecimal totalCost = executionPrice.multiply(order.getQuantity());
        BigDecimal commission = totalCost.multiply(COMMISSION_RATE);
        BigDecimal totalWithCommission = totalCost.add(commission);
        
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
        } else { // SELL
            // Check balance
            if (!walletService.hasEnoughBalance(wallet.getId(), order.getQuantity())) {
                order.setStatus(OrderStatus.REJECTED);
                order.setRemarks("Insufficient quantity");
                orderRepository.save(order);
                throw new InsufficientBalanceException("Insufficient quantity for sale");
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
}