import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, rightIcon, ...props }, ref) => {
    return (
        <div className="relative">
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full font-body text-sm px-4 py-2.5",
                    "bg-background text-foreground rounded-2xl placeholder:text-muted/60 shadow-neo-inset",
                    "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-neo-inset-deep",
                    "disabled:cursor-not-allowed disabled:opacity-50 pr-10",
                    className
                )}
                ref={ref}
                aria-invalid={props['aria-invalid']}
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
