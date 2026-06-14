import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-2xl font-body text-sm font-bold relative overflow-hidden transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-60 focus-ring active:translate-y-0.5",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-on-primary px-6 py-3 shadow-neo hover:-translate-y-0.5 hover:bg-primary-active hover:shadow-neo-hover active:shadow-neo-inset-sm",
                primaryPill:
                    "bg-primary text-on-primary rounded-full px-8 py-3.5 shadow-neo hover:-translate-y-0.5 hover:bg-primary-active hover:shadow-neo-hover active:shadow-neo-inset-sm",
                primaryGradient:
                    "bg-gradient-to-r from-primary to-accent-turquoise text-white px-6 py-3 shadow-neo hover:-translate-y-0.5 hover:shadow-glow-primary active:shadow-neo-inset-sm",
                primaryGradientPill:
                    "bg-gradient-to-r from-primary to-accent-turquoise text-white rounded-full px-8 py-3.5 shadow-neo hover:-translate-y-0.5 hover:shadow-glow-primary active:shadow-neo-inset-sm",
                secondaryOnDark:
                    "bg-background text-foreground px-6 py-3 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-hover active:shadow-neo-inset-sm",
                secondaryOnLight:
                    "bg-background text-foreground px-6 py-3 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-hover active:shadow-neo-inset-sm",
                tertiaryText:
                    "bg-transparent text-foreground hover:text-primary font-bold p-0 min-h-0 shadow-none",
                outline:
                    "bg-background text-foreground px-6 py-3 shadow-neo hover:-translate-y-0.5 hover:text-primary hover:shadow-neo-hover active:shadow-neo-inset-sm",
                ghost: "bg-background text-muted px-6 py-3 shadow-neo-sm hover:text-primary active:shadow-neo-inset-sm",
                link: "text-primary hover:opacity-90",
                danger:
                    "bg-trading-down text-foreground px-6 py-3 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-hover active:shadow-neo-inset-sm",
                tradingUp:
                    "bg-trading-up text-white font-semibold px-5 py-2 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-hover",
                tradingDown:
                    "bg-trading-down text-white font-semibold px-5 py-2 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-hover",
                subscribe:
                    "bg-primary text-on-primary text-xs font-bold px-4 py-1.5 h-8 min-h-8 shadow-neo-sm hover:bg-primary-active",
            },
            size: {
                default: "h-11 px-6 py-3",
                sm: "h-9 min-h-9 rounded-2xl px-4 text-xs",
                lg: "h-12 rounded-2xl px-8 text-base",
                icon: "h-12 w-12 rounded-2xl p-0",
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
