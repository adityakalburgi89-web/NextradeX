package com.nextradex.modules.trading.order;

import com.nextradex.modules.market.market.IMarketService;
import com.nextradex.modules.trading.spot.SpotTradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DcaSchedulerService {

    private final DcaScheduleRepository dcaScheduleRepository;
    private final SpotTradingService spotTradingService;
    private final IMarketService marketService;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processDcaSchedules() {
        LocalDateTime now = LocalDateTime.now();
        List<DcaSchedule> schedules = dcaScheduleRepository.findByActiveTrueAndNextRunTimeBefore(now);
        if (schedules.isEmpty()) {
            return;
        }

        log.info("Processing {} active DCA schedules", schedules.size());
        for (DcaSchedule schedule : schedules) {
            try {
                BigDecimal currentPrice = marketService.getPrice(schedule.getSymbol()).getCurrentPrice();
                BigDecimal quantity = schedule.getAmountUSDT().divide(currentPrice, 8, RoundingMode.HALF_UP);

                // Execute the buy spot order automatically!
                spotTradingService.createSpotOrder(
                        schedule.getUser().getId(),
                        schedule.getSymbol(),
                        OrderSide.BUY,
                        OrderType.MARKET,
                        quantity,
                        currentPrice,
                        null
                );

                // Update next run time
                schedule.setNextRunTime(now.plusSeconds(schedule.getFrequencySeconds()));
                dcaScheduleRepository.save(schedule);
                log.info("DCA Spot Buy executed: User {} bought {} value of {} at price {}", 
                        schedule.getUser().getId(), schedule.getAmountUSDT(), schedule.getSymbol(), currentPrice);
            } catch (Exception e) {
                log.error("Failed to execute DCA for schedule {}: {}", schedule.getId(), e.getMessage());
                // Set next run time anyway to avoid blocking the queue
                schedule.setNextRunTime(now.plusSeconds(schedule.getFrequencySeconds()));
                dcaScheduleRepository.save(schedule);
            }
        }
    }
}
