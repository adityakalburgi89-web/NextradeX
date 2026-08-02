package com.NexTradeX.wallet;

import com.NexTradeX.user.User;

/**
 * Composite contract for complete Wallet Service operations.
 */
public interface IWalletService extends IWalletReader, IWalletTransactionService {
    void initializeUserWallets(User user);
}
