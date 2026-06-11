import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const cardVariants = cva(
    "rounded-[32px] transition-all duration-300 ease-out relative overflow-hidden animate-fade-in bg-background text-foreground shadow-neo",
    {
        variants: {
            variant: {
                default:
                    "bg-background text-foreground",
                glass:
                    "bg-surface-glass text-foreground backdrop-blur-xl",
                elevated:
                    "bg-background text-foreground shadow-neo-hover",
                pricing:
                    "bg-background text-foreground",
                pricingActive:
                    "bg-background z-10 text-foreground ring-2 ring-primary ring-offset-2 ring-offset-background shadow-neo-hover",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Card = React.forwardRef(({ className, variant, interactive = true, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            cardVariants({ variant, className }),
            interactive && "hover:-translate-y-0.5 hover:shadow-neo-hover transition-all duration-300 cursor-pointer"
        )}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "font-heading font-semibold leading-none text-xl text-[var(--foreground)]",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-[var(--muted)] font-body leading-relaxed", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
