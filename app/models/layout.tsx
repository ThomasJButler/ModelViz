/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Layout wrapper for models page with route protection
 */
import { ProtectedRoute } from '@/components/protected-route';

/**
 * Models layout component
 * @constructor
 */
export default function ModelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}