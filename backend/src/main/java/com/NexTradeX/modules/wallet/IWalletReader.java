package com.nextradex.modules.wallet;

import java.math.BigDecimal;
import java.util.List;

/**
 * Segregated read-only interface for Wallet queries (ISP).
 */
public interface IWalletReader {
    Wallet getWallet(Long userId, WalletType walletType);
    Wallet getWalletById(Long walletId);
    List<Wallet> getUserWallets(Long userId);
    boolean hasEnoughBalance(Long walletId, BigDecimal amount);
}
