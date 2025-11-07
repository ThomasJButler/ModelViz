/**
 * @file enhanced-navigation.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Enhanced navigation component with breadcrumbs and contextual menus.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Brain, 
  Code, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/playground', label: 'Playground', icon: Brain },
  { href: '/models', label: 'Models', icon: Code },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/profile', label: 'Settings', icon: Settings },
];

/**
 * @constructor
 */
export function EnhancedNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  
  // Transform scroll position to navbar background opacity
  const navbarOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const navbarBlur = useTransform(scrollY, [0, 100], [8, 16]);

  /** @constructs */
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        style={{
          backgroundColor: `rgba(var(--background), ${navbarOpacity})`,
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-matrix-primary/20 hidden lg:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Zap className="w-8 h-8 text-matrix-primary" />
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(0,255,0,0)',
                      '0 0 20px rgba(0,255,0,0.5)',
                      '0 0 20px rgba(0,255,0,0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
                ModelViz
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isHovered = hoveredItem === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="relative px-4 py-2 rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Background highlight */}
                      <AnimatePresence>
                        {(isActive || isHovered) && (
                          <motion.div
                            layoutId="nav-highlight"
                            className="absolute inset-0 rounded-lg"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: 1,
                              backgroundColor: isActive 
                                ? 'hsl(var(--primary) / 0.2)' 
                                : 'hsl(var(--primary) / 0.1)'
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Content */}
                      <div className="relative flex items-center space-x-2">
                        <motion.div
                          animate={{
                            rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
                            scale: isActive ? 1.1 : 1
                          }}
                          transition={{ duration: 0.4 }}
                        >
                          <Icon className={`w-5 h-5 transition-colors ${
                            isActive 
                              ? 'text-matrix-primary' 
                              : 'text-foreground/70 group-hover:text-matrix-primary'
                          }`} />
                        </motion.div>
                        <span className={`text-sm font-medium transition-colors ${
                          isActive 
                            ? 'text-matrix-primary' 
                            : 'text-foreground/70'
                        }`}>
                          {item.label}
                        </span>
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-matrix-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: 32 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Sparkle effect on hover */}
                      <AnimatePresence>
                        {isHovered && !isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-1 -right-1"
                          >
                            <Sparkles className="w-3 h-3 text-matrix-primary" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-6 py-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary font-medium overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-matrix-primary/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center gap-2">
                Compare Now
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav
        style={{
          backgroundColor: `rgba(var(--background), ${navbarOpacity})`,
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-matrix-primary/20 lg:hidden"
      >
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-matrix-primary" />
              <span className="text-lg font-bold text-matrix-primary">
                ModelViz
              </span>
            </Link>

            {/* Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg border border-matrix-primary/30 hover:border-matrix-primary/50"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                  >
                    <X className="w-5 h-5 text-matrix-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: -90 }}
                  >
                    <Menu className="w-5 h-5 text-matrix-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-matrix-primary/20 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2 bg-background/95 backdrop-blur-xl">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={item.href}>
                        <motion.div
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? 'bg-matrix-primary/20 text-matrix-primary'
                              : 'hover:bg-matrix-primary/10 text-foreground/70'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="mobile-active"
                              className="ml-auto w-2 h-2 bg-matrix-primary rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            />
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navigationItems.length * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 px-6 py-3 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary font-medium flex items-center justify-center gap-2"
                >
                  Compare Now
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}