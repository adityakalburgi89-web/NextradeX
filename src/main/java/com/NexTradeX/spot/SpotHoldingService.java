package com.NexTradeX.spot;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.NexTradeX.exception.InsufficientBalanceException;
import com.NexTradeX.user.IUserService;
import com.NexTradeX.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SpotHoldingService {

    private final SpotHoldingRepository holdingRepository;
    private final IUserService userService;

    @Transactional
    public SpotHolding recordPurchase(User user, String asset, BigDecimal quantity, BigDecimal unitPrice) {
        SpotHolding holding = holdingRepository.findByUserAndAssetForUpdate(user, asset)
                .orElseGet(() -> SpotHolding.create(user, asset));
        holding.recordPurchase(quantity, unitPrice);
        return holdingRepository.save(holding);
    }

    @Transactional
    public SpotHolding recordSale(User user, String asset, BigDecimal quantity) {
        SpotHolding holding = holdingRepository.findByUserAndAssetForUpdate(user, asset)
                .orElseThrow(() -> new InsufficientBalanceException("No " + asset + " holding is available"));
        if (holding.getQuantity().compareTo(quantity) < 0) {
            throw new InsufficientBalanceException("Insufficient " + asset + " quantity");
        }
        holding.recordSale(quantity);
        return holdingRepository.save(holding);
    }

    @Transactional(readOnly = true)
    public List<SpotHoldingResponse> getUserHoldings(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return holdingRepository.findAllByUserOrderByAsset(user).stream()
                .filter(holding -> holding.getQuantity().compareTo(BigDecimal.ZERO) > 0)
                .map(SpotHoldingResponse::from)
                .toList();
    }

    @Transactional
    public void resetUserHoldings(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        holdingRepository.deleteAllByUser(user);
    }
}
