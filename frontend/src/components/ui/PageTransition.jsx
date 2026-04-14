import * as React from "react"
import { cn } from "../../lib/utils"

function PageTransition({ className, children }) {
    return (
        <div
            className={cn(
                "animate-slide-up",
                className
            )}
        >
            {children}
        </div>
    )
}

export { PageTransition }
