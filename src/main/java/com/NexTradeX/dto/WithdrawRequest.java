package com.NexTradeX.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequest {
    @NotBlank(message = "Wallet type is required")
    private String walletType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @DecimalMax(value = "99999999999.99999999", message = "Amount exceeds maximum allowed precision")
    private BigDecimal amount;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Network is required")
    private String network;
}
