/**
 * @file loading-animation.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Animated loading indicator component with customisable styles and variants.
 */

"use client";

import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
}

/**
 * @constructor
 */
export function LoadingAnimation({ isLoading, onLoadingComplete }: LoadingAnimationProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      {/* Simple clean loading spinner */}
      <motion.div
        className="w-16 h-16 border-4 border-matrix-primary/20 border-t-matrix-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        onAnimationComplete={onLoadingComplete}
      />
    </motion.div>
  );
}