import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const cardVariants = cva(
    "rounded-2xl border transition-all duration-300 relative overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "bg-surface border-white/10 hover:-translate-y-1 hover:border-primary/50 hover:shadow-card-hover",
                glass:
                    "bg-black/40 backdrop-blur-lg border-white/10",
                pricing:
                    "bg-surface border-white/10 opacity-80 hover:opacity-100 hover:scale-105",
                pricingActive:
                    "bg-surface border-primary shadow-card-elevation scale-105 z-10",
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
        className={cn("flex flex-col space-y-1.5 p-8 pb-4", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "font-heading font-semibold leading-none tracking-tight text-2xl text-white",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted font-body", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-8 pt-0 relative z-10", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-8 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
