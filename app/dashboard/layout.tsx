/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Layout wrapper for dashboard with route protection
 */
import { ProtectedRoute } from '@/components/protected-route';

/**
 * Dashboard layout component
 * @constructor
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}