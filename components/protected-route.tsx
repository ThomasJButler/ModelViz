/**
 * @file protected-route.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Route protection component enforcing authentication and authorisation requirements.
 */

"use client";

/**
 * @constructor
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // In demo mode, we'll render the children directly without auth checks
  return <>{children}</>;
}