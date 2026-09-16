import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all focus:outline-none tracking-[-0.32px]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-carbon border border-fog",
        secondary:
          "bg-mint-wash text-mint font-medium",
        destructive:
          "bg-[#ffebe5] text-ember font-medium",
        sky:
          "bg-white text-sky border border-fog font-medium",
        outline: "bg-transparent text-graphite border border-fog",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
