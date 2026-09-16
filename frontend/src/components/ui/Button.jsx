import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-body text-sm font-medium relative overflow-hidden transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-60 focus:outline-none",
    {
        variants: {
            variant: {
                default:
                    "bg-lavender text-white rounded-full px-5 py-2.5 shadow-subtle hover:bg-[#837ff2] hover:-translate-y-0.5 active:translate-y-0",
                primaryPill:
                    "bg-lavender text-white rounded-full px-6 py-2.5 shadow-subtle hover:bg-[#837ff2] hover:-translate-y-0.5 active:translate-y-0",
                iris:
                    "bg-iris text-white rounded-full px-3.5 py-1.5 text-sm font-medium hover:bg-[#856eff] active:translate-y-0",
                secondaryOnDark:
                    "bg-mist text-carbon rounded-full px-5 py-2.5 hover:bg-fog hover:text-carbon",
                secondaryOnLight:
                    "bg-mist text-carbon rounded-full px-5 py-2.5 hover:bg-fog hover:text-carbon",
                tertiaryText:
                    "bg-transparent text-carbon hover:underline underline-offset-4 p-0 min-h-0 shadow-none font-medium",
                outline:
                    "bg-white border border-fog text-carbon rounded-full px-5 py-2.5 hover:bg-mist hover:border-ash",
                ghost: "bg-transparent text-graphite rounded-full px-5 py-2.5 hover:text-carbon hover:bg-mist",
                link: "text-carbon hover:underline underline-offset-4 bg-transparent p-0",
                danger:
                    "bg-ember text-white rounded-full px-5 py-2.5 hover:bg-[#e03700]",
                tradingUp:
                    "bg-mint text-white font-medium rounded-full px-5 py-2 hover:bg-[#2db34e]",
                tradingDown:
                    "bg-ember text-white font-medium rounded-full px-5 py-2 hover:bg-[#e03700]",
                subscribe:
                    "bg-lavender text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-[#837ff2]",
            },
            size: {
                default: "h-10 px-5 py-2.5",
                sm: "h-8 rounded-full px-3.5 text-xs",
                lg: "h-12 rounded-full px-8 text-base",
                icon: "h-10 w-10 rounded-full p-0",
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
