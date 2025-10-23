/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Authentication guard hook for protected routes. Currently configured for demo
 *              mode where all users are treated as authenticated. Replace with real auth logic
 *              when integrating authentication provider.
 */

"use client";

import { useRouter, usePathname } from 'next/navigation';

/**
 * Manages authentication state and route protection
 * @return {{
 *   isAuthenticated: boolean,
 *   isLoading: boolean
 * }}
 */
export function useAuthGuard() {
  // Demo mode treats all users as authenticated
  // TODO [Tom]: Replace with actual auth provider integration
  return {
    isAuthenticated: true,
    isLoading: false
  };
}
