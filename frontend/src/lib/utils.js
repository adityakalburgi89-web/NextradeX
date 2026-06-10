import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value, options = {}) {
    const numericValue = Number(value ?? 0);

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: options.currency || "USD",
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        notation: options.notation,
    }).format(numericValue);
}

export function formatCompactNumber(value) {
    const numericValue = Number(value ?? 0);

    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
    }).format(numericValue);
}

export function formatPercent(value) {
    const numericValue = Number(value ?? 0);
    const prefix = numericValue > 0 ? "+" : "";
    return `${prefix}${numericValue.toFixed(2)}%`;
}

export function formatDate(value, options = {}) {
    if (!value) return "";
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
    }).format(new Date(value));
}

export function truncateText(str, len) {
    if (!str || str.length <= len) return str ?? "";
    return str.slice(0, len) + "…";
}
