import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const cardVariants = cva(
    "rounded-[16px] border border-fog bg-white text-carbon transition-all duration-200 ease-out relative overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "bg-white text-carbon border-fog",
                glass:
                    "bg-white text-carbon border-fog",
                elevated:
                    "bg-white text-carbon border-fog shadow-subtle-3",
                pricing:
                    "bg-white text-carbon border-fog rounded-[24px]",
                pricingActive:
                    "bg-white text-carbon border-lavender ring-2 ring-lavender/30 rounded-[24px] shadow-subtle-3",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Card = React.forwardRef(({ className, variant, interactive = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            cardVariants({ variant, className }),
            interactive && "hover:-translate-y-0.5 hover:border-ash transition-all duration-200 cursor-pointer"
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
        className={cn("flex flex-col space-y-1.5 p-6 pb-3", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "font-openrunde font-medium leading-tight text-xl text-carbon tracking-[-0.31px]",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-graphite font-openrunde leading-relaxed tracking-[-0.32px]", className)}
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
