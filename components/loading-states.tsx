/**
 * @file loading-states.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Loading state components for different loading scenarios and patterns.
 */

"use client";

import { motion } from 'framer-motion';
import { Loader2, Brain, Cpu, Network } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'brain';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

/**
 * @constructor
 */
export function LoadingState({ 
  variant = 'spinner', 
  size = 'md',
  text = 'Loading...'
}: LoadingStateProps) {
  const sizes = {
    sm: { icon: 16, container: 40 },
    md: { icon: 24, container: 60 },
    lg: { icon: 32, container: 80 }
  };

  const currentSize = sizes[size];

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className={`text-matrix-primary`} style={{ width: currentSize.icon, height: currentSize.icon }} />
        </motion.div>
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-foreground/70"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-matrix-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-foreground/70"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative" style={{ width: currentSize.container, height: currentSize.container }}>
          <motion.div
            className="absolute inset-0 bg-matrix-primary/20 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 bg-matrix-primary/30 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="text-matrix-primary" style={{ width: currentSize.icon, height: currentSize.icon }} />
          </div>
        </div>
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-foreground/70"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'brain') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative" style={{ width: currentSize.container, height: currentSize.container }}>
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Network className="w-full h-full text-matrix-primary/20" />
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Brain className="text-matrix-primary" style={{ width: currentSize.icon, height: currentSize.icon }} />
          </motion.div>
        </div>
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-foreground/70"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return null;
}

// Loading overlay component
/**
 * @constructor
 */
export function LoadingOverlay({ 
  isLoading, 
  variant = 'spinner',
  text
}: { 
  isLoading: boolean;
  variant?: LoadingStateProps['variant'];
  text?: string;
}) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <LoadingState variant={variant} size="lg" text={text} />
    </motion.div>
  );
}