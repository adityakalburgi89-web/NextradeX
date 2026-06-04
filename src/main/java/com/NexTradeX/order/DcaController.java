package com.NexTradeX.order;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/orders/dca")
@RequiredArgsConstructor
public class DcaController {

    private final DcaScheduleRepository dcaScheduleRepository;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ApiResponse<DcaSchedule>> createDcaSchedule(
            @RequestParam String symbol,
            @RequestParam BigDecimal amountUSDT,
            @RequestParam int frequencySeconds,
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            DcaSchedule schedule = DcaSchedule.builder()
                    .user(user)
                    .symbol(symbol.toUpperCase())
                    .amountUSDT(amountUSDT)
                    .frequencySeconds(frequencySeconds)
                    .active(true)
                    .nextRunTime(LocalDateTime.now().plusSeconds(frequencySeconds))
                    .createdAt(LocalDateTime.now())
                    .build();

            DcaSchedule saved = dcaScheduleRepository.save(schedule);
            return ResponseEntity.ok(new ApiResponse<>(200, "DCA schedule successfully created", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DcaSchedule>>> getDcaSchedules(Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<DcaSchedule> schedules = dcaScheduleRepository.findAllByUser(user);
            return ResponseEntity.ok(new ApiResponse<>(200, "DCA schedules retrieved", schedules));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/{scheduleId}/toggle")
    public ResponseEntity<ApiResponse<DcaSchedule>> toggleDcaSchedule(
            @PathVariable Long scheduleId,
            Authentication authentication) {
        try {
            DcaSchedule schedule = dcaScheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new RuntimeException("DCA schedule not found"));

            schedule.setActive(!schedule.isActive());
            if (schedule.isActive()) {
                schedule.setNextRunTime(LocalDateTime.now().plusSeconds(schedule.getFrequencySeconds()));
            }
            DcaSchedule saved = dcaScheduleRepository.save(schedule);
            return ResponseEntity.ok(new ApiResponse<>(200, "DCA schedule status updated", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}
