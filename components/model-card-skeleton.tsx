/**
 * @file model-card-skeleton.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Skeleton loading state for model cards during data fetching.
 */

"use client";

import { motion } from 'framer-motion';

/**
 * @constructor
 */
export function ModelCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full skeleton" />
          <div>
            <div className="h-6 w-32 mb-1 rounded skeleton" />
            <div className="h-4 w-20 rounded skeleton" />
          </div>
        </div>
        <div className="h-6 w-16 rounded-full skeleton" />
      </div>

      {/* Description skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-4 w-3/4 rounded skeleton" />
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2 rounded-lg bg-background/50">
            <div className="h-3 w-16 mb-1 rounded skeleton" />
            <div className="h-6 w-12 rounded skeleton" />
          </div>
        ))}
      </div>

      {/* Capabilities skeleton */}
      <div>
        <div className="h-4 w-20 mb-2 rounded skeleton" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-6 rounded-full skeleton"
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}