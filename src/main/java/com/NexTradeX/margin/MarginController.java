package com.NexTradeX.margin;

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
import com.NexTradeX.dto.MarginOrderRequest;
import com.NexTradeX.dto.OrderResponse;
import com.NexTradeX.order.OrderSide;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/margin")
@RequiredArgsConstructor
public class MarginController {

    private final MarginTradingService marginTradingService;
    private final JwtService jwtService;

    @PostMapping("/open")
    public ResponseEntity<ApiResponse<OrderResponse>> openPosition(
            @Valid @RequestBody MarginOrderRequest request,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            OrderSide side = OrderSide.valueOf(request.getSide().toUpperCase());

            var order = marginTradingService.openMarginPosition(
                    userId, request.getSymbol(), side,
                    request.getQuantity(), request.getLeverage());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(201, "Margin position opened", toOrderResponse(order)));
        } catch (Exception e) {
            log.error("Error opening margin position: {}", e.getMessage());
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
            marginTradingService.closeMarginPosition(positionId, userId);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Margin position closed", null));
        } catch (Exception e) {
            log.error("Error closing margin position: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/positions/open")
    public ResponseEntity<ApiResponse<List<MarginPositionDTO>>> getOpenPositions(
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            List<MarginPosition> positions = marginTradingService.getUserOpenPositions(userId);
            List<MarginPositionDTO> dtos = positions.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Open margin positions retrieved", dtos));
        } catch (Exception e) {
            log.error("Error retrieving open margin positions: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/positions/all")
    public ResponseEntity<ApiResponse<List<MarginPositionDTO>>> getAllPositions(
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            List<MarginPosition> positions = marginTradingService.getUserAllPositions(userId);
            List<MarginPositionDTO> dtos = positions.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "All margin positions retrieved", dtos));
        } catch (Exception e) {
            log.error("Error retrieving all margin positions: {}", e.getMessage());
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

    private MarginPositionDTO toDTO(MarginPosition position) {
        return MarginPositionDTO.builder()
                .id(position.getId())
                .symbol(position.getSymbol())
                .side(position.getSide())
                .status(position.getStatus())
                .quantity(position.getQuantity())
                .entryPrice(position.getEntryPrice())
                .exitPrice(position.getExitPrice())
                .leverage(position.getLeverage())
                .borrowedAmount(position.getBorrowedAmount())
                .collateral(position.getCollateral())
                .interestAccrued(position.getInterestAccrued())
                .interestRate(position.getInterestRate())
                .unrealizedPnL(position.getUnrealizedPnL())
                .realizedPnL(position.getRealizedPnL())
                .marginRatio(position.getMarginRatio())
                .openedAt(position.getOpenedAt())
                .closedAt(position.getClosedAt())
                .build();
    }

    private Long extractUserIdFromAuth(Authentication authentication) {
        return jwtService.extractUserIdFromAuthentication(authentication);
    }
}
