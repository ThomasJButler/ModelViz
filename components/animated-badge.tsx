/**
 * @file animated-badge.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Animated badge component for displaying status indicators and notifications.
 */

"use client";

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * @constructor
 */
export function AnimatedBadge({
  children,
  variant = 'default',
  icon: Icon,
  pulse = false,
  size = 'md'
}: AnimatedBadgeProps) {
  const variants = {
    default: 'bg-background/50 border-border text-foreground',
    success: 'bg-matrix-primary/10 border-matrix-primary/30 text-matrix-primary',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
    error: 'bg-red-500/10 border-red-500/30 text-red-500',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-500'
  };

  const glowColors = {
    default: 'rgba(255, 255, 255, 0.1)',
    success: 'rgba(0, 255, 0, 0.3)',
    warning: 'rgba(255, 235, 59, 0.3)',
    error: 'rgba(255, 0, 0, 0.3)',
    info: 'rgba(0, 123, 255, 0.3)'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm transition-all duration-300 ${variants[variant]} ${sizes[size]}`}
      style={{
        boxShadow: pulse ? `0 0 20px ${glowColors[variant]}` : undefined
      }}
    >
      {Icon && (
        <motion.div
          animate={pulse ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon 
            className="opacity-80" 
            style={{ 
              width: iconSizes[size], 
              height: iconSizes[size] 
            }} 
          />
        </motion.div>
      )}
      <span className="font-medium">{children}</span>
      
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColors[variant]}, transparent)`,
          }}
          animate={{
            opacity: [0.5, 0, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.span>
  );
}

// Badge group for multiple badges
/**
 * @constructor
 */
export function BadgeGroup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="flex flex-wrap gap-2"
    >
      {children}
    </motion.div>
  );
}