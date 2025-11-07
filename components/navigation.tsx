/**
 * @file navigation.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Primary navigation component with routing and menu management.
 */

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal, LineChart, Code, Brain, Play as Playground, BookOpen, Layout } from 'lucide-react';

/**
 * @constructor
 */
export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: Layout },
    { href: '/models', label: 'Models', icon: Brain },
    { href: '/playground', label: 'Playground', icon: Playground },
    { href: '/analytics', label: 'Analytics', icon: LineChart },
    { href: '/docs', label: 'Documentation', icon: Code },
  ];

  return (
    <nav 
      className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center space-x-2 px-2 text-matrix-primary hover:text-matrix-secondary transition-colors"
              aria-label="ModelViz Home"
            >
              <Brain className="w-8 h-8" aria-hidden="true" />
              <span className="text-xl font-bold tracking-tight">ModelViz</span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center space-x-2 text-sm text-foreground/80 hover:text-matrix-primary transition-colors duration-200"
                aria-label={label}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <button
            className="sm:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <div className="space-y-2">
              <span className={`block w-8 h-0.5 bg-foreground transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
              <span className={`block w-8 h-0.5 bg-foreground transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-8 h-0.5 bg-foreground transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        id="mobile-menu"
        className="sm:hidden"
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { height: 'auto', opacity: 1 },
          closed: { height: 0, opacity: 0 }
        }}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="mobile-menu-button"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center space-x-2 px-3 py-2 text-base text-foreground/80 hover:text-matrix-primary transition-colors duration-200"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </nav>
  );
}
