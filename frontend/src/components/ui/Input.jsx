import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, rightIcon, ...props }, ref) => {
    return (
        <div className="relative">
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 py-2 font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 pr-10",
                    "transition-all duration-300 ease-smooth",
                    "hover:border-primary/40 hover:bg-[var(--surface-elevated)]",
                    "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-1 focus-visible:ring-primary/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
            {rightIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors">
                    {rightIcon}
                </div>
            )}
        </div>
    )
})
Input.displayName = "Input"

export { Input }
