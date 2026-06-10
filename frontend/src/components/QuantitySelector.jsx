import React from "react";
import { formatCurrency } from "../lib/utils";
import { Input } from "./ui/Input";

/**
 * Reusable quantity selector for trading pages.
 *
 * Props:
 * - value:       current numeric value (string or number)
 * - onChange:    (value: string) => void
 * - max:         maximum available amount
 * - label:       display label for this field (e.g. "Quantity")
 * - symbol:      asset symbol shown as suffix (default "USDT")
 * - showSlider:  whether to render a range input (default false)
 * - className:   extra classes for the wrapper
 * - inputStep:   step attribute on the number input (default "0.0001")
 * - readOnly:    make input read-only (default false)
 */
export default function QuantitySelector({
  value,
  onChange,
  max,
  label = "Quantity",
  symbol = "USDT",
  showSlider = false,
  className = "",
  inputStep = "0.0001",
  readOnly = false,
}) {
  const numValue = Number(value);
  const isInvalid = !isNaN(numValue) && (numValue < 0 || numValue > max);

  const percentOptions = [25, 50, 75, 100];

  const handlePercentClick = (pct) => {
    if (max == null) return;
    // If max is 0, selecting any percent still results in 0
    const target = max * (pct / 100);
    onChange(target.toFixed(4));
  };

  // Convert value to a 0-100 slider position
  const sliderValue =
    max != null && max > 0 && !isNaN(numValue)
      ? Math.min(100, Math.max(0, (numValue / max) * 100))
      : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label + Input row */}
      <div className="relative">
        <Input
          type="number"
          step={inputStep}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          aria-label={`${label} amount`}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${label}-qty-error` : undefined}
          className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md pr-12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">
          {symbol}
        </span>
      </div>

      {/* Percentage chips — 44px touch targets */}
      <div className="flex gap-2">
        {percentOptions.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => handlePercentClick(pct)}
            className="flex-1 min-h-[44px] min-w-[44px] px-3 py-2 bg-canvas-dark hover:bg-white/[0.04] border border-hairline-on-dark text-muted hover:text-white rounded font-mono text-[10px] font-bold transition-all cursor-pointer"
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Optional range slider */}
      {showSlider && (
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => {
            if (max != null && max > 0) {
              onChange(((Number(e.target.value) / 100) * max).toFixed(4));
            }
          }}
          className="w-full h-1.5 bg-canvas-dark rounded-full appearance-none cursor-pointer accent-primary"
          aria-label={`${label} percentage slider`}
        />
      )}

      {/* Available helper text */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted font-mono">Available</span>
        <span className="text-[10px] text-white font-mono font-semibold">
          {max != null ? formatCurrency(max) : "—"} {symbol}
        </span>
      </div>

      {/* Validation error */}
      {isInvalid && (
        <p
          role="alert"
          className="text-trading-down text-xs mt-1 font-mono"
          id={`${label}-qty-error`}
        >
          {numValue < 0
            ? "Quantity cannot be negative"
            : `Quantity exceeds available balance of ${formatCurrency(max)} ${symbol}`}
        </p>
      )}
    </div>
  );
}