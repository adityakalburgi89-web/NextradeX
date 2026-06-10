import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const cardVariants = cva(
    "rounded-xl border transition-all duration-200 relative overflow-hidden animate-fade-in",
    {
        variants: {
            variant: {
                default:
                    "bg-surface-card-dark border-hairline-on-dark text-on-dark light:bg-canvas-light light:border-hairline-on-light light:text-ink",
                glass:
                    "bg-surface-card-dark/95 backdrop-blur-2xl border-hairline-on-dark text-on-dark light:bg-canvas-light/95 light:border-hairline-on-light light:text-ink",
                elevated:
                    "bg-surface-elevated-dark border-hairline-on-dark text-on-dark light:bg-surface-soft-light light:border-hairline-on-light light:text-ink",
                pricing:
                    "bg-surface-card-dark border-hairline-on-dark text-on-dark light:bg-canvas-light light:border-hairline-on-light light:text-ink",
                pricingActive:
                    "bg-surface-card-dark border-primary border-2 z-10 text-on-dark light:bg-canvas-light light:border-primary light:border-2 light:text-ink",
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
            interactive && "hover:border-primary/30 hover:shadow-glow-sm transition-all duration-200 cursor-pointer"
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
            "font-heading font-semibold leading-none tracking-tight text-xl text-[var(--foreground)]",
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
