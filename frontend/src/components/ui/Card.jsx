import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const cardVariants = cva(
    "rounded-2xl border transition-all duration-300 ease-smooth relative overflow-hidden gpu-accelerated animate-fade-in",
    {
        variants: {
            variant: {
                default:
                    "bg-surface border-white/[0.06] shadow-elevation-sm hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover ambient-glow",
                glass:
                    "bg-surface-glass backdrop-blur-2xl border-white/[0.06] shadow-inner-glow",
                elevated:
                    "bg-surface-elevated border-white/[0.06] shadow-elevation-md hover:-translate-y-1 hover:shadow-elevation-lg",
                pricing:
                    "bg-surface border-white/[0.06] opacity-80 hover:opacity-100 hover:scale-[1.03]",
                pricingActive:
                    "bg-surface border-primary shadow-card-elevation scale-[1.03] z-10 gradient-border",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Card = React.forwardRef(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(cardVariants({ variant, className }))}
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
            "font-heading font-semibold leading-none tracking-tight text-xl text-white",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted font-body leading-relaxed", className)}
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
