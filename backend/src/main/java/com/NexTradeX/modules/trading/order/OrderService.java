package com.nextradex.modules.trading.order;

import com.nextradex.shared.exception.InvalidOrderException;
import com.nextradex.shared.exception.OrderNotFoundException;
import com.nextradex.modules.user.IUserService;
import com.nextradex.modules.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService implements IOrderService {
    
    private final OrderRepository orderRepository;
    private final IUserService userService;
    
    public Order createOrder(Long userId, String symbol, OrderSide side, 
                            OrderType orderType, BigDecimal quantity, 
                            BigDecimal price, BigDecimal stopPrice, TradeType tradeType, BigDecimal leverage) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOrderException("Quantity must be greater than zero");
        }
        
        if (orderType == OrderType.LIMIT && (price == null || price.compareTo(BigDecimal.ZERO) <= 0)) {
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
                .price(price)
                .stopPrice(stopPrice)
                .status(OrderStatus.OPEN)
                .tradeType(tradeType)
                .leverage(leverage != null ? leverage : BigDecimal.ONE)
                .build();
        
        Order savedOrder = orderRepository.save(order);
        log.info("Order created: {} {} {} {} {}", symbol, side, orderType, quantity, tradeType);
        return savedOrder;
    }
    
    public Order fillOrder(Long orderId, BigDecimal filledQuantity, BigDecimal filledPrice) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REJECTED) {
            throw new InvalidOrderException("Cannot fill cancelled or rejected order");
        }
        
        if (filledQuantity == null || filledQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOrderException("Filled quantity must be greater than zero");
        }
        if (filledPrice == null || filledPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOrderException("Filled price must be greater than zero");
        }

        BigDecimal previouslyFilled = order.getFilledQuantity();
        BigDecimal totalFilled = previouslyFilled.add(filledQuantity);
        
        if (totalFilled.compareTo(order.getQuantity()) > 0) {
            throw new InvalidOrderException("Filled quantity exceeds order quantity");
        }
        
        BigDecimal totalCost = order.getAveragePrice().multiply(previouslyFilled)
                .add(filledPrice.multiply(filledQuantity));
        order.setFilledQuantity(totalFilled);
        order.setAveragePrice(totalCost.divide(totalFilled, 8, java.math.RoundingMode.HALF_UP));
        
        if (totalFilled.compareTo(order.getQuantity()) == 0) {
            order.setStatus(OrderStatus.FILLED);
            order.setFilledAt(LocalDateTime.now());
        } else {
            order.setStatus(OrderStatus.PARTIALLY_FILLED);
        }
        
        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} filled: {} out of {}", orderId, filledQuantity, order.getQuantity());
        return updatedOrder;
    }
    
    public Order cancelOrder(Long orderId, Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if (order.getStatus() != OrderStatus.OPEN && order.getStatus() != OrderStatus.PARTIALLY_FILLED) {
            throw new InvalidOrderException("Only open or partially filled orders can be cancelled");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} cancelled", orderId);
        return updatedOrder;
    }
    
    public Order getOrder(Long orderId, Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));
    }
    
    public List<Order> getActiveOrders(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findActiveOrdersByUser(user);
    }
    
    public List<Order> getOrderHistory(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findAllByUser(user);
    }
    
    public List<Order> getOrdersBySymbol(Long userId, String symbol) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findAllByUserAndSymbol(user, symbol);
    }
}
