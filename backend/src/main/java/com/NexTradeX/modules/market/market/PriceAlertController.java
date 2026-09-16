package com.nextradex.modules.market.market;

import com.nextradex.modules.security.auth.JwtService;
import com.nextradex.shared.common.ApiResponse;
import com.nextradex.modules.user.User;
import com.nextradex.modules.user.UserService;
import com.nextradex.api.dto.PriceAlertResponse;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/market/alerts")
@RequiredArgsConstructor
@Validated
public class PriceAlertController {

    private final PriceAlertRepository priceAlertRepository;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ApiResponse<PriceAlertResponse>> createAlert(
            @RequestParam String symbol,
            @RequestParam @DecimalMin(value = "0.00000001", message = "Price must be greater than zero") @DecimalMax(value = "99999999999.99999999", message = "Price exceeds maximum allowed precision") BigDecimal targetPrice,
            @RequestParam String condition,
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            PriceAlert alert = PriceAlert.builder()
                    .user(user)
                    .symbol(symbol.toUpperCase())
                    .targetPrice(targetPrice)
                    .alertCondition(condition.toUpperCase())
                    .active(true)
                    .build();

            PriceAlert saved = priceAlertRepository.save(alert);
            return ResponseEntity.ok(new ApiResponse<>(200, "Price alert created", toResponse(saved)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, com.nextradex.shared.exception.SafeErrorMessage.forClient(e), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PriceAlertResponse>>> getAlerts(Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<PriceAlertResponse> alerts = priceAlertRepository.findAllByUser(user).stream()
                    .map(this::toResponse)
                    .toList();
            return ResponseEntity.ok(new ApiResponse<>(200, "Price alerts retrieved", alerts));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, com.nextradex.shared.exception.SafeErrorMessage.forClient(e), null));
        }
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @PathVariable Long alertId,
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            PriceAlert alert = priceAlertRepository.findById(alertId).orElse(null);
            if (alert == null || !alert.getUser().getId().equals(userId)) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Price alert not found", null));
            }
            priceAlertRepository.delete(alert);
            return ResponseEntity.ok(new ApiResponse<>(200, "Price alert deleted", null));
        } catch (Exception e) {
            log.error("Error deleting price alert: ", e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "An unexpected error occurred. Please try again later.", null));
        }
    }

    private PriceAlertResponse toResponse(PriceAlert alert) {
        return PriceAlertResponse.builder()
                .id(alert.getId())
                .symbol(alert.getSymbol())
                .targetPrice(alert.getTargetPrice())
                .alertCondition(alert.getAlertCondition())
                .active(alert.isActive())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
