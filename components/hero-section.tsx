/**
 * @file hero-section.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Hero section component for landing page with call-to-action elements.
 */

"use client";

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

/**
 * @constructor
 */
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text">
            The Future of AI is Here
          </h1>
          
          <p className="text-xl sm:text-2xl mb-8 text-foreground/80">
            Democratizing artificial intelligence with cutting-edge solutions
          </p>

          <div className="max-w-lg mx-auto p-6 rounded-lg border border-matrix-primary/20 bg-matrix-primary/5 mb-8">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <AlertTriangle className="w-5 h-5 text-matrix-primary" />
              <span className="text-matrix-primary font-semibold">Prototype Version</span>
            </div>
            <p className="text-foreground/80 mb-4">
              Access the demo portal using these credentials:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-matrix-secondary">
                Email: <span className="font-mono">demo@example.com</span>
              </p>
              <p className="text-matrix-secondary">
                Password: <span className="font-mono">demo1234</span>
              </p>
            </div>
          </div>

          <Link
            href="/auth/login"
            className="inline-block px-8 py-3 rounded-lg bg-matrix-primary text-background font-semibold hover:bg-matrix-primary/90 transition-colors"
          >
            Access Portal
          </Link>
        </motion.div>
      </div>
    </section>
  );
}