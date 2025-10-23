/**
 * @fileoverview Skeleton loading placeholder component
 * @author Tom Butler
 * @date 2025-10-23
 */

import { cn } from '@/lib/utils';

/**
 * @constructor
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
