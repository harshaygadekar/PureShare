/**
 * useReducedMotion Hook
 * Detects user's motion preference for accessibility
 * Respects prefers-reduced-motion media query
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled "Reduce motion" in OS settings
 */
export function useReducedMotion(): boolean {
  // Use lazy initialization to set initial value without setState in effect
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Listen for changes
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add event listener (modern browsers)
    mediaQuery.addEventListener('change', listener);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return prefersReducedMotion;
}
