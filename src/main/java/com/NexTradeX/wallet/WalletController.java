package com.NexTradeX.wallet;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.dto.WalletResponse;
import com.NexTradeX.dto.DepositRequest;
import com.NexTradeX.dto.TransferRequest;
import com.NexTradeX.dto.WithdrawRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import com.NexTradeX.auth.IJwtService;

@Slf4j
@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
public class WalletController {
    
    private final IWalletService walletService;
    private final IJwtService jwtService;
    
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
    
    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<WalletResponse>> deposit(
            @Valid @RequestBody DepositRequest request,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            WalletType type = WalletType.valueOf(request.getWalletType().toUpperCase());
            Wallet wallet = walletService.deposit(userId, type, request.getAmount());
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Deposit successful", toWalletResponse(wallet)));
        } catch (Exception e) {
            log.error("Error performing deposit: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<Void>> transfer(
            @Valid @RequestBody TransferRequest request,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            WalletType from = WalletType.valueOf(request.getFromWalletType().toUpperCase());
            WalletType to = WalletType.valueOf(request.getToWalletType().toUpperCase());
            walletService.transfer(userId, from, to, request.getAmount());
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Transfer completed successfully", null));
        } catch (Exception e) {
            log.error("Error performing transfer: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<WalletResponse>> withdraw(
            @Valid @RequestBody WithdrawRequest request,
            Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            WalletType type = WalletType.valueOf(request.getWalletType().toUpperCase());
            Wallet wallet = walletService.withdraw(userId, type, request.getAmount());
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Withdrawal successful", toWalletResponse(wallet)));
        } catch (Exception e) {
            log.error("Error performing withdrawal: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Void>> resetWallets(Authentication authentication) {
        try {
            Long userId = extractUserIdFromAuth(authentication);
            walletService.resetUserWallets(userId);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Wallets successfully reset to default simulated capital", null));
        } catch (Exception e) {
            log.error("Error resetting wallets: {}", e.getMessage());
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
