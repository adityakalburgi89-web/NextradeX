package com.NexTradeX.wallet;

import com.NexTradeX.exception.InsufficientBalanceException;
import com.NexTradeX.user.IUserService;
import com.NexTradeX.user.User;
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
public class WalletService implements IWalletService {
    
    private final WalletRepository walletRepository;
    private final IUserService userService;
    
    private static final BigDecimal INITIAL_PAPER_CAPITAL = BigDecimal.ZERO;
    
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
                .orElseGet(() -> {
                    initializeUserWallets(user);
                    return walletRepository.findByUserAndWalletType(user, walletType)
                            .orElseThrow(() -> new RuntimeException("Wallet not found even after initialization"));
                });
    }
    
    public Wallet getWalletById(Long walletId) {
        return walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
    }
    
    public List<Wallet> getUserWallets(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Wallet> wallets = walletRepository.findAllByUser(user);
        if (wallets.isEmpty()) {
            initializeUserWallets(user);
            wallets = walletRepository.findAllByUser(user);
        }
        return wallets;
    }
    
    public Wallet updateBalance(Long walletId, BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Balance adjustment is required");
        }
        Wallet wallet = getWalletForUpdate(walletId);
        BigDecimal nextBalance = wallet.getBalance().add(amount);
        if (nextBalance.compareTo(wallet.getLockedFunds()) < 0) {
            throw new InsufficientBalanceException("Balance adjustment would consume locked funds");
        }
        wallet.setBalance(nextBalance);
        Wallet updated = walletRepository.save(wallet);
        log.info("Updated wallet {} balance by {}", walletId, amount);
        return updated;
    }
    
    public Wallet lockFunds(Long walletId, BigDecimal amount) {
        requirePositive(amount, "Lock amount");
        Wallet wallet = getWalletForUpdate(walletId);
        if (wallet.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient available balance");
        }
        wallet.setLockedFunds(wallet.getLockedFunds().add(amount));
        Wallet updated = walletRepository.save(wallet);
        log.info("Locked {} from wallet {}", amount, walletId);
        return updated;
    }
    
    public Wallet unlockFunds(Long walletId, BigDecimal amount) {
        requirePositive(amount, "Unlock amount");
        Wallet wallet = getWalletForUpdate(walletId);
        if (wallet.getLockedFunds().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Cannot unlock more than the locked amount");
        }
        wallet.setLockedFunds(wallet.getLockedFunds().subtract(amount));
        Wallet updated = walletRepository.save(wallet);
        log.info("Unlocked {} from wallet {}", amount, walletId);
        return updated;
    }
    
    public Wallet updateUnrealizedPnL(Long walletId, BigDecimal pnl) {
        Wallet wallet = getWalletForUpdate(walletId);
        wallet.setUnrealizedPnL(pnl);
        Wallet updated = walletRepository.save(wallet);
        log.info("Updated unrealized PnL for wallet {} to {}", walletId, pnl);
        return updated;
    }
    
    public boolean hasEnoughBalance(Long walletId, BigDecimal amount) {
        Wallet wallet = getWalletById(walletId);
        return wallet.getAvailableBalance().compareTo(amount) >= 0;
    }

    public Wallet deposit(Long userId, WalletType walletType, BigDecimal amount) {
        requirePositive(amount, "Deposit amount");
        Wallet wallet = getWalletForUpdate(getWallet(userId, walletType).getId());
        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet saved = walletRepository.save(wallet);
        log.info("Deposited {} into wallet {} for user: {}", amount, walletType, userId);
        return saved;
    }

    public void transfer(Long userId, WalletType fromType, WalletType toType, BigDecimal amount) {
        requirePositive(amount, "Transfer amount");
        if (fromType == toType) {
            throw new IllegalArgumentException("Source and target wallets must be different");
        }
        
        Wallet fromWalletRef = getWallet(userId, fromType);
        Wallet toWalletRef = getWallet(userId, toType);
        Long firstId = Math.min(fromWalletRef.getId(), toWalletRef.getId());
        Long secondId = Math.max(fromWalletRef.getId(), toWalletRef.getId());
        Wallet first = getWalletForUpdate(firstId);
        Wallet second = getWalletForUpdate(secondId);
        Wallet fromWallet = fromWalletRef.getId().equals(firstId) ? first : second;
        Wallet toWallet = toWalletRef.getId().equals(firstId) ? first : second;
        if (fromWallet.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient available balance in " + fromType + " wallet");
        }
        
        fromWallet.setBalance(fromWallet.getBalance().subtract(amount));
        toWallet.setBalance(toWallet.getBalance().add(amount));
        
        walletRepository.save(fromWallet);
        walletRepository.save(toWallet);
        log.info("Transferred {} from {} to {} for user: {}", amount, fromType, toType, userId);
    }
    
    public Wallet withdraw(Long userId, WalletType walletType, BigDecimal amount) {
        requirePositive(amount, "Withdrawal amount");
        
        Wallet wallet = getWalletForUpdate(getWallet(userId, walletType).getId());
        if (wallet.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient available balance in " + walletType + " wallet");
        }
        
        wallet.setBalance(wallet.getBalance().subtract(amount));
        Wallet saved = walletRepository.save(wallet);
        log.info("Withdrew {} from wallet {} for user: {}", amount, walletType, userId);
        return saved;
    }

    public void resetUserWallets(Long userId) {
        List<Wallet> wallets = getUserWallets(userId);
        for (Wallet walletRef : wallets) {
            Wallet wallet = getWalletForUpdate(walletRef.getId());
            wallet.setBalance(INITIAL_PAPER_CAPITAL);
            wallet.setLockedFunds(BigDecimal.ZERO);
            wallet.setUnrealizedPnL(BigDecimal.ZERO);
            walletRepository.save(wallet);
        }
        log.info("Reset all wallets to default balance for user: {}", userId);
    }

    private Wallet getWalletForUpdate(Long walletId) {
        return walletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
    }

    private void requirePositive(BigDecimal amount, String fieldName) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }
}
