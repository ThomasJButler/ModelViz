/**
 * @file visualisation-loader.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Visualisation loader component for loading and displaying data visualisations.
 */

"use client";

import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

/**
 * @constructor
 */
export function VisualisationLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-24 flex items-center justify-center bg-card/50 backdrop-blur rounded-lg border border-matrix-primary/20"
    >
      <div className="relative flex items-center gap-4">
        {/* Rotating rings */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-matrix-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-matrix-secondary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Icon container */}
          <motion.div
            className="relative w-12 h-12 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(0, 255, 0, 0.3)",
                "0 0 40px rgba(0, 255, 0, 0.2)",
                "0 0 20px rgba(0, 255, 0, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Alternating icons */}
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="absolute"
            >
              <Brain className="w-6 h-6 text-matrix-primary" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="absolute"
            >
              <Sparkles className="w-6 h-6 text-matrix-secondary" />
            </motion.div>
          </motion.div>
        </div>

        {/* Loading text */}
        <motion.span
          className="text-matrix-primary font-medium"
          animate={{ opacity: [0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          Loading Visualisation...
        </motion.span>
      </div>
    </motion.div>
  );
}