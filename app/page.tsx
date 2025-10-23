/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Landing page with animated portal entrance to showcase
 */
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import { LoadingAnimation } from '@/components/loading-animation';
import { MainContent } from '@/components/main-content';

/**
 * Landing page component
 * @constructor
 */
export default function LandingPage() {
  const [isEntering, setIsEntering] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      setShowMainContent(true);
    }, 150);
  };

  if (showMainContent) {
    return <MainContent />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatePresence>
        {!isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="relative w-64 h-64 mx-auto mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-matrix-primary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-matrix-secondary/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-8 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(0, 255, 0, 0.2)",
                      "0 0 40px rgba(0, 255, 0, 0.1)",
                      "0 0 20px rgba(0, 255, 0, 0.2)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Brain className="w-20 h-20 text-matrix-primary" />
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                AI Comparison Showcase
              </motion.h1>

              <motion.p
                className="text-xl sm:text-2xl mb-8 text-foreground/80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Compare Leading AI Models Side by Side
              </motion.p>

              <motion.button
                onClick={handleEnter}
                className="px-8 py-3 text-lg rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary hover:text-background transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Enter Showcase
              </motion.button>

              <motion.p
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-foreground/50 hover:text-matrix-primary transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoadingAnimation isLoading={isEntering} />
    </div>
  );
}