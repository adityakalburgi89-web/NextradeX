package com.NexTradeX.wallet;

import java.math.BigDecimal;

/**
 * Segregated mutation interface for Wallet transactions (ISP).
 */
public interface IWalletTransactionService {
    Wallet updateBalance(Long walletId, BigDecimal amount);
    Wallet lockFunds(Long walletId, BigDecimal amount);
    Wallet unlockFunds(Long walletId, BigDecimal amount);
    Wallet updateUnrealizedPnL(Long walletId, BigDecimal pnl);
    Wallet deposit(Long userId, WalletType walletType, BigDecimal amount);
    void transfer(Long userId, WalletType fromType, WalletType toType, BigDecimal amount);
    Wallet withdraw(Long userId, WalletType walletType, BigDecimal amount);
    void resetUserWallets(Long userId);
}
