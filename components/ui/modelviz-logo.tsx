/**
 * @file modelviz-logo.tsx
 * @author Tom Butler
 * @date 2025-01-24
 * @description ModelViz logo component with animated matrix effect
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ModelVizLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  loading?: boolean;
}

export function ModelVizLogo({
  size = 'md',
  animated = true,
  className = '',
  loading = false
}: ModelVizLogoProps) {
  const sizes = {
    sm: 'h-8 w-8 text-lg',
    md: 'h-12 w-12 text-2xl',
    lg: 'h-16 w-16 text-3xl',
    xl: 'h-24 w-24 text-5xl'
  };

  const sizeClass = sizes[size];

  if (loading) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        {/* Animated loading version */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="relative">
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 bg-matrix-primary/20 rounded-lg blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Main logo */}
            <div className="relative bg-black border-2 border-matrix-primary rounded-lg p-2">
              <div className={`font-mono font-bold ${sizeClass} text-matrix-primary flex items-center justify-center`}>
                <span className="tracking-widest">MV</span>
              </div>
            </div>

            {/* Matrix rain effect */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-px bg-gradient-to-b from-matrix-primary to-transparent"
                  style={{
                    left: `${20 + i * 30}%`,
                    height: '100%'
                  }}
                  animate={{
                    y: [-20, 60],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {animated ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-matrix-primary/20 rounded-lg blur-md" />

          {/* Main logo */}
          <div className="relative bg-black border-2 border-matrix-primary rounded-lg p-2 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
            <div className={`font-mono font-bold ${sizeClass} text-matrix-primary flex items-center justify-center`}>
              <span className="tracking-widest">MV</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          <div className="bg-black border-2 border-matrix-primary rounded-lg p-2">
            <div className={`font-mono font-bold ${sizeClass} text-matrix-primary flex items-center justify-center`}>
              <span className="tracking-widest">MV</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading spinner variant with matrix effect
export function ModelVizSpinner({ size = 'md', className = '' }: Omit<ModelVizLogoProps, 'loading'>) {
  return <ModelVizLogo size={size} className={className} loading={true} />;
}