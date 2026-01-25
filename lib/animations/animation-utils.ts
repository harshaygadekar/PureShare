/**
 * Animation Utilities
 * Centralized animation configuration for Apple-inspired motion
 * Supports prefers-reduced-motion for accessibility
 */

import { Variants } from 'framer-motion';

// ========================================
// DURATION CONSTANTS (matches design tokens)
// ========================================
export const DURATION = {
    instant: 0.1,    // 100ms
    fast: 0.15,      // 150ms - hover feedback
    normal: 0.25,    // 250ms - standard transitions
    slow: 0.4,       // 400ms - page transitions
    entrance: 0.5,   // 500ms - appear animations
    exit: 0.3,       // 300ms - disappear animations
} as const;

// ========================================
// EASING CURVES
// ========================================
export const EASE = {
    default: [0.4, 0, 0.2, 1],   // ease-in-out
    out: [0, 0, 0.2, 1],         // ease-out (entrance)
    in: [0.4, 0, 1, 1],          // ease-in (exit)
    spring: { type: 'spring', stiffness: 400, damping: 25 },
} as const;

// ========================================
// COMMON ANIMATION VARIANTS
// ========================================

/**
 * Fade in from below (most common entrance)
 */
export const fadeInUp: Variants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.entrance,
            ease: EASE.out,
        }
    },
};

/**
 * Fade in from above
 */
export const fadeInDown: Variants = {
    hidden: {
        opacity: 0,
        y: -20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.entrance,
            ease: EASE.out,
        }
    },
};

/**
 * Simple fade (no movement)
 */
export const fade: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: DURATION.normal,
            ease: EASE.default,
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: DURATION.exit,
            ease: EASE.in,
        }
    },
};

/**
 * Scale in (for modals, cards)
 */
export const scaleIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: DURATION.entrance,
            ease: EASE.out,
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: DURATION.exit,
            ease: EASE.in,
        }
    },
};

/**
 * Stagger container for child animations
 */
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

/**
 * Fast stagger for lists
 */
export const fastStagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

// ========================================
// REDUCED MOTION VARIANTS
// Returns static variants when reduced motion is preferred
// ========================================
export const getReducedMotionVariants = (variants: Variants): Variants => {
    return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };
};

/**
 * Hook to check if user prefers reduced motion
 * Usage: const prefersReducedMotion = usePrefersReducedMotion();
 */
export const getMotionProps = (shouldAnimate: boolean) => {
    if (!shouldAnimate) {
        return {
            initial: false,
            animate: false,
            exit: false,
        };
    }
    return {};
};

// ========================================
// HOVER/TAP PRESETS
// ========================================
export const hoverScale = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: DURATION.fast },
};

export const hoverLift = {
    whileHover: { y: -2 },
    transition: { duration: DURATION.fast },
};

// ========================================
// SCROLL-TRIGGERED VIEWPORT OPTIONS
// ========================================
export const viewportOnce = {
    once: true,
    margin: '-50px',
};

export const viewportAmount = {
    once: true,
    amount: 0.3,
};
