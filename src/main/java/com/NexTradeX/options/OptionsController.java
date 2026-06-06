package com.NexTradeX.options;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.dto.OptionsBuyRequest;
import com.NexTradeX.dto.OptionsContractResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/options")
@RequiredArgsConstructor
public class OptionsController {
    
    private final OptionsService optionsService;
    private final JwtService jwtService;
    
    @PostMapping("/buy")
    public ResponseEntity<ApiResponse<OptionsContractResponse>> buyOption(
            @RequestBody OptionsBuyRequest request,
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            
            OptionsContract contract = optionsService.buyOption(
                    userId,
                    request.getSymbol(),
                    OptionType.valueOf(request.getOptionType().toUpperCase()),
                    new BigDecimal(request.getStrikePrice()),
                    new BigDecimal(request.getPremium()),
                    new BigDecimal(request.getQuantity()),
                    LocalDateTime.parse(request.getExpiryDate())
            );
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(201, "Option contract created", toResponse(contract)));
        } catch (Exception e) {
            log.error("Error buying option: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @PostMapping("/settle/{contractId}")
    public ResponseEntity<ApiResponse<String>> settleOption(
            @PathVariable Long contractId,
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            optionsService.settleOption(userId, contractId);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Option settled successfully", null));
        } catch (Exception e) {
            log.error("Error settling option: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @GetMapping("/positions")
    public ResponseEntity<ApiResponse<List<OptionsContractResponse>>> getActivePositions(
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            List<OptionsContract> contracts = optionsService.getUserActiveContracts(userId);
            List<OptionsContractResponse> responses = contracts.stream()
                    .map(this::toResponse)
                    .toList();
            
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Active positions retrieved", responses));
        } catch (Exception e) {
            log.error("Error retrieving positions: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @GetMapping("/positions/history")
    public ResponseEntity<ApiResponse<List<OptionsContractResponse>>> getPositionHistory(
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            List<OptionsContract> contracts = optionsService.getUserAllContracts(userId);
            List<OptionsContractResponse> responses = contracts.stream()
                    .map(this::toResponse)
                    .toList();
            
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Position history retrieved", responses));
        } catch (Exception e) {
            log.error("Error retrieving position history: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    private OptionsContractResponse toResponse(OptionsContract contract) {
        return OptionsContractResponse.builder()
                .id(contract.getId())
                .symbol(contract.getSymbol())
                .optionType(contract.getOptionType().name())
                .status(contract.getStatus().name())
                .strikePrice(contract.getStrikePrice().toString())
                .premium(contract.getPremium().toString())
                .quantity(contract.getQuantity().toString())
                .expiryDate(contract.getExpiryDate().toString())
                .settlementPrice(contract.getSettlementPrice() != null ? contract.getSettlementPrice().toString() : null)
                .profitLoss(contract.getProfitLoss() != null ? contract.getProfitLoss().toString() : null)
                .createdAt(contract.getCreatedAt())
                .settledAt(contract.getSettledAt())
                .build();
    }
}
