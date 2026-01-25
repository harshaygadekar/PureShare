import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Component
 * Apple-inspired CTA patterns with System Blue
 */
const buttonVariants = cva(
  // Base styles with Apple focus ring
  "inline-flex items-center justify-center whitespace-nowrap font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-interactive)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: Solid System Blue
        default:
          "bg-[var(--color-interactive)] text-white hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] active:scale-[0.98]",
        // Destructive: Solid Red
        destructive:
          "bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 active:scale-[0.98]",
        // Outline/Secondary: Border with System Blue
        outline:
          "border-[1.5px] border-[var(--color-interactive)] bg-transparent text-[var(--color-interactive)] hover:bg-[var(--color-interactive)] hover:text-white active:scale-[0.98]",
        secondary:
          "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] active:scale-[0.98]",
        // Ghost: Transparent with hover
        ghost:
          "hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]",
        // Link/Tertiary: Text only
        link:
          "text-[var(--color-interactive)] underline-offset-4 hover:underline hover:text-[var(--color-interactive-hover)]",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm rounded-lg",
        sm: "h-9 px-4 text-sm rounded-md",
        lg: "h-12 px-8 text-base rounded-xl",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
