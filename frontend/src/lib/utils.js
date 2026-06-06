import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value, options = {}) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return options.fallback ?? "--";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: options.currency || "USD",
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        notation: options.notation,
    }).format(numericValue);
}

export function formatCompactNumber(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return "--";

    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
    }).format(numericValue);
}

export function formatPercent(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return "0.00%";
    const prefix = numericValue > 0 ? "+" : "";
    return `${prefix}${numericValue.toFixed(2)}%`;
}
