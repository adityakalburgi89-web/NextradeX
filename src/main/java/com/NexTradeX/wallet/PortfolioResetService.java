package com.NexTradeX.wallet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.NexTradeX.spot.SpotHoldingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PortfolioResetService {

    private final IWalletService walletService;
    private final SpotHoldingService spotHoldingService;

    @Transactional
    public void reset(Long userId) {
        walletService.resetUserWallets(userId);
        spotHoldingService.resetUserHoldings(userId);
    }
}
