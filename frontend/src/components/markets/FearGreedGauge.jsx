import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { formatCurrency } from "../../lib/utils";

/**
 * Visitors White Engineering Blueprint Fear & Greed Index Component with Segmented Speedometer Arc,
 * AI Insight Box, and Live Total Market & Volume telemetry cards.
 */
export function FearGreedGauge({
  score = 74,
  label = "Greed",
  btcPrice = 63627.4,
  btcChange = 1.61,
  totalMarketCap = 2480000000000,
  marketCapChange = 2.41,
  volume24h = 89600000000,
  volumeChange = -4.2,
}) {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine sentiment label based on score if not passed
  const getSentimentText = (val) => {
    if (val <= 25) return "Extreme Fear";
    if (val <= 45) return "Fear";
    if (val <= 55) return "Neutral";
    if (val <= 75) return "Greed";
    return "Extreme Greed";
  };

  const sentimentText = label || getSentimentText(clampedScore);

  // SVG Speedometer Arc Geometry Parameters
  const centerX = 140;
  const centerY = 125;
  const radius = 95;
  const strokeWidth = 14;

  // Trigonometry helper for SVG arc coordinates
  const getArcPath = (startAngleDeg, endAngleDeg) => {
    const startRad = (Math.PI / 180) * startAngleDeg;
    const endRad = (Math.PI / 180) * endAngleDeg;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY - radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY - radius * Math.sin(endRad);

    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  // Indicator handle node position along the arc (180deg to 0deg)
  const nodeAngleRad = Math.PI - (clampedScore / 100) * Math.PI;
  const nodeX = centerX + radius * Math.cos(nodeAngleRad);
  const nodeY = centerY - radius * Math.sin(nodeAngleRad);

  const btcChangeText = btcChange >= 0 ? `+${btcChange.toFixed(1)}%` : `${btcChange.toFixed(1)}%`;

  return (
    <div className="bg-white text-[#181925] border border-[#e8e8e8] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between font-openrunde h-full min-h-[380px]">

      {/* 2. Center Section: Segmented Speedometer Arc Gauge */}
      <div className="relative flex flex-col items-center justify-center my-1">
        <svg width="280" height="145" viewBox="0 0 280 145" className="overflow-visible">
          <defs>
            {/* Segment 1 Gradient (Ember Red to Orange) */}
            <linearGradient id="seg1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff3e00" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            {/* Segment 2 Gradient (Orange to Amber) */}
            <linearGradient id="seg2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ffa600" />
            </linearGradient>
            {/* Segment 3 Gradient (Amber to Mint) */}
            <linearGradient id="seg3Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffa600" />
              <stop offset="100%" stopColor="#33c758" />
            </linearGradient>
            {/* Segment 4 Gradient (Mint to Bright Mint) */}
            <linearGradient id="seg4Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#33c758" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* 4 Segmented Speedometer Arcs with Gaps */}
          {/* Segment 1: Extreme Fear (176° to 139°) */}
          <path
            d={getArcPath(176, 139)}
            fill="none"
            stroke="url(#seg1Grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Segment 2: Fear (133° to 96°) */}
          <path
            d={getArcPath(133, 96)}
            fill="none"
            stroke="url(#seg2Grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Segment 3: Greed (90° to 53°) */}
          <path
            d={getArcPath(90, 53)}
            fill="none"
            stroke="url(#seg3Grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Segment 4: Extreme Greed (47° to 10°) */}
          <path
            d={getArcPath(47, 10)}
            fill="none"
            stroke="url(#seg4Grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Handle Indicator Node (Carbon Outer Circle with White Ring) */}
          <g transform={`translate(${nodeX.toFixed(2)}, ${nodeY.toFixed(2)})`}>
            <circle cx="0" cy="0" r="11" fill="#181925" />
            <circle cx="0" cy="0" r="7" fill="#ffffff" />
          </g>
        </svg>

        {/* Center Score & Label */}
        <div className="text-center mt-[-40px] pb-2">
          <span className="text-5xl font-semibold tracking-[-2px] text-[#181925] font-openrunde block">
            {clampedScore}
          </span>
          <span className="text-xs font-semibold text-[#666666] tracking-[-0.32px] block mt-1 uppercase">
            {sentimentText}
          </span>
        </div>
      </div>

      {/* 3. Bottom Section: Side-by-Side Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {/* Left Card: Total Market */}
        <div className="bg-[#fafafa] border border-[#e8e8e8] rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-[#999999] uppercase tracking-wider block mb-1">Total Market</span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-[#181925] tracking-[-0.32px]">
              {formatCurrency(totalMarketCap, { notation: "compact" })}
            </span>
            <span
              className={`text-xs font-semibold tracking-tight ${
                marketCapChange >= 0 ? "text-[#33c758]" : "text-[#ff3e00]"
              }`}
            >
              {marketCapChange >= 0 ? "+" : ""}
              {marketCapChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Right Card: Volume (24h) */}
        <div className="bg-[#fafafa] border border-[#e8e8e8] rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-[#999999] uppercase tracking-wider block mb-1">Volume (24h)</span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-[#181925] tracking-[-0.32px]">
              {formatCurrency(volume24h, { notation: "compact" })}
            </span>
            <span
              className={`text-xs font-semibold tracking-tight ${
                volumeChange >= 0 ? "text-[#33c758]" : "text-[#ff3e00]"
              }`}
            >
              {volumeChange >= 0 ? "+" : ""}
              {volumeChange.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FearGreedGauge;
