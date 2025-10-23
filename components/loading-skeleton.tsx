/**
 * @file loading-skeleton.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Skeleton loading placeholders for content that is being fetched.
 */

"use client";

import { motion } from 'framer-motion';

/**
 * @constructor
 */
export function LoadingSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-3">
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-8 bg-muted rounded-lg w-3/4"
        />
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-4 bg-muted rounded-lg w-1/2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className="h-48 bg-muted rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}