import React from "react";
import FearGreedGauge from "./FearGreedGauge";
import { formatCurrency, formatPercent } from "../../lib/utils";

/**
 * Global Market Telemetry Header Widget
 * Visitors White Engineering Blueprint Telemetry Cards
 */
export function GlobalMarketHeader({
  globalStats = {
    totalMarketCap: 2480000000000,
    marketCapChange24h: 2.41,
    volume24h: 89600000000,
    btcDominance: 56.2,
    ethDominance: 15.4,
    ethGasGwei: 18,
    fearGreedScore: 74,
    fearGreedLabel: "Greed",
    btcPrice: 63627.4,
    btcChange: 1.61,
  },
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-openrunde mb-8">
      {/* Left 2 Columns: 4 Key Metric Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Card 1: Total Market Cap */}
        <div className="bg-white border border-[#e8e8e8] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#918df6] transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Total Market Cap</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                (globalStats.marketCapChange24h ?? 2.41) >= 0 ? "bg-[#def6e4] text-[#33c758]" : "bg-[#fff0f0] text-[#ff3e00]"
              }`}
            >
              {formatPercent(globalStats.marketCapChange24h ?? 2.41)}
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-semibold text-[#181925] tracking-[-1px]">
              {formatCurrency(globalStats.totalMarketCap ?? 2480000000000, { notation: "compact" })}
            </h2>
            <p className="text-xs text-[#666666] mt-1.5 tracking-[-0.32px]">
              Global market valuation across all cryptocurrencies.
            </p>
          </div>
          <div className="mt-5 pt-3.5 border-t border-[#e8e8e8] flex items-center justify-between text-xs text-[#999999] tracking-[-0.32px]">
            <span>24H Change</span>
            <span className={(globalStats.marketCapChange24h ?? 2.41) >= 0 ? "text-[#33c758] font-semibold" : "text-[#ff3e00] font-semibold"}>
              {(globalStats.marketCapChange24h ?? 2.41) >= 0 ? "+" : ""}
              {formatCurrency(((globalStats.totalMarketCap ?? 2480000000000) * ((globalStats.marketCapChange24h ?? 2.41) / 100)), { notation: "compact" })}
            </span>
          </div>
        </div>

        {/* Card 2: 24h Trading Volume */}
        <div className="bg-white border border-[#e8e8e8] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#918df6] transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#999999] uppercase tracking-wider">24h Trading Volume</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f5f5f5] text-[#666666]">24H Spot & Perps</span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-semibold text-[#181925] tracking-[-1px]">
              {formatCurrency(globalStats.volume24h ?? 89600000000, { notation: "compact" })}
            </h2>
            <p className="text-xs text-[#666666] mt-1.5 tracking-[-0.32px]">
              Total 24h transaction volume registered across exchanges.
            </p>
          </div>
          <div className="mt-5 pt-3.5 border-t border-[#e8e8e8] flex items-center justify-between text-xs text-[#999999] tracking-[-0.32px]">
            <span>Market Activity</span>
            <span className="text-[#181925] font-semibold">High Liquidity</span>
          </div>
        </div>

        {/* Card 3: Market Dominance */}
        <div className="bg-white border border-[#e8e8e8] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#918df6] transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Market Dominance</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f5f5f5] text-[#666666]">Top Assets</span>
          </div>
          <div className="mt-4 flex items-baseline gap-5">
            <div>
              <span className="text-xs text-[#999999] block tracking-[-0.32px]">BTC</span>
              <span className="text-2xl font-bold text-[#181925] tracking-[-0.61px]">{globalStats.btcDominance ?? 56.2}%</span>
            </div>
            <div className="h-7 w-[1px] bg-[#e8e8e8]" />
            <div>
              <span className="text-xs text-[#999999] block tracking-[-0.32px]">ETH</span>
              <span className="text-2xl font-bold text-[#181925] tracking-[-0.61px]">{globalStats.ethDominance ?? 15.4}%</span>
            </div>
          </div>
          {/* Progress bar ratio */}
          <div className="mt-4 h-2 w-full bg-[#f5f5f5] rounded-full overflow-hidden flex">
            <div style={{ width: `${globalStats.btcDominance ?? 56.2}%` }} className="bg-[#ffa600] h-full" title="BTC Dominance" />
            <div style={{ width: `${globalStats.ethDominance ?? 15.4}%` }} className="bg-[#2c78fc] h-full" title="ETH Dominance" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#999999] tracking-[-0.32px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ffa600] inline-block" /> Bitcoin</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2c78fc] inline-block" /> Ethereum</span>
            <span>Others ({(Math.max(0, 100 - (globalStats.btcDominance ?? 56.2) - (globalStats.ethDominance ?? 15.4))).toFixed(1)}%)</span>
          </div>
        </div>

        {/* Card 4: ETH Gas & Network Stats */}
        <div className="bg-white border border-[#e8e8e8] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#918df6] transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#999999] uppercase tracking-wider">ETH Gas Tracker</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#def6e4] text-[#33c758]">Fast</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-semibold text-[#181925] tracking-[-1px]">{globalStats.ethGasGwei ?? 18} Gwei</h2>
            <span className="text-xs text-[#999999] tracking-[-0.32px]">≈ $0.42 / tx</span>
          </div>
          <p className="text-xs text-[#666666] mt-1.5 tracking-[-0.32px]">
            Real-time Ethereum mainnet base gas fee estimation.
          </p>
          <div className="mt-5 pt-3.5 border-t border-[#e8e8e8] flex items-center justify-between text-xs text-[#999999] tracking-[-0.32px]">
            <span>Network Congestion</span>
            <span className="text-[#33c758] font-semibold">Optimal</span>
          </div>
        </div>
      </div>

      {/* Right Column: Sleek Reference Dark Fear & Greed Card */}
      <div className="lg:col-span-1">
        <FearGreedGauge
          score={globalStats.fearGreedScore ?? 74}
          label={globalStats.fearGreedLabel ?? "Greed"}
          btcPrice={globalStats.btcPrice ?? 63627.4}
          btcChange={globalStats.btcChange ?? 1.61}
          totalMarketCap={globalStats.totalMarketCap ?? 2480000000000}
          marketCapChange={globalStats.marketCapChange24h ?? 2.41}
          volume24h={globalStats.volume24h ?? 89600000000}
          volumeChange={-4.2}
        />
      </div>
    </div>
  );
}

export default GlobalMarketHeader;
