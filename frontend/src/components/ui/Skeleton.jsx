import * as React from "react"
import { cn } from "../../lib/utils"

function Skeleton({ className, variant = "line", ...props }) {
    const base = "relative overflow-hidden bg-white/[0.06] rounded-lg"
    const shimmer = "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent after:animate-shimmer"

    const variants = {
        line: "h-4 w-full",
        circle: "h-10 w-10 rounded-full",
        card: "h-32 w-full rounded-2xl",
        text: "h-3 w-3/4",
    }

    return (
        <div
            className={cn(base, shimmer, variants[variant], className)}
            {...props}
        />
    )
}

function SkeletonRow({ cols = 2 }) {
    return (
        <div className="flex items-center justify-between px-4 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
        </div>
    )
}

function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-white/[0.06] bg-surface p-6 space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton variant="text" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
            </div>
        </div>
    )
}

export { Skeleton, SkeletonRow, SkeletonCard }
