/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Holographic card with 3D tilt and glow effects
 */

"use client";

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { useEffectsEnabled } from '@/hooks/use-media-query';

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glowColor?: string;
  interactive?: boolean; // If true, disables 3D transforms for clickable content
}

export function HolographicCard({
  children,
  className = '',
  intensity = 1,
  glowColor = 'rgba(0, 255, 0, 0.5)',
  interactive = false
}: HolographicCardProps) {
  // All hooks must be called before any conditional returns
  const effectsEnabled = useEffectsEnabled();
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // These hooks must be called unconditionally
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15 * intensity, -15 * intensity]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15 * intensity, 15 * intensity]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  // Mobile fallback - render simple container without effects
  if (!effectsEnabled) {
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      {...(!interactive && {
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave
      })}
      style={!interactive ? {
        perspective: 1000,
        transformStyle: 'preserve-3d'
      } : undefined}
    >
      <motion.div
        className="relative"
        style={!interactive ? {
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Subtle glow layer */}
        <motion.div
          className="absolute inset-0 rounded-lg blur-xl opacity-30 pointer-events-none"
          style={interactive ? {
            background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent)`
          } : {
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor}, transparent)`,
            transform: 'translateZ(-20px)'
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
