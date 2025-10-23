/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Layout wrapper for playground with route protection
 */
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
  return <ProtectedRoute>{children}</ProtectedRoute>;
}