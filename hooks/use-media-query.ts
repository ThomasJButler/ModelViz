"use client";

import { useState, useEffect } from 'react';

/**
 * Hook for responsive media query detection
 * @param query - CSS media query string (e.g., "(min-width: 1024px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook to detect mobile viewport (< 1024px)
 * @returns true if viewport is below lg breakpoint
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 1024px)');
}

/**
 * Hook to detect user's reduced motion preference
 * @returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Combined hook for visual effects - disabled on mobile or when user prefers reduced motion
 * @returns true if visual effects should be enabled
 */
export function useEffectsEnabled(): boolean {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  return !isMobile && !prefersReducedMotion;
}
