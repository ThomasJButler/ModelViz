/**
 * @file visualisation-loader.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Visualisation loader component for loading and displaying data visualisations.
 */

"use client";

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

/**
 * @constructor
 */
export function VisualisationLoader() {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-black/50 backdrop-blur rounded-lg border border-matrix-primary/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.9, 1.1, 0.9],
          rotateZ: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Glow effect behind the brain */}
        <motion.div
          className="absolute inset-0 blur-3xl"
          animate={{
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Brain className="w-20 h-20 text-matrix-primary" />
        </motion.div>

        {/* Main brain icon */}
        <Brain className="w-20 h-20 text-matrix-primary relative z-10" />

        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-matrix-primary rounded-full"
            style={{
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [0, 40 * Math.cos(i * 120 * Math.PI / 180), 0],
              y: [0, 40 * Math.sin(i * 120 * Math.PI / 180), 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}