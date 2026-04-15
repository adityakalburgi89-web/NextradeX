package com.NexTradeX.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private Long expiresIn;
    private String tokenType = "Bearer";
    private Boolean needsProfileSetup = false;
}
