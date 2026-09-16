package com.nextradex.api.dto;

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
    @Builder.Default
    private String tokenType = "Bearer";
    @Builder.Default
    private Boolean needsProfileSetup = false;
}
