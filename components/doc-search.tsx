/**
 * @file doc-search.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Documentation search component with fuzzy matching and keyboard navigation.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Command } from 'lucide-react';

/**
 * @constructor
 */
export function DocSearch() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative max-w-2xl mx-auto"
    >
      <div
        className={`relative rounded-lg border ${
          isFocused ? 'border-matrix-primary shadow-glow' : 'border-border'
        } transition-all duration-200`}
      >
        <input
          type="text"
          placeholder="Search documentation..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-4 py-3 pl-10 bg-card rounded-lg focus:outline-none"
        />
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-foreground/50" />
        <kbd className="absolute right-3 top-3 px-2 py-1 text-xs rounded bg-muted text-foreground/70 hidden sm:flex items-center gap-1">
          <Command className="w-3 h-3" /> K
        </kbd>
      </div>
    </motion.div>
  );
}