import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap font-body text-sm font-semibold relative overflow-hidden transition-all duration-200 disabled:pointer-events-none focus-ring",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-on-primary hover:bg-[#f0b90b] disabled:bg-primary-disabled disabled:text-muted rounded-md px-6 py-3 h-10",
                primaryPill:
                    "bg-primary text-on-primary hover:bg-[#f0b90b] rounded-pill px-8 py-3.5",
                secondaryOnDark:
                    "bg-surface-card-dark text-on-dark hover:bg-surface-elevated-dark rounded-md px-6 py-3 h-10",
                secondaryOnLight:
                    "bg-canvas-light text-ink border border-hairline-on-light hover:bg-surface-soft-light rounded-md px-6 py-3 h-10",
                tertiaryText:
                    "bg-transparent text-body hover:opacity-90 font-semibold p-0 min-h-0",
                outline:
                    "border border-hairline-on-dark text-body hover:bg-surface-elevated-dark rounded-md px-6 py-3 h-10",
                ghost: "hover:bg-surface-elevated-dark hover:text-primary text-body rounded-md px-6 py-3 h-10",
                link: "text-primary hover:opacity-90",
                danger:
                    "bg-trading-down text-white hover:opacity-90 rounded-md px-6 py-3 h-10",
                tradingUp:
                    "bg-trading-up text-white rounded-sm font-semibold px-5 py-2 hover:opacity-90",
                tradingDown:
                    "bg-trading-down text-white rounded-sm font-semibold px-5 py-2 hover:opacity-90",
                subscribe:
                    "bg-primary text-on-primary rounded-sm text-xs font-semibold px-4 py-1.5 h-[28px] min-h-[28px] hover:bg-[#f0b90b]",
            },
            size: {
                default: "h-10 px-6 py-3",
                sm: "h-[28px] rounded-sm px-3 text-xs",
                lg: "h-12 rounded-md px-8 text-base",
                icon: "h-10 w-10 rounded-md",
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
    const classes = cn(buttonVariants({ variant, size, className }))

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ...props,
            className: cn(classes, children.props.className),
            "aria-disabled": loading || props.disabled,
        }, (
            <>
                {loading && <Spinner />}
                {children.props.children}
            </>
        ))
    }

    return (
        <button
            className={classes}
            ref={ref}
            disabled={loading || props.disabled}
            {...props}>
            {loading && <Spinner />}
            {children}
        </button>
    );
})
Button.displayName = "Button"

export { Button, buttonVariants }
