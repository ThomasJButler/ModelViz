/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Loading state with animated skeleton placeholders
 */
"use client";

import { motion } from 'framer-motion';
import { Brain, LineChart, Network, Activity } from 'lucide-react';

/**
 * Loading component
 * @constructor
 */
export default function Loading() {
  const placeholderCards = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    icon: [Brain, LineChart, Network, Activity][i % 4]
  }));

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="h-10 w-3/4 bg-matrix-primary/10 rounded-lg mb-2 animate-pulse" />
          <div className="h-6 w-1/2 bg-matrix-primary/5 rounded-lg animate-pulse" />
        </motion.div>

        <div className="mb-8 flex flex-wrap gap-2">
          {placeholderCards.map(({ id, icon: Icon }) => (
            <div
              key={id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-matrix-primary/10 bg-matrix-primary/5 animate-pulse"
            >
              <Icon className="w-4 h-4 text-matrix-primary/30" />
              <div className="h-4 w-20 bg-matrix-primary/10 rounded" />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-border bg-card overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-matrix-primary/10 rounded animate-pulse" />
                <div className="h-4 w-64 bg-matrix-primary/5 rounded animate-pulse" />
              </div>
              <div className="h-6 w-6 rounded bg-matrix-primary/10 animate-pulse" />
            </div>
          </div>

          <div className="p-6">
            <div className="h-[400px] bg-matrix-primary/5 rounded-lg animate-pulse flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-matrix-primary/30"
              >
                <Brain className="w-16 h-16" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}