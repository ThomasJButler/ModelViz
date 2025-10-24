/**
 * @file rate-limit-indicator.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Rate limit indicator showing API quota usage and remaining capacity.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: Date;
}

/**
 * @constructor
 */
export function RateLimitIndicator() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    remaining: 100,
    limit: 100,
    reset: new Date(Date.now() + 3600000),
  });

  const percentage = (rateLimitInfo.remaining / rateLimitInfo.limit) * 100;
  const timeUntilReset = Math.max(
    0,
    Math.floor((rateLimitInfo.reset.getTime() - Date.now()) / 1000 / 60)
  );

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">API Rate Limit</h3>
        <span className="text-xs text-foreground/50">
          Resets in {timeUntilReset}m
        </span>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-matrix-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-foreground/70">
          {rateLimitInfo.remaining} / {rateLimitInfo.limit} requests
        </span>
        {percentage < 20 && (
          <div className="flex items-center gap-1 text-yellow-500">
            <AlertTriangle className="w-4 h-4" />
            <span>Running low</span>
          </div>
        )}
      </div>
    </div>
  );
}