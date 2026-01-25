import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Component
 * Apple-style with accessible focus states
 * Minimum 44px touch target for iOS guidelines
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles - Apple aesthetic
        "w-full min-w-0 rounded-lg border bg-[var(--color-bg-elevated)] px-4 py-3 text-base outline-none transition-all duration-200",
        "border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
        // Height for touch targets (44px minimum)
        "min-h-[44px]",
        // Focus state - System Blue outline
        "focus-visible:border-[var(--color-interactive)] focus-visible:ring-2 focus-visible:ring-[var(--color-interactive)]/20",
        // Error state
        "aria-invalid:border-[var(--color-error)] aria-invalid:ring-[var(--color-error)]/20",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-bg-secondary)]",
        // File input styling
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--color-text-primary)]",
        // Selection styling
        "selection:bg-[var(--color-interactive)] selection:text-white",
        className
      )}
      {...props}
    />
  )
}

export { Input }
