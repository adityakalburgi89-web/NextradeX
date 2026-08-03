package com.nextradex.modules.wallet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextradex.modules.trading.spot.SpotHoldingService;

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
