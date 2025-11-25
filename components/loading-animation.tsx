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
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Transparent backdrop - allows background animation to show through */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/10 backdrop-blur-sm"
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

        {/* Hexagon animation from homepage */}
        <motion.div className="relative w-64 h-64">
          {/* Outer hexagonal frame */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 90,25 90,75 50,95 10,75 10,25"
                fill="none"
                stroke="url(#gradient1-loader)"
                strokeWidth="0.5"
                className="opacity-60"
              />
              <defs>
                <linearGradient id="gradient1-loader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ff00" />
                  <stop offset="100%" stopColor="#00ffff" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Middle hexagonal frame */}
          <motion.div
            className="absolute inset-8"
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 90,25 90,75 50,95 10,75 10,25"
                fill="none"
                stroke="url(#gradient2-loader)"
                strokeWidth="0.8"
                className="opacity-70"
              />
              <defs>
                <linearGradient id="gradient2-loader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ffff" />
                  <stop offset="100%" stopColor="#00ff00" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Inner glowing core */}
          <motion.div
            className="absolute inset-16 rounded-full bg-gradient-to-br from-matrix-primary/20 to-matrix-secondary/20 backdrop-blur-sm flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 30px rgba(0, 255, 0, 0.3)",
                "0 0 60px rgba(0, 255, 255, 0.5)",
                "0 0 30px rgba(0, 255, 0, 0.3)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Orbiting particles */}
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-matrix-primary"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-4px',
                  marginTop: '-4px'
                }}
                animate={{
                  rotate: [angle, angle + 360],
                  x: [0, Math.cos((angle * Math.PI) / 180) * 40, 0],
                  y: [0, Math.sin((angle * Math.PI) / 180) * 40, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.3
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}