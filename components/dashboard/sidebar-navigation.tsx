/**
 * @file sidebar-navigation.tsx
 * @description Sidebar navigation component for the dashboard with matrix-themed design
 */

'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
  X,
  History,
  Lightbulb,
  HeartPulse
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard',
    description: 'Main dashboard overview'
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: <Zap className="w-5 h-5" />,
    path: '/dashboard/performance',
    description: 'API performance metrics'
  },
  {
    id: 'cost',
    label: 'Cost Analysis',
    icon: <DollarSign className="w-5 h-5" />,
    path: '/dashboard/cost',
    description: 'Cost tracking & projections'
  },
  {
    id: 'trends',
    label: 'Usage Trends',
    icon: <TrendingUp className="w-5 h-5" />,
    path: '/dashboard/trends',
    description: 'Usage patterns & growth'
  },
  {
    id: 'insights',
    label: 'Model Insights',
    icon: <Lightbulb className="w-5 h-5" />,
    path: '/dashboard/insights',
    description: 'Model rankings & efficiency'
  },
  {
    id: 'output',
    label: 'Output Stats',
    icon: <Sparkles className="w-5 h-5" />,
    path: '/dashboard/output',
    description: 'Words, tokens & response metrics'
  },
  {
    id: 'health',
    label: 'Provider Health',
    icon: <HeartPulse className="w-5 h-5" />,
    path: '/dashboard/health',
    description: 'Uptime & reliability'
  },
  {
    id: 'history',
    label: 'Request History',
    icon: <History className="w-5 h-5" />,
    path: '/dashboard/history',
    description: 'Detailed request logs'
  }
];

interface SidebarNavigationProps {
  onNavigate?: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
  activeView?: string;
}

export function SidebarNavigation({ onNavigate, isOpen = true, onClose, onCollapseChange, activeView }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -300 }}
        animate={{
          x: isOpen ? 0 : -300,
          width: isCollapsed ? 80 : 280
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`h-full bg-black/90 border-r border-matrix-primary/20 backdrop-blur-xl relative z-50
                   ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
      {/* Mobile close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary/20
                   text-matrix-primary hover:bg-matrix-primary/20 transition-colors lg:hidden z-50"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Collapse Toggle */}
      <div className="p-4 border-b border-matrix-primary/20">
        <div className="flex items-center justify-center">
          <button
            onClick={handleCollapse}
            className="p-2 rounded-lg border border-matrix-primary/20 bg-black/80
                     hover:bg-matrix-primary/10 transition-colors hidden lg:flex items-center justify-center"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-matrix-primary" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-matrix-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navItems.map((item, index) => {
          // Use activeView prop if provided (for in-page navigation), otherwise use pathname
          const isActive = activeView
            ? (item.id === activeView || (item.id === 'overview' && activeView === 'overview'))
            : (pathname === item.path || (item.path === '/dashboard' && pathname === '/dashboard'));
          const isHovered = hoveredItem === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <motion.button
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg transition-all relative
                  ${isActive
                    ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary/30'
                    : 'text-foreground/70 hover:text-matrix-primary hover:bg-matrix-primary/5'
                  }
                `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-matrix-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon with glow effect */}
                <div className={`relative ${isActive ? 'text-matrix-primary' : ''}`}>
                  {item.icon}
                  {isActive && (
                    <div className="absolute inset-0 blur-md opacity-50">
                      {item.icon}
                    </div>
                  )}
                </div>

                {/* Label and Description */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium">{item.label}</div>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-foreground/50 mt-1"
                        >
                          {item.description}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.button>

              {/* Tooltip for collapsed state */}
              {isCollapsed && isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
                           bg-black/95 border border-matrix-primary/30 rounded-lg p-3
                           shadow-[0_0_20px_rgba(0,255,0,0.2)]"
                  style={{ minWidth: '200px' }}
                >
                  <div className="font-medium text-matrix-primary mb-1">{item.label}</div>
                  <div className="text-xs text-foreground/70">{item.description}</div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Section - Stats Summary */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-matrix-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-matrix-secondary" />
            <span className="text-xs text-foreground/70">System Status</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-matrix-primary/5 rounded-lg">
              <div className="text-xs text-foreground/50">APIs Active</div>
              <div className="text-sm font-bold text-matrix-primary">4</div>
            </div>
            <div className="p-2 bg-matrix-secondary/5 rounded-lg">
              <div className="text-xs text-foreground/50">Success Rate</div>
              <div className="text-sm font-bold text-matrix-secondary">98.5%</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Matrix Rain Effect Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 -z-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-matrix-primary/0 via-matrix-primary to-matrix-primary/0"
            style={{
              left: `${20 + i * 20}%`,
              height: '100%'
            }}
            animate={{
              y: ['-100%', '100%']
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.5
            }}
          />
        ))}
      </div>
    </motion.aside>
    </>
  );
}