/**
 * @file system-status.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description System status component showing health, uptime, and service availability.
 */

"use client";

import { motion } from 'framer-motion';
import { Cpu, MemoryStick as Memory, Network, AlertTriangle } from 'lucide-react';

interface SystemStatusProps {
  metrics: {
    cpu: number;
    memory: number;
    network: number;
    errorRate: number;
  };
}

/**
 * @constructor
 */
export function SystemStatus({ metrics }: SystemStatusProps) {
  const getStatusColor = (value: number) => {
    if (value > 90) return 'text-red-500';
    if (value > 70) return 'text-yellow-500';
    return 'text-matrix-primary';
  };

  const getStatusBg = (value: number) => {
    if (value > 90) return 'bg-red-500/10';
    if (value > 70) return 'bg-yellow-500/10';
    return 'bg-matrix-primary/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-matrix-primary/20 bg-card"
    >
      <h3 className="text-lg font-bold mb-4">System Status</h3>
      <div className="space-y-4">
        {/* CPU Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-foreground/70" />
              <span className="text-sm">CPU Usage</span>
            </div>
            <span className={`text-sm ${getStatusColor(metrics.cpu)}`}>
              {metrics.cpu}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.cpu}%` }}
              className={`h-full ${getStatusBg(metrics.cpu)}`}
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Memory className="w-4 h-4 text-foreground/70" />
              <span className="text-sm">Memory Usage</span>
            </div>
            <span className={`text-sm ${getStatusColor(metrics.memory)}`}>
              {metrics.memory}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.memory}%` }}
              className={`h-full ${getStatusBg(metrics.memory)}`}
            />
          </div>
        </div>

        {/* Network Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-foreground/70" />
              <span className="text-sm">Network Usage</span>
            </div>
            <span className={`text-sm ${getStatusColor(metrics.network)}`}>
              {metrics.network}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.network}%` }}
              className={`h-full ${getStatusBg(metrics.network)}`}
            />
          </div>
        </div>

        {/* Error Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-foreground/70" />
              <span className="text-sm">Error Rate</span>
            </div>
            <span className={`text-sm ${getStatusColor(metrics.errorRate * 100)}`}>
              {(metrics.errorRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.errorRate * 100}%` }}
              className={`h-full ${getStatusBg(metrics.errorRate * 100)}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}