/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Epic dashboard with sidebar navigation and comprehensive API analytics
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useEffectsEnabled, useIsMobile } from "@/hooks/use-media-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Zap,
  DollarSign,
  TrendingUp,
  Brain,
  Network,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  BarChart3,
  GitCompare
} from "lucide-react";
import dynamic from 'next/dynamic';
import { analytics } from '@/lib/analytics';
import { ErrorBoundary } from '@/components/error-boundary';
import { MetricsService } from '@/lib/services/MetricsService';
import { getConfiguredProviders } from '@/lib/storage/apiKeyStorage';
import Link from 'next/link';

// Import new dashboard components
import { SidebarNavigation } from '@/components/dashboard/sidebar-navigation';
import { APIPerformanceRealtime } from '@/components/dashboard/api-performance-realtime';
import { CostTrackingChart } from '@/components/dashboard/cost-tracking-chart';
import { ModelUsageOverview } from '@/components/dashboard/model-usage-overview';
import { ProviderDistribution } from '@/components/dashboard/provider-distribution';
import { RealTimeStream } from '@/components/dashboard/real-time-stream';
import { ProviderComparison } from '@/components/dashboard/provider-comparison';
import { APIHealthMonitor } from '@/components/dashboard/api-health-monitor';
import { TokenEfficiency } from '@/components/dashboard/token-efficiency';
import { RequestTimeline } from '@/components/dashboard/request-timeline';
import { RateLimits } from '@/components/dashboard/rate-limits';
import { ErrorAnalysis } from '@/components/dashboard/error-analysis';
import { RequestHistory } from '@/components/dashboard/request-history';

// Import epic visualization components
import { MatrixRain } from '@/components/effects/MatrixRain';
import { ParticleField } from '@/components/effects/ParticleField';
import { HolographicCard } from '@/components/effects/HolographicCard';
import { FloatingMetrics } from '@/components/3d/FloatingMetrics';
import { DataStream3D } from '@/components/dashboard/DataStream3D';

// Dynamically import 3D components
const NetworkGraph3D = dynamic(() => import('@/components/3d/NetworkGraph3D').then(mod => ({ default: mod.NetworkGraph3D })), {
  loading: () => <div className="flex items-center justify-center h-64"><Network className="w-20 h-20 text-matrix-primary animate-pulse" /></div>,
  ssr: false
});

// Dynamically import Analytics components
const UsagePatterns = dynamic(() => import('@/components/analytics/usage-patterns').then(mod => ({ default: mod.UsagePatterns })), {
  loading: () => <div className="flex items-center justify-center h-64"><Brain className="w-20 h-20 text-matrix-primary animate-pulse" /></div>,
  ssr: false
});

const ModelPerformance = dynamic(() => import('@/components/analytics/model-performance').then(mod => ({ default: mod.ModelPerformance })), {
  loading: () => <div className="flex items-center justify-center h-64"><Brain className="w-20 h-20 text-matrix-primary animate-pulse" /></div>,
  ssr: false
});

const CostAnalysis = dynamic(() => import('@/components/analytics/cost-analysis').then(mod => ({ default: mod.CostAnalysis })), {
  loading: () => <div className="flex items-center justify-center h-64"><Brain className="w-20 h-20 text-matrix-primary animate-pulse" /></div>,
  ssr: false
});

interface SummaryStats {
  totalCalls: number;
  avgLatency: number;
  totalCost: number;
  successRate: number;
  providersActive: number;
  modelsUsed: number;
}

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState('overview');
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalCalls: 0,
    avgLatency: 0,
    totalCost: 0,
    successRate: 0,
    providersActive: 0,
    modelsUsed: 0
  });
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [userEffectsPreference, setUserEffectsPreference] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if effects should be enabled (disabled on mobile or reduced motion)
  const effectsEnabled = useEffectsEnabled();
  const showEffects = effectsEnabled && userEffectsPreference;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Check if user has API keys configured
  const checkApiKeys = useCallback(() => {
    const configuredProviders = getConfiguredProviders();
    setHasApiKeys(configuredProviders.length > 0);
  }, []);

  // Load summary stats
  const loadStats = useCallback(async () => {
    const service = MetricsService.getInstance();
    const aggregated = await service.getAggregatedMetrics('week');

    setSummaryStats({
      totalCalls: aggregated.totalCalls,
      avgLatency: Math.round(aggregated.avgLatency),
      totalCost: aggregated.totalCost,
      successRate: aggregated.successRate * 100,
      providersActive: Object.keys(aggregated.byProvider).length || 4,
      modelsUsed: Object.keys(aggregated.byModel).length || 8
    });
  }, []);

  useEffect(() => {
    checkApiKeys();
    loadStats();
    analytics.trackPageView('/dashboard');

    // Listen for metrics updates
    const handleUpdate = () => loadStats();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, [checkApiKeys, loadStats]);

  const handleViewChange = (path: string) => {
    // Extract view from path (e.g., /dashboard/real-time -> real-time)
    const view = path === '/dashboard' ? 'overview' : path.split('/').pop() || 'overview';
    setCurrentView(view);
    analytics.trackFeatureUsage('dashboard_view_change', { view });
  };

  // Render different views based on currentView (mobile always shows overview)
  const activeView = isMobile ? 'overview' : currentView;

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Summary Stats Cards Only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <HolographicCard intensity={0.7} glowColor="rgba(0, 255, 0, 0.5)">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-black/50 rounded-lg border border-matrix-primary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-matrix-primary" />
                    <span className="text-xs text-foreground/60">Total Calls</span>
                  </div>
                  <motion.p
                    className="text-2xl font-bold text-matrix-primary"
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(0, 255, 0, 0.5)',
                        '0 0 20px rgba(0, 255, 0, 0.8)',
                        '0 0 10px rgba(0, 255, 0, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {summaryStats.totalCalls.toLocaleString()}
                  </motion.p>
                </motion.div>
              </HolographicCard>

              <HolographicCard intensity={0.7} glowColor="rgba(0, 255, 255, 0.5)">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-black/50 rounded-lg border border-matrix-secondary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-matrix-secondary" />
                    <span className="text-xs text-foreground/60">Avg Latency</span>
                  </div>
                  <motion.p
                    className="text-2xl font-bold text-matrix-secondary"
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(0, 255, 255, 0.5)',
                        '0 0 20px rgba(0, 255, 255, 0.8)',
                        '0 0 10px rgba(0, 255, 255, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  >
                    {summaryStats.avgLatency}ms
                  </motion.p>
                </motion.div>
              </HolographicCard>

              <HolographicCard intensity={0.7} glowColor="rgba(255, 0, 255, 0.5)">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-black/50 rounded-lg border border-matrix-tertiary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-matrix-tertiary" />
                    <span className="text-xs text-foreground/60">Total Cost</span>
                  </div>
                  <motion.p
                    className="text-2xl font-bold text-matrix-tertiary"
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(255, 0, 255, 0.5)',
                        '0 0 20px rgba(255, 0, 255, 0.8)',
                        '0 0 10px rgba(255, 0, 255, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  >
                    ${summaryStats.totalCost.toFixed(2)}
                  </motion.p>
                </motion.div>
              </HolographicCard>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-black/50 rounded-lg border border-green-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  {summaryStats.successRate >= 95 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : summaryStats.successRate >= 80 ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-foreground/60">Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  {summaryStats.successRate.toFixed(1)}%
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-black/50 rounded-lg border border-purple-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-foreground/60">Providers</span>
                </div>
                <p className="text-2xl font-bold text-purple-500">
                  {summaryStats.providersActive}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-black/50 rounded-lg border border-cyan-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs text-foreground/60">Models</span>
                </div>
                <p className="text-2xl font-bold text-cyan-500">
                  {summaryStats.modelsUsed}
                </p>
              </motion.div>
            </div>

            {/* Quick Navigation to Views */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <h3 className="text-lg font-semibold text-matrix-primary mb-4">Quick Navigation</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Real-Time', icon: Activity, view: 'real-time' },
                  { label: 'Performance', icon: Zap, view: 'performance' },
                  { label: 'Cost Analysis', icon: DollarSign, view: 'cost' },
                  { label: 'Compare', icon: GitCompare, view: 'compare' },
                  { label: 'Network', icon: Network, view: 'network' },
                ].map((item) => (
                  <motion.button
                    key={item.view}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentView(item.view)}
                    className="p-3 bg-matrix-primary/5 hover:bg-matrix-primary/10 rounded-lg border border-matrix-primary/20 transition-colors flex flex-col items-center gap-2"
                  >
                    <item.icon className="w-5 h-5 text-matrix-primary" />
                    <span className="text-sm text-foreground/80">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 'real-time':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <DataStream3D />
          </motion.div>
        );

      case 'performance':
        return (
          <div className="grid grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <APIPerformanceRealtime />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <APIHealthMonitor />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <TokenEfficiency />
            </motion.div>
          </div>
        );

      case 'cost':
        return (
          <div className="grid grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <CostTrackingChart />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <CostAnalysis />
            </motion.div>
          </div>
        );

      case 'compare':
        return (
          <div className="grid grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <ProviderComparison />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <ModelUsageOverview />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <ProviderDistribution />
            </motion.div>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, rotateY: -10 }}
              animate={{ opacity: 1, rotateY: 0 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <h2 className="text-2xl font-bold text-matrix-primary mb-4 flex items-center gap-3">
                <Network className="w-6 h-6" />
                3D Network Visualization
              </h2>
              <NetworkGraph3D />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FloatingMetrics />
            </motion.div>
          </div>
        );

      case 'insights':
        return (
          <div className="grid grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <UsagePatterns />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
            >
              <RequestTimeline />
            </motion.div>
          </div>
        );

      case 'rate-limits':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
          >
            <RateLimits />
          </motion.div>
        );

      case 'errors':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
          >
            <ErrorAnalysis />
          </motion.div>
        );

      case 'history':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
          >
            <RequestHistory />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black overflow-x-hidden">
      {/* Epic Background Effects - Very Subtle - Show on all devices */}
      {showEffects && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <MatrixRain intensity={0.05} speed={0.3} fontSize={10} color="#00ff00" />
          <ParticleField particleCount={25} color="#00ff00" connectionDistance={60} />
        </div>
      )}

      {/* Animated Background - Very Subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-matrix-primary/[0.02] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-matrix-secondary/[0.02] rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-matrix-tertiary/[0.02] rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 lg:flex">
        {/* Desktop Sidebar Navigation - hidden on mobile for simplified experience */}
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-20 hidden lg:block">
          <SidebarNavigation
            onNavigate={handleViewChange}
            isOpen={true}
            onCollapseChange={setSidebarCollapsed}
          />
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 min-w-0 w-full transition-all duration-300 px-2 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-20 pb-20 lg:pb-8 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'
        }`}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-matrix-primary mb-2 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
                  <span>ModelViz Analytics</span>
                </h1>
                <p className="text-sm md:text-base text-foreground/60">
                  The magnum opus of API visualization and analytics
                </p>
              </div>

              {/* API Keys Alert */}
              {!hasApiKeys && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        No API keys configured
                      </p>
                      <Link
                        href="/settings"
                        className="text-xs underline hover:text-yellow-700 dark:hover:text-yellow-300"
                      >
                        Add keys in Settings
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Dynamic Content Area - Mobile always shows overview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}