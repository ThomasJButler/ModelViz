/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Layout wrapper for analytics page with route protection
 */
import { ProtectedRoute } from '@/components/protected-route';

/**
 * Analytics layout component
 * @constructor
 */
export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}