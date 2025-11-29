/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Epic dashboard with sidebar navigation and comprehensive API analytics
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Zap,
  DollarSign,
  Brain,
  Network,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  ChevronRight
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
import { APIHealthMonitor } from '@/components/dashboard/api-health-monitor';
import { TokenEfficiency } from '@/components/dashboard/token-efficiency';
import { RequestHistory } from '@/components/dashboard/request-history';
import { UsageTrends } from '@/components/dashboard/usage-trends';
import { ModelInsights } from '@/components/dashboard/model-insights';
import { ProviderHealthDashboard } from '@/components/dashboard/provider-health';
import { ModelOutputStats } from '@/components/dashboard/model-output-stats';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-black/50 rounded-lg border border-matrix-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-matrix-primary" />
                  <span className="text-xs text-foreground/60">Total Calls</span>
                </div>
                <p className="text-2xl font-bold text-matrix-primary">
                  {summaryStats.totalCalls.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-black/50 rounded-lg border border-matrix-secondary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-matrix-secondary" />
                  <span className="text-xs text-foreground/60">Avg Latency</span>
                </div>
                <p className="text-2xl font-bold text-matrix-secondary">
                  {summaryStats.avgLatency}ms
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-black/50 rounded-lg border border-matrix-tertiary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-matrix-tertiary" />
                  <span className="text-xs text-foreground/60">Total Cost</span>
                </div>
                <p className="text-2xl font-bold text-matrix-tertiary">
                  ${summaryStats.totalCost.toFixed(2)}
                </p>
              </motion.div>

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
              <div className="flex flex-col divide-y divide-matrix-primary/20">
                {[
                  { label: 'Usage Trends', icon: Activity, view: 'trends', description: 'Usage patterns & growth' },
                  { label: 'Model Insights', icon: Brain, view: 'insights', description: 'Model rankings & efficiency' },
                  { label: 'Provider Health', icon: Network, view: 'health', description: 'Uptime & reliability' },
                ].map((item) => (
                  <motion.button
                    key={item.view}
                    whileHover={{ x: 4, backgroundColor: 'rgba(0, 255, 0, 0.05)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setCurrentView(item.view)}
                    className="py-4 px-2 flex items-center gap-4 text-left transition-colors first:pt-0 last:pb-0"
                  >
                    <div className="p-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary/20">
                      <item.icon className="w-5 h-5 text-matrix-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground/90 block">{item.label}</span>
                      <span className="text-xs text-foreground/50">{item.description}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-matrix-primary/50" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 'trends':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
          >
            <UsageTrends />
          </motion.div>
        );

      case 'insights':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
          >
            <ModelInsights />
          </motion.div>
        );

      case 'health':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
          >
            <ProviderHealthDashboard />
          </motion.div>
        );

      case 'output':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
          >
            <ModelOutputStats />
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
            activeView={currentView}
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
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-matrix-primary mb-2">
                  ModelViz Analytics
                </h1>
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