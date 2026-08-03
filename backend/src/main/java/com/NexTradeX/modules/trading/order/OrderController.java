package com.nextradex.modules.trading.order;

import com.nextradex.modules.security.auth.JwtService;
import com.nextradex.shared.common.ApiResponse;
import com.nextradex.api.dto.OrderResponse;
import com.nextradex.api.dto.SpotOrderRequest;
import com.nextradex.modules.trading.spot.SpotTradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    private final SpotTradingService spotTradingService;
    private final JwtService jwtService;
    
    @PostMapping("/spot")
    public ResponseEntity<ApiResponse<OrderResponse>> createSpotOrder(
            @Valid @RequestBody SpotOrderRequest request,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            OrderSide side = OrderSide.valueOf(request.getSide().toUpperCase());
            OrderType orderType = OrderType.valueOf(request.getOrderType().toUpperCase());
            
            Order order = spotTradingService.createSpotOrder(
                    userId, request.getSymbol(), side, orderType, 
                    request.getQuantity(), request.getPrice(), request.getStopPrice());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(201, "Order created", toOrderResponse(order)));
        } catch (Exception e) {
            log.error("Error creating spot order: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveOrders(
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            List<Order> orders = orderService.getActiveOrders(userId);
            List<OrderResponse> responses = orders.stream()
                    .map(this::toOrderResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Active orders retrieved", responses));
        } catch (Exception e) {
            log.error("Error retrieving active orders: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            List<Order> orders = orderService.getOrderHistory(userId);
            List<OrderResponse> responses = orders.stream()
                    .map(this::toOrderResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Order history retrieved", responses));
        } catch (Exception e) {
            log.error("Error retrieving order history: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            Order order = orderService.cancelOrder(orderId, userId);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Order cancelled", toOrderResponse(order)));
        } catch (Exception e) {
            log.error("Error cancelling order: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    private OrderResponse toOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .symbol(order.getSymbol())
                .side(order.getSide().name())
                .orderType(order.getOrderType().name())
                .status(order.getStatus().name())
                .tradeType(order.getTradeType().name())
                .quantity(order.getQuantity())
                .price(order.getPrice())
                .filledQuantity(order.getFilledQuantity())
                .averagePrice(order.getAveragePrice())
                .commission(order.getCommission())
                .leverage(order.getLeverage())
                .createdAt(order.getCreatedAt())
                .filledAt(order.getFilledAt())
                .remarks(order.getRemarks())
                .build();
    }
    
    private Long extractUserIdFromAuth(Authentication authentication) {
        return jwtService.extractUserIdFromAuthentication(authentication);
    }
}
