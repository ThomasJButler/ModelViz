/**
 * @file loading-animation.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Animated loading indicator component with customisable styles and variants.
 */

"use client";

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

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
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop with maximum blur */}
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/95 backdrop-blur-3xl"
      />
      
      {/* Loading Animation Container */}
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex items-center justify-center"
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute w-64 h-64 rounded-full border-2 border-matrix-primary/20"
          animate={{
            rotate: 360
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />

        {/* Middle rotating ring */}
        <motion.div
          className="absolute w-56 h-56 rounded-full border-2 border-matrix-secondary/30"
          animate={{
            rotate: -360
          }}
          transition={{
            rotate: {
              duration: 2.5,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />

        {/* Progress ring */}
        <svg className="absolute w-48 h-48">
          <motion.circle
            cx="96"
            cy="96"
            r="46"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-matrix-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              onComplete: onLoadingComplete
            }}
          />
        </svg>

        {/* Center icon with glow effect */}
        <motion.div
          className="relative w-40 h-40 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 30px rgba(0, 255, 0, 0.3)",
              "0 0 50px rgba(0, 255, 0, 0.2)",
              "0 0 30px rgba(0, 255, 0, 0.3)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Brain className="w-20 h-20 text-matrix-primary" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}