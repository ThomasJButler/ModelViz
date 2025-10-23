/**
 * @file enhanced-loading.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Enhanced loading component with animated progress indicators and skeleton screens.
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Brain, Zap, Code, Network } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EnhancedLoadingProps {
  message?: string;
  submessages?: string[];
  showProgress?: boolean;
  variant?: 'default' | 'minimal' | 'matrix' | 'ai';
}

/**
 * @constructor
 */
export function EnhancedLoading({ 
  message = "Processing your request", 
  submessages = [
    "Initializing AI models...",
    "Analyzing input parameters...",
    "Generating response...",
    "Optimizing output..."
  ],
  showProgress = true,
  variant = 'default'
}: EnhancedLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  /** @constructs */
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % submessages.length);
    }, 2000);

    const progressInterval = showProgress ? setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500) : undefined;

    return () => {
      clearInterval(messageInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [submessages.length, showProgress]);

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-matrix-primary" />
        </motion.div>
      </div>
    );
  }

  if (variant === 'matrix') {
    return (
      <div className="relative flex items-center justify-center p-12">
        {/* Matrix rain effect background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-matrix-primary font-mono text-xs"
              initial={{ y: -20, x: `${i * 5}%` }}
              animate={{ y: '100%' }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            >
              {Math.random().toString(2).substring(2, 8)}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Network className="w-full h-full text-matrix-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold text-matrix-primary mb-2">{message}</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-foreground/60"
            >
              {submessages[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (variant === 'ai') {
    const icons = [Brain, Zap, Code, Sparkles];
    const Icon = icons[currentMessageIndex % icons.length];

    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6">
        <motion.div className="relative w-24 h-24">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-matrix-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-matrix-secondary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-4 flex items-center justify-center"
            >
              <Icon className="w-8 h-8 text-matrix-primary" />
            </motion.div>
          </AnimatePresence>

          {/* Orbiting dots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-matrix-primary rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0'
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3,
                delay: i * 1,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div 
                className="w-2 h-2 bg-matrix-primary rounded-full"
                style={{ transform: `translate(-50%, -50%) translateX(${40}px)` }}
              />
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
            {message}
          </h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-sm text-foreground/60"
            >
              {submessages[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {showProgress && (
          <div className="w-64 space-y-2">
            <div className="h-2 bg-card rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-matrix-primary to-matrix-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-center text-foreground/40">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16"
        >
          <Loader2 className="w-full h-full text-matrix-primary" />
        </motion.div>
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-matrix-primary/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold">{message}</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-foreground/60"
          >
            {submessages[currentMessageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="loading-dots flex gap-1">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}