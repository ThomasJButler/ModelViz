/**
 * @author Tom Butler
 * @date 2025-11-26
 * @description Layout wrapper for compare page with route protection
 */
import { ProtectedRoute } from '@/components/protected-route';

/**
 * Compare layout component
 * @constructor
 */
export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
