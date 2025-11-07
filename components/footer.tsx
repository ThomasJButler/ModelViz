/**
 * @file footer.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Application footer component with navigation links and information.
 */

"use client";

import { motion } from 'framer-motion';
import { Github, Twitter, ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * @constructor
 */
export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-foreground/70">Built by </span>
            <Link
              href="https://thomasjbutler.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-matrix-primary hover:text-matrix-secondary transition-colors flex items-center gap-1"
            >
              Thomas J Butler
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://github.com/thomasjbutler/modelviz" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-matrix-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}