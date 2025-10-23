/**
 * @file animated-progress.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Animated progress bar component with customisable transitions and colours.
 */

"use client";

import { motion } from 'framer-motion';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * @constructor
 */
export function AnimatedProgress({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'primary',
  size = 'md'
}: AnimatedProgressProps) {
  const percentage = (value / max) * 100;
  
  const colors = {
    primary: 'bg-matrix-primary',
    secondary: 'bg-matrix-secondary',
    tertiary: 'bg-matrix-tertiary'
  };
  
  const sizes = {
    sm: { height: 'h-1', text: 'text-xs' },
    md: { height: 'h-2', text: 'text-sm' },
    lg: { height: 'h-3', text: 'text-base' }
  };
  
  const currentSize = sizes[size];
  const currentColor = colors[color];

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className={`${currentSize.text} text-foreground/70`}>
              {label}
            </span>
          )}
          {showValue && (
            <motion.span
              key={value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${currentSize.text} font-mono text-foreground/90`}
            >
              {value}/{max}
            </motion.span>
          )}
        </div>
      )}
      
      <div className={`relative w-full ${currentSize.height} bg-background/50 rounded-full overflow-hidden border border-border`}>
        {/* Background shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        {/* Progress bar */}
        <motion.div
          className={`absolute inset-y-0 left-0 ${currentColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 1,
            ease: "easeOut",
            delay: 0.2
          }}
        >
          {/* Glow effect at the end */}
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 ${currentColor} blur-xl opacity-50`} />
        </motion.div>
        
        {/* Animated stripes */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.1) 10px,
              rgba(255, 255, 255, 0.1) 20px
            )`,
            backgroundSize: '40px 40px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px']
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  );
}

// Circular progress variant
/**
 * @constructor
 */
export function CircularProgress({
  value,
  max = 100,
  size = 60,
  strokeWidth = 4,
  color = 'primary',
  showValue = true
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'tertiary';
  showValue?: boolean;
}) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colors = {
    primary: 'text-matrix-primary',
    secondary: 'text-matrix-secondary',
    tertiary: 'text-matrix-tertiary'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={colors[color]}
          initial={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference
          }}
          animate={{
            strokeDashoffset
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: 0.2
          }}
          style={{
            strokeDasharray: circumference,
            filter: 'drop-shadow(0 0 6px currentColor)'
          }}
        />
      </svg>
      
      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm font-mono text-foreground/90">
            {Math.round(percentage)}%
          </span>
        </motion.div>
      )}
    </div>
  );
}