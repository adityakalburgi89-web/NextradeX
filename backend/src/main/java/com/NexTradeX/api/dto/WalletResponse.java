package com.nextradex.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletResponse {
    private Long id;
    private String walletType;
    private BigDecimal balance;
    private BigDecimal lockedFunds;
    private BigDecimal availableBalance;
    private BigDecimal unrealizedPnL;
}
