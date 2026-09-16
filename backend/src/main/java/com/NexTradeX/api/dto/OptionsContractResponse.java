package com.nextradex.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionsContractResponse {
    private Long id;
    private String symbol;
    private String optionType;
    private String status;
    private String strikePrice;
    private String premium;
    private String quantity;
    private String expiryDate;
    private String settlementPrice;
    private String profitLoss;
    private LocalDateTime createdAt;
    private LocalDateTime settledAt;
}
