package com.NexTradeX.wallet;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.dto.WalletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
public class WalletController {
    
    private final WalletService walletService;
    private final JwtService jwtService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getUserWallets(
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            
            List<Wallet> wallets = walletService.getUserWallets(userId);
            List<WalletResponse> responses = wallets.stream()
                    .map(this::toWalletResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Wallets retrieved", responses));
        } catch (Exception e) {
            log.error("Error retrieving wallets: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    @GetMapping("/{walletType}")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @PathVariable String walletType,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            WalletType type = WalletType.valueOf(walletType.toUpperCase());
            
            Wallet wallet = walletService.getWallet(userId, type);
            
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Wallet retrieved", toWalletResponse(wallet)));
        } catch (Exception e) {
            log.error("Error retrieving wallet: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
    
    private WalletResponse toWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .walletType(wallet.getWalletType().name())
                .balance(wallet.getBalance())
                .lockedFunds(wallet.getLockedFunds())
                .availableBalance(wallet.getAvailableBalance())
                .unrealizedPnL(wallet.getUnrealizedPnL())
                .build();
    }
    
    private Long extractUserIdFromAuth(Authentication authentication) {
        return jwtService.extractUserIdFromAuthentication(authentication);
    }
}
