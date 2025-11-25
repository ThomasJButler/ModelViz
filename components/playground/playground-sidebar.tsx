/**
 * @file playground-sidebar.tsx
 * @description Matrix-themed sidebar navigation for the AI Playground
 */

'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  History,
  FileCode2,
  FlaskConical,
  BarChart3,
  GitCompare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Zap,
  Settings,
  BookOpen,
  Layers,
  Timer,
  DollarSign,
  X
} from 'lucide-react';
import { ModelVizLogo } from '@/components/ui/modelviz-logo';

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  onClick?: () => void;
  description?: string;
}

interface PlaygroundSidebarProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
  metrics?: {
    totalTests: number;
    savedTemplates: number;
    activeExperiments: number;
  };
  isOpen?: boolean;
  onClose?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function PlaygroundSidebar({
  onNavigate,
  currentSection = 'playground',
  metrics = { totalTests: 0, savedTemplates: 0, activeExperiments: 0 },
  isOpen = true,
  onClose,
  onCollapseChange
}: PlaygroundSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const router = useRouter();

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const navSections: NavSection[] = [
    {
      id: 'main',
      title: 'Playground',
      items: [
        {
          id: 'playground',
          label: 'Test Models',
          icon: <Brain className="w-5 h-5" />,
          description: 'Interactive AI testing'
        }
      ]
    },
    {
      id: 'navigate',
      title: 'Navigate',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <Layers className="w-5 h-5" />,
          description: 'Overview & metrics',
          onClick: () => router.push('/dashboard')
        },
        {
          id: 'compare',
          label: 'Compare Models',
          icon: <GitCompare className="w-5 h-5" />,
          description: 'Side-by-side comparison',
          onClick: () => router.push('/compare'),
          badge: 'NEW'
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: <BarChart3 className="w-5 h-5" />,
          description: 'Usage & performance',
          onClick: () => router.push('/dashboard')
        },
        {
          id: 'settings',
          label: 'API Settings',
          icon: <Settings className="w-5 h-5" />,
          description: 'Configure providers',
          onClick: () => router.push('/settings')
        }
      ]
    }
  ];

  const handleNavigation = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (onNavigate) {
      onNavigate(item.id);
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
        className={`h-full bg-black/90 border-r border-matrix-primary/20 backdrop-blur-xl relative overflow-hidden z-50
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

        {/* Logo Section */}
        <div className="p-4 border-b border-matrix-primary/20">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: isCollapsed ? 0.9 : 1 }}
            className="flex-1 flex items-center gap-2 min-w-0"
          >
            <div className="flex-shrink-0">
              <Suspense fallback={<div className="h-12 w-12 bg-matrix-primary/20 rounded-lg animate-pulse" />}>
                <ModelVizLogo size="sm" animated={true} />
              </Suspense>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col min-w-0 overflow-hidden"
                >
                  <span className="text-matrix-primary font-bold text-lg truncate">Playground</span>
                  <span className="text-xs text-matrix-primary/60 truncate">AI Command Center</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCollapse}
            className="flex-shrink-0 p-2 rounded-lg border border-matrix-primary/20 bg-black/80
                     hover:bg-matrix-primary/10 transition-colors relative z-10 hidden lg:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-matrix-primary" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-matrix-primary" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {navSections.map((section, sectionIndex) => (
          <div key={section.id}>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="text-xs font-semibold text-matrix-primary/50 uppercase tracking-wider mb-2"
              >
                {section.title}
              </motion.h3>
            )}

            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const isActive = currentSection === item.id;
                const isHovered = hoveredItem === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.05 + itemIndex * 0.02 }}
                  >
                    <motion.button
                      onClick={() => handleNavigation(item)}
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

                      {/* Label and Badge */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="flex-1 flex items-center justify-between"
                          >
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  item.badge === 'NEW'
                                    ? 'bg-matrix-secondary/20 text-matrix-secondary border border-matrix-secondary/30'
                                    : 'bg-matrix-primary/10 text-matrix-primary/70'
                                }`}
                              >
                                {item.badge}
                              </motion.span>
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
                        {item.description && (
                          <div className="text-xs text-foreground/70">{item.description}</div>
                        )}
                        {item.badge && (
                          <div className="mt-2 text-xs text-matrix-secondary">
                            {item.badge === 'NEW' ? 'New Feature!' : `Count: ${item.badge}`}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-matrix-primary/20"
        >
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard')}
              className="w-full px-3 py-2 rounded-lg bg-matrix-primary/5 border border-matrix-primary/20
                       text-matrix-primary hover:bg-matrix-primary/10 transition-colors
                       flex items-center justify-center gap-2 text-sm"
            >
              <Layers className="w-4 h-4" />
              Dashboard
            </motion.button>

            <div className="flex items-center gap-2 text-xs text-foreground/50">
              <Timer className="w-3 h-3" />
              <span>Session: {Math.floor(Math.random() * 45) + 15} min</span>
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

      {/* Sparkle Effects */}
      {!isCollapsed && (
        <div className="absolute top-20 right-4 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-4 h-4 text-matrix-secondary" />
          </motion.div>
        </div>
      )}
    </motion.aside>
    </>
  );
}