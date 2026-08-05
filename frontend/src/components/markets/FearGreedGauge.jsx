import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { formatCurrency, formatPercent } from "../../lib/utils";

/**
 * Premium Dark Fear & Greed Index Component with Segmented Speedometer Arc,
 * AI Insight Box, and Live Total Market & Volume cards.
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
    <div className="bg-[#090a0f] text-white border border-[#1e2230] rounded-[28px] p-6 shadow-2xl flex flex-col justify-between font-openrunde min-h-[460px]">
      {/* 1. Top Section: AI INSIGHT Box */}
      <div className="bg-[#121520]/80 border border-[#23293e] rounded-2xl p-4 mb-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <HugeiconsIcon icon={SparklesIcon} size={15} className="text-[#34d399]" />
          <span className="text-[11px] font-bold tracking-widest text-[#34d399] uppercase font-mono">
            AI INSIGHT
          </span>
        </div>
        <p className="text-xs text-[#94a3b8] leading-relaxed font-normal">
          Bitcoin's price fluctuated by <span className={btcChange >= 0 ? "text-[#34d399] font-medium" : "text-[#f87171] font-medium"}>{btcChangeText}</span> over the last 24 hours, currently trading around <span className="text-white font-medium">{formatCurrency(btcPrice)}</span>.
        </p>
      </div>

      {/* 2. Center Section: Segmented Speedometer Arc Gauge */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg width="280" height="150" viewBox="0 0 280 150" className="overflow-visible">
          <defs>
            {/* Segment 1 Gradient (Red to Orange) */}
            <linearGradient id="seg1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            {/* Segment 2 Gradient (Orange to Yellow) */}
            <linearGradient id="seg2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            {/* Segment 3 Gradient (Yellow to Lime) */}
            <linearGradient id="seg3Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#a3e635" />
            </linearGradient>
            {/* Segment 4 Gradient (Lime to Mint) */}
            <linearGradient id="seg4Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a3e635" />
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

          {/* Active Handle Indicator Node (White Circle with Dark Ring) */}
          <g transform={`translate(${nodeX.toFixed(2)}, ${nodeY.toFixed(2)})`}>
            <circle cx="0" cy="0" r="11" fill="#090a0f" />
            <circle cx="0" cy="0" r="8" fill="#ffffff" />
          </g>
        </svg>

        {/* Center Score & Label */}
        <div className="text-center mt-[-45px] pb-3">
          <span className="text-5xl font-extralight tracking-tight text-white font-mono block">
            {clampedScore}
          </span>
          <span className="text-sm font-mono text-[#cbd5e1] tracking-wider block mt-1">
            {sentimentText}
          </span>
        </div>
      </div>

      {/* 3. Bottom Section: Side-by-Side Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {/* Left Card: Total Market */}
        <div className="bg-[#121520] border border-[#1e2436] rounded-2xl p-3.5">
          <span className="text-[11px] font-medium text-[#64748b] block mb-1">Total Market</span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-white tracking-tight">
              {formatCurrency(totalMarketCap, { notation: "compact" })}
            </span>
            <span
              className={`text-[11px] font-semibold ${
                marketCapChange >= 0 ? "text-[#34d399]" : "text-[#f87171]"
              }`}
            >
              {marketCapChange >= 0 ? "+" : ""}
              {marketCapChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Right Card: Volume (24h) */}
        <div className="bg-[#121520] border border-[#1e2436] rounded-2xl p-3.5">
          <span className="text-[11px] font-medium text-[#64748b] block mb-1">Volume (24h)</span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-white tracking-tight">
              {formatCurrency(volume24h, { notation: "compact" })}
            </span>
            <span
              className={`text-[11px] font-semibold ${
                volumeChange >= 0 ? "text-[#34d399]" : "text-[#f87171]"
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
