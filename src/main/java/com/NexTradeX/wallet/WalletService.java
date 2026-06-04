package com.NexTradeX.wallet;

import com.NexTradeX.exception.InsufficientBalanceException;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
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
public class WalletService {
    
    private final WalletRepository walletRepository;
    private final UserService userService;
    
    private static final BigDecimal INITIAL_PAPER_CAPITAL = new BigDecimal("100000.00");
    
    public void initializeUserWallets(User user) {
        for (WalletType type : WalletType.values()) {
            if (!walletRepository.existsByUserAndWalletType(user, type)) {
                Wallet wallet = Wallet.builder()
                        .user(user)
                        .walletType(type)
                        .balance(INITIAL_PAPER_CAPITAL)
                        .lockedFunds(BigDecimal.ZERO)
                        .unrealizedPnL(BigDecimal.ZERO)
                        .build();
                walletRepository.save(wallet);
                log.info("Initialized {} wallet for user: {}", type, user.getUsername());
            }
        }
    }
    
    public Wallet getWallet(Long userId, WalletType walletType) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return walletRepository.findByUserAndWalletType(user, walletType)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
    }
    
    public Wallet getWalletById(Long walletId) {
        return walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
    }
    
    public List<Wallet> getUserWallets(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return walletRepository.findAllByUser(user);
    }
    
    public Wallet updateBalance(Long walletId, BigDecimal amount) {
        Wallet wallet = getWalletById(walletId);
        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet updated = walletRepository.save(wallet);
        log.info("Updated wallet {} balance by {}", walletId, amount);
        return updated;
    }
    
    public Wallet lockFunds(Long walletId, BigDecimal amount) {
        Wallet wallet = getWalletById(walletId);
        if (wallet.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient available balance");
        }
        wallet.setLockedFunds(wallet.getLockedFunds().add(amount));
        Wallet updated = walletRepository.save(wallet);
        log.info("Locked {} from wallet {}", amount, walletId);
        return updated;
    }
    
    public Wallet unlockFunds(Long walletId, BigDecimal amount) {
        Wallet wallet = getWalletById(walletId);
        wallet.setLockedFunds(wallet.getLockedFunds().subtract(amount));
        Wallet updated = walletRepository.save(wallet);
        log.info("Unlocked {} from wallet {}", amount, walletId);
        return updated;
    }
    
    public Wallet updateUnrealizedPnL(Long walletId, BigDecimal pnl) {
        Wallet wallet = getWalletById(walletId);
        wallet.setUnrealizedPnL(pnl);
        Wallet updated = walletRepository.save(wallet);
        log.info("Updated unrealized PnL for wallet {} to {}", walletId, pnl);
        return updated;
    }
    
    public boolean hasEnoughBalance(Long walletId, BigDecimal amount) {
        Wallet wallet = getWalletById(walletId);
        return wallet.getAvailableBalance().compareTo(amount) >= 0;
    }

    public void resetUserWallets(Long userId) {
        List<Wallet> wallets = getUserWallets(userId);
        for (Wallet wallet : wallets) {
            wallet.setBalance(INITIAL_PAPER_CAPITAL);
            wallet.setLockedFunds(BigDecimal.ZERO);
            wallet.setUnrealizedPnL(BigDecimal.ZERO);
            walletRepository.save(wallet);
        }
        log.info("Reset all wallets to default balance for user: {}", userId);
    }
}