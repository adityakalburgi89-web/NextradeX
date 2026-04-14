import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-body text-sm font-medium relative overflow-hidden transition-all duration-300 ease-smooth disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] min-h-[44px] px-8 py-3 gpu-accelerated focus-ring",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-secondary to-primary text-white font-bold uppercase tracking-wider shadow-glow-primary hover:scale-[1.03] hover:shadow-glow-primary-hover",
                outline:
                    "border border-white/20 text-white hover:border-primary/60 hover:bg-white/[0.04] hover:shadow-glow-soft",
                ghost: "hover:bg-white/[0.06] hover:text-primary text-white",
                link: "text-primary hover:underline underline-offset-4",
                danger:
                    "bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]",
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

const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? "div" : "button"
    return (
        (<Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            disabled={loading || props.disabled}
            {...props}>
            {loading && <Spinner />}
            {children}
        </Comp>)
    );
})
Button.displayName = "Button"

export { Button, buttonVariants }
