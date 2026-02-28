import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-12 w-full bg-black/50 border-b-2 border-white/20 px-4 py-2 font-mono text-sm text-white placeholder:text-white/30",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-input-focus",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
