/**
 * @file demo-banner.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Demo mode banner notification for development and testing environments.
 */

"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * @constructor
 */
export function DemoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-matrix-primary/10 border-b border-matrix-primary/20 py-2"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-matrix-primary" />
            <span className="text-sm text-matrix-primary">
              Portfolio Project - ModelViz
            </span>
          </div>
          <Link
            href="https://github.com/thomasjbutler/modelviz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-matrix-primary hover:text-matrix-secondary transition-colors flex items-center gap-1"
          >
            View Source
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}