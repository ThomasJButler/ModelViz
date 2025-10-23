/**
 * @file error-state.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Error state display component showing error messages and recovery actions.
 */

"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

/**
 * @constructor
 */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  showHomeButton = true
}: ErrorStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Animated error icon */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ 
            duration: 0.5,
            delay: 0.2,
            type: "spring",
            stiffness: 100
          }}
          className="relative inline-block mb-6"
        >
          <motion.div
            className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative bg-background rounded-full p-6 border-2 border-red-500/50">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </motion.div>

        {/* Error message */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold mb-2 text-foreground"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-foreground/70 mb-8"
        >
          {description}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-matrix-primary text-background font-medium hover:bg-matrix-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          )}
          
          {showHomeButton && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-matrix-primary text-matrix-primary font-medium hover:bg-matrix-primary/10 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Error details (dev mode) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 rounded-lg bg-background/50 border border-border text-left"
          >
            <p className="text-xs font-mono text-foreground/50">
              Error occurred at: {new Date().toISOString()}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}