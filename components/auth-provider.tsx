/**
 * @file auth-provider.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Authentication provider managing user sessions and authorisation state.
 */

"use client";

/**
 * @constructor
 */
export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}