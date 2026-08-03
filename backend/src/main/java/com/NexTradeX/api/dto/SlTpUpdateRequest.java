package com.nextradex.api.dto;

import jakarta.validation.constraints.DecimalMax;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlTpUpdateRequest {
    @DecimalMax(value = "99999999999.99999999", message = "Stop loss price exceeds maximum allowable digits")
    private BigDecimal stopLoss;

    @DecimalMax(value = "99999999999.99999999", message = "Take profit price exceeds maximum allowable digits")
    private BigDecimal takeProfit;
}
