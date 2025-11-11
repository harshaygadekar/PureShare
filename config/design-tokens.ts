/**
 * Design System Tokens
 * Apple-inspired minimal design with squared corners
 * Zinc-based dark theme (softer than pure black)
 */

export const designTokens = {
  colors: {
    // Base colors - Zinc-based dark theme
    background: '#09090b',    // zinc-950
    surface: '#18181b',        // zinc-900
    elevated: '#27272a',       // zinc-800
    border: '#27272a',         // zinc-800
    'border-hover': '#3f3f46', // zinc-700

    // Text hierarchy
    text: {
      primary: '#fafafa',      // zinc-50
      secondary: '#a1a1aa',    // zinc-400
      tertiary: '#71717a',     // zinc-500
      disabled: '#52525b',     // zinc-600
    },

    // Accent color - Apple blue
    accent: {
      primary: '#0a84ff',
      hover: '#0077ed',
      active: '#006edb',
      subtle: '#27272a',       // zinc-800
    },

    // Status colors
    status: {
      success: '#30d158',
      'success-bg': '#0f2a1a',
      error: '#ff453a',
      'error-bg': '#2a0f0f',
      warning: '#ffd60a',
      'warning-bg': '#2a250f',
      info: '#0a84ff',
      'info-bg': '#0f1a2a',
    },
  },

  typography: {
    fonts: {
      sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      mono: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
    },

    sizes: {
      // Display
      display: '4.5rem', // 72px
      'display-sm': '3.5rem', // 56px

      // Headings
      h1: '3rem', // 48px
      h2: '2.25rem', // 36px
      h3: '1.875rem', // 30px
      h4: '1.5rem', // 24px
      h5: '1.25rem', // 20px
      h6: '1.125rem', // 18px

      // Body
      body: '1.0625rem', // 17px - Apple standard
      'body-sm': '0.9375rem', // 15px
      small: '0.875rem', // 14px
      tiny: '0.75rem', // 12px
    },

    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
    },
  },

  spacing: {
    // Section spacing
    section: '7.5rem', // 120px
    'section-sm': '5rem', // 80px

    // Container
    container: '5rem', // 80px
    'container-sm': '2rem', // 32px

    // Element spacing
    xl: '3rem', // 48px
    lg: '2rem', // 32px
    md: '1.5rem', // 24px
    base: '1rem', // 16px
    sm: '0.75rem', // 12px
    xs: '0.5rem', // 8px
    '2xs': '0.25rem', // 4px
  },

  borderRadius: {
    none: '0px',
    minimal: '2px', // Only for focus states
  },

  transitions: {
    durations: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
    },
    timings: {
      // Apple's signature easing
      apple: 'cubic-bezier(0.4, 0, 0.2, 1)',
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
    },
  },

  effects: {
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '24px',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
  },
} as const;

export type DesignTokens = typeof designTokens;
