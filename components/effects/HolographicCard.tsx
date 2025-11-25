/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Holographic card with 3D tilt and glow effects
 */

"use client";

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15 * intensity, -15 * intensity]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15 * intensity, 15 * intensity]);

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
        {/* Holographic glow layer */}
        <motion.div
          className="absolute inset-0 rounded-lg blur-xl opacity-50 pointer-events-none"
          style={interactive ? {
            background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent)`
          } : {
            background: `radial-gradient(circle at ${useTransform(mouseX, [-0.5, 0.5], [0, 100])}% ${useTransform(mouseY, [-0.5, 0.5], [0, 100])}%, ${glowColor}, transparent)`,
            transform: 'translateZ(-20px)'
          }}
        />

        {/* Scan line effect */}
        {intensity > 0 && (
          <motion.div
            className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03) 0px, transparent 1px, transparent 2px, rgba(0, 255, 0, 0.03) 3px)',
              animation: 'scan 8s linear infinite'
            }}
          />
        )}

        {/* Holographic shine */}
        {intensity > 0 && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden"
            style={{
              background: `linear-gradient(135deg,
                transparent 0%,
                ${glowColor} 45%,
                rgba(255, 255, 255, 0.3) 50%,
                ${glowColor} 55%,
                transparent 100%)`,
              backgroundSize: '200% 200%',
              animation: 'holographic 3s ease-in-out infinite'
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes holographic {
          0% { background-position: 0% 50%; opacity: 0.1; }
          50% { background-position: 100% 50%; opacity: 0.3; }
          100% { background-position: 0% 50%; opacity: 0.1; }
        }
      `}</style>
    </motion.div>
  );
}
