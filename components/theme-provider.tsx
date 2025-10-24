/**
 * @file theme-provider.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Theme provider component managing dark/light mode and colour scheme preferences.
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * @constructor
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}