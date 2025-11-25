/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Landing page with animated portal entrance to showcase
 */
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingAnimation } from '@/components/loading-animation';

/**
 * Landing page component
 * @constructor
 */
export default function LandingPage() {
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 150);
  };

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
                {/* Outer hexagonal frame */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon
                      points="50,5 90,25 90,75 50,95 10,75 10,25"
                      fill="none"
                      stroke="url(#gradient1)"
                      strokeWidth="0.5"
                      className="opacity-60"
                    />
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ff00" />
                        <stop offset="100%" stopColor="#00ffff" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* Middle hexagonal frame */}
                <motion.div
                  className="absolute inset-8"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon
                      points="50,5 90,25 90,75 50,95 10,75 10,25"
                      fill="none"
                      stroke="url(#gradient2)"
                      strokeWidth="0.8"
                      className="opacity-70"
                    />
                    <defs>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ffff" />
                        <stop offset="100%" stopColor="#00ff00" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* Inner glowing core */}
                <motion.div
                  className="absolute inset-16 rounded-full bg-gradient-to-br from-matrix-primary/20 to-matrix-secondary/20 backdrop-blur-sm flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 30px rgba(0, 255, 0, 0.3)",
                      "0 0 60px rgba(0, 255, 255, 0.5)",
                      "0 0 30px rgba(0, 255, 0, 0.3)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Orbiting particles */}
                  {[0, 120, 240].map((angle, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-matrix-primary"
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: '-4px',
                        marginTop: '-4px'
                      }}
                      animate={{
                        rotate: [angle, angle + 360],
                        x: [0, Math.cos((angle * Math.PI) / 180) * 40, 0],
                        y: [0, Math.sin((angle * Math.PI) / 180) * 40, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                ModelViz
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