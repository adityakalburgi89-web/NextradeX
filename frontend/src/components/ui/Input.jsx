import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, rightIcon, ...props }, ref) => {
    return (
        <div className="relative">
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2 font-mono text-sm text-white placeholder:text-white/25 pr-10",
                    "transition-all duration-300 ease-smooth",
                    "hover:border-white/[0.15] hover:bg-white/[0.05]",
                    "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-white/[0.06] focus-visible:shadow-input-focus focus-visible:ring-1 focus-visible:ring-primary/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
            {rightIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white cursor-pointer transition-colors">
                    {rightIcon}
                </div>
            )}
        </div>
    )
})
Input.displayName = "Input"

export { Input }
