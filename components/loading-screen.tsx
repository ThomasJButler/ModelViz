/**
 * @file loading-screen.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Full-screen loading component with branding and progress indicators.
 */

"use client";

import { motion } from 'framer-motion';

/**
 * @constructor
 */
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Matrix-style loading animation */}
        <div className="w-16 h-16 relative">
          <motion.span
            className="absolute inset-0 border-2 border-matrix-primary rounded-lg"
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.span
            className="absolute inset-0 border-2 border-matrix-secondary rounded-lg"
            animate={{
              rotate: -360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: 0.2
            }}
          />
          <motion.span
            className="absolute inset-0 border-2 border-matrix-tertiary rounded-lg"
            animate={{
              rotate: 360,
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: 0.4
            }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-foreground/70 text-sm"
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}