/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Clean layout wrapper for playground - full width, no sidebar
 */
'use client';

import { ProtectedRoute } from '@/components/protected-route';

/**
 * Playground layout component
 * @constructor
 */
export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
        {children}
      </div>
    </ProtectedRoute>
  );
}
