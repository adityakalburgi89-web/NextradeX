package com.NexTradeX.futures;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.dto.FuturesOrderRequest;
import com.NexTradeX.dto.OrderResponse;
import com.NexTradeX.dto.SlTpUpdateRequest;
import com.NexTradeX.order.OrderSide;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/futures")
@RequiredArgsConstructor
public class FuturesController {
    
    private final FuturesTradingService futuresTradingService;
    private final JwtService jwtService;
    
    @PostMapping("/open")
    public ResponseEntity<ApiResponse<OrderResponse>> openPosition(
            @Valid @RequestBody FuturesOrderRequest request,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            OrderSide side = OrderSide.valueOf(request.getSide().toUpperCase());
            
            var order = futuresTradingService.openFuturesPosition(
                    userId, request.getSymbol(), side, 
                    request.getQuantity(), request.getLeverage());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(201, "Futures position opened", toOrderResponse(order)));
        } catch (Exception e) {
            log.error("Error opening futures position: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @GetMapping("/positions/open")
    public ResponseEntity<ApiResponse<List<FuturesPositionDTO>>> getOpenPositions(
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            List<FuturesPosition> positions = futuresTradingService.getUserOpenPositions(userId);
            List<FuturesPositionDTO> dtos = positions.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Open positions retrieved", dtos));
        } catch (Exception e) {
            log.error("Error retrieving open positions: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/close/{positionId}")
    public ResponseEntity<ApiResponse<Void>> closePosition(
            @PathVariable Long positionId,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            futuresTradingService.closeFuturesPosition(positionId, userId);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Futures position closed successfully", null));
        } catch (Exception e) {
            log.error("Error closing futures position: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/update-sl-tp/{positionId}")
    public ResponseEntity<ApiResponse<FuturesPositionDTO>> updateSlTp(
            @PathVariable Long positionId,
            @Valid @RequestBody SlTpUpdateRequest request,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            FuturesPosition updatedPosition = futuresTradingService.updateSlTp(
                    positionId, userId, request.getStopLoss(), request.getTakeProfit());
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Stop Loss and Take Profit updated", toDTO(updatedPosition)));
        } catch (Exception e) {
            log.error("Error updating SL/TP for position: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    private OrderResponse toOrderResponse(com.NexTradeX.order.Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .symbol(order.getSymbol())
                .side(order.getSide().name())
                .status(order.getStatus().name())
                .quantity(order.getQuantity())
                .price(order.getPrice())
                .leverage(order.getLeverage())
                .build();
    }
    
    private FuturesPositionDTO toDTO(FuturesPosition position) {
        return FuturesPositionDTO.builder()
                .id(position.getId())
                .symbol(position.getSymbol())
                .positionMode(position.getPositionMode().name())
                .quantity(position.getQuantity())
                .entryPrice(position.getEntryPrice())
                .markPrice(position.getMarkPrice())
                .unrealizedPnL(position.getUnrealizedPnL())
                .leverage(position.getLeverage())
                .collateral(position.getCollateral())
                .marginRatio(position.getMarginRatio())
                .stopLoss(position.getStopLoss())
                .takeProfit(position.getTakeProfit())
                .remarks(position.getRemarks())
                .build();
    }
    
    private Long extractUserIdFromAuth(Authentication authentication) {
        return jwtService.extractUserIdFromAuthentication(authentication);
    }
}
