import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, rightIcon, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full font-openrunde text-sm px-3.5 py-2",
                    "bg-white text-carbon rounded-[8px] border border-fog placeholder:text-ash",
                    "transition-colors duration-200 focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender",
                    "disabled:cursor-not-allowed disabled:opacity-50 pr-10 tracking-[-0.32px]",
                    className
                )}
                ref={ref}
                aria-invalid={props['aria-invalid']}
                {...props}
            />
            {rightIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-carbon cursor-pointer transition-colors">
                    {rightIcon}
                </div>
            )}
        </div>
    )
})
Input.displayName = "Input"

export { Input }
