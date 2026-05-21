import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, rightIcon, ...props }, ref) => {
    return (
        <div className="relative">
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full font-mono text-sm px-4 py-2.5",
                    "bg-surface-card-dark text-on-dark border border-hairline-on-dark rounded-lg placeholder:text-muted/50",
                    "light:bg-canvas-light light:text-ink light:border-hairline-on-light light:rounded-md light:placeholder:text-muted/50",
                    "transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20",
                    "disabled:cursor-not-allowed disabled:opacity-50 pr-10",
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
