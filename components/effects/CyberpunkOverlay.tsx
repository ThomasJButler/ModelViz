/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Cyberpunk aesthetic overlay with glitch effects
 */

"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CyberpunkOverlayProps {
  intensity?: number; // 0-1
  enableGlitch?: boolean;
  enableScanlines?: boolean;
  enableVignette?: boolean;
}

export function CyberpunkOverlay({
  intensity = 0.5,
  enableGlitch = true,
  enableScanlines = true,
  enableVignette = true
}: CyberpunkOverlayProps) {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    if (!enableGlitch) return;

    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 100);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, [enableGlitch]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Scanlines */}
      {enableScanlines && (
        <div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03) 0px, transparent 1px, transparent 2px, rgba(0, 255, 0, 0.03) 3px)',
            opacity: intensity * 0.3
          }}
        />
      )}

      {/* Vignette */}
      {enableVignette && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
            opacity: intensity * 0.4
          }}
        />
      )}

      {/* Glitch effect */}
      {enableGlitch && glitchActive && (
        <>
          <motion.div
            className="absolute inset-0 mix-blend-screen"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: [0, -10, 10, 0]
            }}
            transition={{ duration: 0.1 }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.2), transparent)'
            }}
          />
          <motion.div
            className="absolute inset-0 mix-blend-screen"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.1, delay: 0.05 }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent)'
            }}
          />
        </>
      )}

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-matrix-primary/50" />
      <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-matrix-primary/50" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-matrix-primary/50" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-matrix-primary/50" />

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-matrix-primary to-transparent"
        animate={{
          y: ['-100%', 'calc(100vh + 100%)']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.4)',
          opacity: intensity * 0.5
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          opacity: intensity * 0.2
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat'
        }}
      />
    </div>
  );
}
