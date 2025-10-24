/**
 * @file model-status-badge.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Status badge component indicating model availability and health.
 */

"use client";

import { motion } from 'framer-motion';
import { useModelStatus } from '@/hooks/use-model-status';

/**
 * @constructor
 */
export function ModelStatusBadge({ modelId }: { modelId: string }) {
  const { health } = useModelStatus(modelId);

  if (!health) {
    return (
      <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
        Loading...
      </div>
    );
  }

  const statusConfig = {
    online: { color: 'bg-matrix-primary', label: 'Online' },
    offline: { color: 'bg-red-500', label: 'Offline' },
    degraded: { color: 'bg-yellow-500', label: 'Degraded' },
    maintenance: { color: 'bg-blue-500', label: 'Maintenance' }
  };

  const { color, label } = statusConfig[health.status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <span className="text-xs">{label}</span>
      <span className="text-xs text-foreground/50">
        {health.latency}ms
      </span>
    </motion.div>
  );
}