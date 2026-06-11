import React from "react";
import { Activity, BarChart3, CandlestickChart as CandlestickChartIcon, Waves } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import CandlestickChart from "./CandlestickChart";
import { cn, formatCompactNumber, formatCurrency, formatPercent } from "../../lib/utils";

export const DEFAULT_INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"];

const statIcons = {
  price: CandlestickChartIcon,
  change: Activity,
  volume: BarChart3,
  momentum: Waves,
};

function formatStatValue(stat) {
  if (stat.formatter) {
    return stat.formatter(stat.value);
  }

  if (stat.kind === "currency") {
    return formatCurrency(stat.value);
  }

  if (stat.kind === "compact") {
    return formatCompactNumber(stat.value);
  }

  if (stat.kind === "percent") {
    return formatPercent(stat.value);
  }

  return stat.value ?? "--";
}

export function TradingChartPanel({
  title,
  description,
  symbol,
  interval,
  onIntervalChange,
  loading,
  data,
  stats = [],
  status,
}) {
  return (
    <Card variant="glass" className="panel-shine overflow-hidden border-transparent light:border-transparent">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl">{title}</CardTitle>
              {symbol ? (
                <span className="inline-flex items-center rounded-full border border-transparent light:border-transparent bg-background light:bg-background px-3 py-1 font-mono text-[11px] uppercase text-muted">
                  {symbol}
                </span>
              ) : null}
              {status ? (
                <span className={cn("status-badge", status.tone === "active" ? "status-badge--active" : "status-badge--neutral")}>
                  {status.label}
                </span>
              ) : null}
            </div>
            <CardDescription className="max-w-2xl text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DEFAULT_INTERVALS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onIntervalChange?.(value)}
                className={cn(
                  "rounded-2xl px-3 py-1.5 font-mono text-xs transition-all duration-200",
                  interval === value
                    ? "bg-[#6C63FF] text-on-primary font-semibold"
                    : "bg-background light:bg-background text-muted hover:text-foreground light:hover:text-foreground"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {stats.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = statIcons[stat.icon] || Activity;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-transparent light:border-transparent bg-background light:bg-background px-4 py-3 min-w-0 w-full"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-muted font-heading uppercase">{stat.label}</span>
                    <div className="rounded-full border border-transparent light:border-transparent bg-background light:bg-background p-1.5 text-primary">
                      <Icon size={14} />
                    </div>
                  </div>
                  <div className="text-xl font-bold font-mono text-on-dark light:text-foreground">
                    {formatStatValue(stat)}
                  </div>
                  {stat.hint ? (
                    <div className="mt-1 text-[11px] text-muted font-heading truncate" title={stat.hint}>{stat.hint}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="chart-shell flex h-[420px] items-center justify-center rounded-[28px] border border-transparent light:border-transparent bg-slate-950/50 light:bg-background font-mono text-sm text-muted">
            Syncing market candles...
          </div>
        ) : (
          <CandlestickChart data={data} height={420} />
        )}
      </CardContent>
    </Card>
  );
}
