package com.NexTradeX.market;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class TechnicalAnalysisService {

    public String mapToBinanceInterval(String interval) {
        if (interval == null || interval.isBlank()) {
            return "1h";
        }
        String clean = interval.trim().toLowerCase();
        return switch (clean) {
            case "1m" -> "1m";
            case "5m" -> "5m";
            case "15m" -> "15m";
            case "30m" -> "30m";
            case "1h" -> "1h";
            case "4h" -> "4h";
            case "1d" -> "1d";
            case "1w" -> "1w";
            default -> "1h";
        };
    }

    public long getIntervalSeconds(String interval) {
        if (interval == null || interval.isBlank()) return 3600;
        return switch (interval.trim().toLowerCase()) {
            case "1m" -> 60;
            case "5m" -> 300;
            case "15m" -> 900;
            case "30m" -> 1800;
            case "1h", "60m" -> 3600;
            case "4h" -> 14400;
            case "1d" -> 86400;
            case "1w" -> 604800;
            default -> 3600;
        };
    }

    public int resolveIntervalMinutes(String interval) {
        if (interval == null || interval.isBlank()) {
            return 60;
        }
        return switch (interval.trim().toLowerCase()) {
            case "5m" -> 5;
            case "15m" -> 15;
            case "30m" -> 30;
            case "4h" -> 240;
            case "1d" -> 1440;
            default -> 60;
        };
    }
}
