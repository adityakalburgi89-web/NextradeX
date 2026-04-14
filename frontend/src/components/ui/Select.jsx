import * as React from "react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-12 w-full appearance-none rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2 pr-10 font-mono text-sm text-white",
                    "transition-all duration-300 ease-smooth",
                    "hover:border-white/[0.15] hover:bg-white/[0.05]",
                    "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-white/[0.06] focus-visible:shadow-input-focus focus-visible:ring-1 focus-visible:ring-primary/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
    )
})
Select.displayName = "Select"

export { Select }
