/**
 * @author Tom Butler
 * @date 2025-11-25
 * @description Mobile bottom navigation bar for improved mobile UX
 */

"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard,
  Play,
  MoreHorizontal,
  Settings,
  BookOpen,
  Info,
  User,
  X
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    href: '/playground',
    label: 'Playground',
    icon: <Play className="w-5 h-5" />
  },
  {
    href: '/about',
    label: 'About',
    icon: <Info className="w-5 h-5" />
  }
];

const moreMenuItems: NavItem[] = [
  {
    href: '/profile',
    label: 'Profile',
    icon: <User className="w-5 h-5" />
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />
  },
  {
    href: 'https://github.com/ThomasJButler/ModelViz',
    label: 'Documentation',
    icon: <BookOpen className="w-5 h-5" />
  }
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname?.startsWith('/dashboard')) return true;
    if (href === '/playground' && pathname?.startsWith('/playground')) return true;
    return pathname === href;
  };

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowMoreMenu(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-16 left-4 right-4 z-50 lg:hidden"
            >
              <div className="bg-background/95 backdrop-blur-xl border border-matrix-primary/30 rounded-2xl overflow-hidden shadow-2xl shadow-matrix-primary/20">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-matrix-primary/20">
                  <span className="text-matrix-primary font-mono text-sm">More Options</span>
                  <button
                    onClick={() => setShowMoreMenu(false)}
                    className="p-1 hover:bg-matrix-primary/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground/60" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {moreMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      onClick={() => setShowMoreMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-matrix-primary/10 transition-all group"
                    >
                      <span className="text-matrix-primary group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="text-foreground font-mono text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-matrix-primary/20" />

        {/* Safe area padding for notched devices */}
        <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[72px]"
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-matrix-primary/15 rounded-xl"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}

                {/* Icon */}
                <motion.span
                  className={`relative z-10 transition-colors ${
                    active ? 'text-matrix-primary' : 'text-foreground/60'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {item.icon}
                </motion.span>

                {/* Label */}
                <span
                  className={`relative z-10 text-[10px] font-mono transition-colors ${
                    active ? 'text-matrix-primary' : 'text-foreground/50'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active dot */}
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 w-1 h-1 bg-matrix-primary rounded-full shadow-lg shadow-matrix-primary/50"
                  />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[72px]"
          >
            {showMoreMenu && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-matrix-primary/15 rounded-xl"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}

            <motion.span
              className={`relative z-10 transition-colors ${
                showMoreMenu ? 'text-matrix-primary' : 'text-foreground/60'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal className="w-5 h-5" />
            </motion.span>

            <span
              className={`relative z-10 text-[10px] font-mono transition-colors ${
                showMoreMenu ? 'text-matrix-primary' : 'text-foreground/50'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
