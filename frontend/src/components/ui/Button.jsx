import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-body text-sm transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-8 py-3",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-secondary to-primary text-white font-bold uppercase tracking-wider shadow-glow-primary hover:scale-105 hover:shadow-glow-primary-hover",
                outline:
                    "border-2 border-white/20 text-white hover:border-white hover:bg-white/10",
                ghost: "hover:bg-white/10 hover:text-primary text-white",
                link: "text-primary hover:underline",
            },
            size: {
                default: "min-h-[44px] px-8 py-3",
                sm: "h-9 rounded-full px-4 text-xs",
                lg: "h-14 rounded-full px-10 text-base",
                icon: "h-12 w-12 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "div" : "button"
    return (
        (<Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props} />)
    );
})
Button.displayName = "Button"

export { Button, buttonVariants }
