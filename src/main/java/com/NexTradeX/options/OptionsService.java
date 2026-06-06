package com.NexTradeX.options;

import com.NexTradeX.market.MarketService;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
import com.NexTradeX.wallet.WalletService;
import com.NexTradeX.wallet.WalletType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OptionsService {
    
    private final OptionsContractRepository optionsContractRepository;
    private final UserService userService;
    private final WalletService walletService;
    private final MarketService marketService;
    
    public OptionsContract buyOption(Long userId, String symbol, OptionType optionType,
                                    BigDecimal strikePrice, BigDecimal premium,
                                    BigDecimal quantity, LocalDateTime expiryDate) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        BigDecimal totalCost = premium.multiply(quantity);
        
        // Check balance
        var wallet = walletService.getWallet(userId, WalletType.OPTIONS);
        if (!walletService.hasEnoughBalance(wallet.getId(), totalCost)) {
            throw new RuntimeException("Insufficient balance to buy option");
        }
        
        // Deduct premium from balance
        walletService.updateBalance(wallet.getId(), totalCost.negate());
        
        // Create contract
        OptionsContract contract = OptionsContract.builder()
                .user(user)
                .symbol(symbol)
                .optionType(optionType)
                .strikePrice(strikePrice)
                .premium(premium)
                .quantity(quantity)
                .expiryDate(expiryDate)
                .status(OptionStatus.ACTIVE)
                .build();
        
        OptionsContract saved = optionsContractRepository.save(contract);
        log.info("Options contract created: {} {} {}", symbol, optionType, quantity);
        return saved;
    }
    
    public void settleOption(Long userId, Long contractId) {
        OptionsContract contract = optionsContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        // Authorization: a user may only settle their own contracts (prevents IDOR).
        if (contract.getUser() == null || !contract.getUser().getId().equals(userId)) {
            throw new RuntimeException("Contract not found");
        }

        if (contract.getStatus() != OptionStatus.ACTIVE) {
            throw new RuntimeException("Contract is not active");
        }

        if (LocalDateTime.now().isBefore(contract.getExpiryDate())) {
            throw new RuntimeException("Contract has not expired yet");
        }
        
        BigDecimal currentPrice = marketService.getPrice(contract.getSymbol()).getCurrentPrice();
        contract.setSettlementPrice(currentPrice);
        
        BigDecimal profitLoss = calculateProfitLoss(contract, currentPrice);
        contract.setProfitLoss(profitLoss);
        contract.setStatus(OptionStatus.EXPIRED);
        contract.setSettledAt(LocalDateTime.now());
        
        // Credit account if profitable
        if (profitLoss.compareTo(BigDecimal.ZERO) > 0) {
            walletService.updateBalance(
                    walletService.getWallet(contract.getUser().getId(), WalletType.OPTIONS).getId(),
                    profitLoss
            );
        }
        
        optionsContractRepository.save(contract);
        log.info("Options contract settled: {} PnL: {}", contractId, profitLoss);
    }
    
    private BigDecimal calculateProfitLoss(OptionsContract contract, BigDecimal currentPrice) {
        BigDecimal intrinsicValue = BigDecimal.ZERO;
        
        if (contract.getOptionType() == OptionType.CALL) {
            // Call: profit if current price > strike price
            if (currentPrice.compareTo(contract.getStrikePrice()) > 0) {
                intrinsicValue = currentPrice.subtract(contract.getStrikePrice());
            }
        } else { // PUT
            // Put: profit if current price < strike price
            if (currentPrice.compareTo(contract.getStrikePrice()) < 0) {
                intrinsicValue = contract.getStrikePrice().subtract(currentPrice);
            }
        }
        
        // Total PnL = (intrinsic value - premium paid) * quantity
        return intrinsicValue.subtract(contract.getPremium())
                .multiply(contract.getQuantity());
    }
    
    public List<OptionsContract> getUserActiveContracts(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return optionsContractRepository.findAllByUserAndStatus(user, OptionStatus.ACTIVE);
    }
    
    public List<OptionsContract> getUserAllContracts(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return optionsContractRepository.findAllByUser(user);
    }
}
