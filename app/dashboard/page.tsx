/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Unified dashboard page combining visualizations and analytics with 20/80 layout
 */
"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  LineChart,
  Network,
  Activity,
  Zap,
  Shield,
  Boxes,
  Trees as TreeStructure,
  Sparkles,
  Atom,
  EuroIcon as Neurons,
  Cpu,
  Layers,
  DollarSign,
  TrendingUp,
  BarChart,
  Clock,
  AlertTriangle,
  BarChart3,
  Menu,
  X,
  EyeOff
} from "lucide-react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { VisualisationLoader } from '@/components/visualisation-loader';
import Loading from '../loading';
import { analytics } from '@/lib/analytics';
import { ErrorBoundary } from '@/components/error-boundary';
import { APIPerformanceRealtime } from '@/components/dashboard/api-performance-realtime';
import { ProviderDistribution } from '@/components/dashboard/provider-distribution';
import { CostTrackingChart } from '@/components/dashboard/cost-tracking-chart';
import { ModelUsageOverview } from '@/components/dashboard/model-usage-overview';
import { MetricsService } from '@/lib/services/MetricsService';
import { getConfiguredProviders } from '@/lib/storage/apiKeyStorage';
import Link from 'next/link';
import { Key } from 'lucide-react';

// Dynamically import Visualisation components with loading states
const AdvancedChart = dynamic(() => import('@/components/visualisations/advanced-chart'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const DataFlowDiagram = dynamic(() => import('@/components/visualisations/data-flow'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const NetworkGraph = dynamic(() => import('@/components/visualisations/network-graph'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const EnhancedNetworkGraph = dynamic(() => import('@/components/visualisations/enhanced-network-graph'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const RealTimeMetrics = dynamic(() => import('@/components/visualisations/real-time-metrics'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const DataCleaner = dynamic(() => import('@/components/visualisations/scientific/data-cleaner'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const ModelEvolution = dynamic(() => import('@/components/visualisations/scientific/model-evolution'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const ResourceTree = dynamic(() => import('@/components/visualisations/resource-tree'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const ParticleUniverse = dynamic(() => import('@/components/visualisations/particle-universe'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const QuantumField = dynamic(() => import('@/components/visualisations/quantum-field'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const NeuralFlow = dynamic(() => import('@/components/visualisations/neural-flow'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const AIConsciousness = dynamic(() => import('@/components/visualisations/ai-consciousness'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const AIThoughtStream = dynamic(() => import('@/components/visualisations/ai-thought-stream'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const LatentSpaceExplorer = dynamic(() => import('@/components/visualisations/latent-space-explorer'), {
  loading: () => <VisualisationLoader />,
  ssr: false
});

// Dynamically import Analytics components
const UsagePatterns = dynamic(() => import('@/components/analytics/usage-patterns').then(mod => ({ default: mod.UsagePatterns })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const ResourceUtilization = dynamic(() => import('@/components/analytics/resource-utilization').then(mod => ({ default: mod.ResourceUtilization })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const CostAnalysisComponent = dynamic(() => import('@/components/analytics/cost-analysis').then(mod => ({ default: mod.CostAnalysis })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const PredictiveTrends = dynamic(() => import('@/components/analytics/predictive-trends').then(mod => ({ default: mod.PredictiveTrends })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const ModelPerformance = dynamic(() => import('@/components/analytics/model-performance').then(mod => ({ default: mod.ModelPerformance })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const SecurityInsights = dynamic(() => import('@/components/analytics/security-insights').then(mod => ({ default: mod.SecurityInsights })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const APIGateway = dynamic(() => import('@/components/analytics/api-gateway').then(mod => ({ default: mod.APIGateway })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const SystemHealth = dynamic(() => import('@/components/analytics/system-health').then(mod => ({ default: mod.SystemHealth })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const AIScorecard = dynamic(() => import('@/components/analytics/ai-scorecard').then(mod => ({ default: mod.AIScorecard })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const NeuralActivityMap = dynamic(() => import('@/components/analytics/neural-activity-map').then(mod => ({ default: mod.NeuralActivityMap })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const ModelComparisonComponent = dynamic(() => import('@/components/analytics/model-comparison').then(mod => ({ default: mod.ModelComparison })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});
const TokenUsageHeatmap = dynamic(() => import('@/components/analytics/token-usage-heatmap').then(mod => ({ default: mod.TokenUsageHeatmap })), {
  loading: () => <VisualisationLoader />,
  ssr: false
});

const Visualisations = [
  {
    id: 'api-overview',
    title: 'API Overview',
    description: 'Real-time API performance metrics showing your actual AI model usage, costs, and latency',
    icon: Activity,
    component: () => (
      <div className="space-y-6">
        <APIPerformanceRealtime />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProviderDistribution />
          <ModelUsageOverview />
        </div>
      </div>
    )
  },
  {
    id: 'cost-analysis',
    title: 'Cost Analysis',
    description: 'Track your AI API spending with daily breakdowns and monthly projections',
    icon: DollarSign,
    component: CostTrackingChart
  },
  {
    id: 'ai-consciousness',
    title: 'AI Consciousness',
    description: 'WebGL particle system demonstrating GPU-accelerated rendering with 10,000+ interactive nodes',
    icon: Cpu,
    component: AIConsciousness
  },
  {
    id: 'ai-thought-stream',
    title: 'AI Thought Stream',
    description: 'Canvas-based flowing consciousness visualization with branching thoughts across NLP, vision, logic & creativity domains',
    icon: Brain,
    component: AIThoughtStream
  },
  {
    id: 'latent-space',
    title: 'Latent Space Explorer',
    description: '3D semantic space navigation with concept clusters, mouse-controlled camera, and starfield background effects',
    icon: Layers,
    component: LatentSpaceExplorer
  },
  {
    id: 'particle-universe',
    title: 'Particle Universe',
    description: 'Three.js 3D scene with physics-based particle interactions and mouse-responsive gravity fields',
    icon: Sparkles,
    component: ParticleUniverse
  },
  {
    id: 'api-network',
    title: 'API Provider Network',
    description: 'D3.js force-directed graph showing API provider relationships with 24 nodes and dynamic connections',
    icon: Network,
    component: EnhancedNetworkGraph
  },
  {
    id: 'quantum-field',
    title: 'Quantum Field',
    description: 'Canvas-based wave interference simulation with real-time magnetic field interaction physics',
    icon: Atom,
    component: QuantumField
  },
  {
    id: 'neural-flow',
    title: 'Neural Flow',
    description: 'Animated neural network (4-6-6-3 architecture) showing forward propagation with weighted connections',
    icon: Neurons,
    component: NeuralFlow
  },
  {
    id: 'advanced-chart',
    title: 'Model Response Times',
    description: 'Recharts area chart tracking 24-hour response time trends for GPT-4, Claude, DeepSeek & Perplexity',
    icon: LineChart,
    component: AdvancedChart
  },
  {
    id: 'data-flow',
    title: 'Data Flow',
    description: 'SVG-based animated pipeline showing data transformation stages with throughput and latency metrics',
    icon: Activity,
    component: DataFlowDiagram
  },
  {
    id: 'network-graph',
    title: 'Network Analysis',
    description: 'D3.js simulation with Barnes-Hut approximation for efficient multi-body collision detection',
    icon: Network,
    component: NetworkGraph
  },
  {
    id: 'real-time',
    title: 'AI Performance Metrics',
    description: 'Recharts line graph with 1-second updates showing token consumption, API throughput, and success rates',
    icon: Zap,
    component: RealTimeMetrics
  },
  {
    id: 'data-cleaner',
    title: 'Data Privacy Scanner',
    description: 'Pattern recognition demo detecting PII (SSN, credit cards, API keys) with Framer Motion animations',
    icon: Shield,
    component: DataCleaner
  },
  {
    id: 'model-evolution',
    title: 'Neural Network',
    description: 'Animated network topology evolution showing layer formation and connection pruning over time',
    icon: Brain,
    component: ModelEvolution
  },
  {
    id: 'resource-tree',
    title: 'Resource Tree',
    description: 'D3.js collapsible tree diagram visualising hierarchical resource allocation and dependencies',
    icon: TreeStructure,
    component: ResourceTree
  }
];

const Analytics = [
  {
    id: 'usage-patterns',
    title: 'Usage Patterns',
    description: 'Token consumption trends with heatmap visualization for peak usage periods',
    icon: LineChart,
    component: UsagePatterns,
    category: 'analytics'
  },
  {
    id: 'token-heatmap',
    title: 'Token Usage Heatmap',
    description: 'Hourly token usage patterns across the week',
    icon: Activity,
    component: TokenUsageHeatmap,
    category: 'analytics'
  },
  {
    id: 'model-performance',
    title: 'Model Performance',
    description: 'Comparing metrics across different AI models with real performance data',
    icon: Brain,
    component: ModelPerformance,
    category: 'analytics'
  },
  {
    id: 'model-comparison',
    title: 'Model Comparison',
    description: 'Side-by-side comparison of model performance and costs',
    icon: BarChart3,
    component: ModelComparisonComponent,
    category: 'analytics'
  },
  {
    id: 'resource-utilization',
    title: 'Resource Utilization',
    description: 'CPU, memory, network, and storage allocation with detailed breakdowns',
    icon: BarChart,
    component: ResourceUtilization,
    category: 'analytics'
  },
  {
    id: 'cost-analysis-detailed',
    title: 'Cost Analysis',
    description: 'Tracking inference, training, and storage costs with optimization recommendations',
    icon: Clock,
    component: CostAnalysisComponent,
    category: 'analytics'
  },
  {
    id: 'predictive-trends',
    title: 'Predictive Trends',
    description: 'Forecast combining historical data with predictions and confidence intervals',
    icon: AlertTriangle,
    component: PredictiveTrends,
    category: 'analytics'
  },
  {
    id: 'api-gateway',
    title: 'API Gateway',
    description: 'Request volume, endpoint latency, and error rate distribution across API routes',
    icon: Network,
    component: APIGateway,
    category: 'analytics'
  },
  {
    id: 'security-insights',
    title: 'Security Insights',
    description: 'Monitoring security events with threat categorization and severity tracking',
    icon: Shield,
    component: SecurityInsights,
    category: 'analytics'
  },
  {
    id: 'system-health',
    title: 'System Health',
    description: 'Real-time graphs displaying CPU, memory, disk, and network utilization',
    icon: Activity,
    component: SystemHealth,
    category: 'analytics'
  },
  {
    id: 'ai-scorecard',
    title: 'AI F1 Score',
    description: 'Tracking precision, recall, F1 score, and accuracy trends',
    icon: BarChart3,
    component: AIScorecard,
    category: 'analytics'
  },
  {
    id: 'neural-activity',
    title: 'Neural Activity Map',
    description: '3D visualization with pulse waves and particle effects showing neural network activity',
    icon: Layers,
    component: NeuralActivityMap,
    category: 'analytics'
  }
];

/**
 * @constructor
 */
export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'visualizations' | 'analytics'>('visualizations');
  const [selectedItem, setSelectedItem] = useState<string>('api-overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalCalls: 0,
    avgLatency: 0,
    totalCost: 0,
    successRate: 0
  });

  /** @constructs */
  useEffect(() => {
    // Check for API keys
    const checkApiKeys = () => {
      const configuredProviders = getConfiguredProviders();
      setHasApiKeys(configuredProviders.length > 0);
    };

    // Load summary stats
    const loadStats = async () => {
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');

      console.log('[Dashboard] Summary stats:', {
        totalCalls: aggregated.totalCalls,
        avgLatency: aggregated.avgLatency,
        totalCost: aggregated.totalCost,
        successRate: aggregated.successRate,
        providers: Object.keys(aggregated.byProvider).length,
        models: Object.keys(aggregated.byModel).length
      });

      setSummaryStats({
        totalCalls: aggregated.totalCalls,
        avgLatency: Math.round(aggregated.avgLatency),
        totalCost: aggregated.totalCost,
        successRate: aggregated.successRate * 100
      });
    };

    checkApiKeys();
    loadStats();
    analytics.trackPageView('/dashboard');

    // Listen for metrics updates
    const handleUpdate = () => loadStats();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  const handleItemToggle = (id: string) => {
    setSelectedItem(id);
    analytics.trackFeatureUsage('item_toggle', { id, viewMode });
  };

  const handleViewModeChange = (mode: 'visualizations' | 'analytics') => {
    setViewMode(mode);
    // Reset selection when switching view modes
    setSelectedItem(mode === 'visualizations' ? 'api-overview' : 'usage-patterns');
    analytics.trackFeatureUsage('view_mode_change', { mode });
  };

  const currentItems = viewMode === 'visualizations' ? Visualisations : Analytics;
  const visibleItem = currentItems.find(item => item.id === selectedItem);

  return (
    <div className="min-h-screen pt-16">
      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-border">
        <div className="max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <Image
                src="/modelviz.png"
                alt="ModelViz Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
                  AI API Dashboard
                </h1>
                <p className="text-sm text-foreground/70">
                  Real-time API metrics and interactive visualizations
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-background/50 rounded-lg border border-border">
              <button
                onClick={() => handleViewModeChange('visualizations')}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === 'visualizations'
                    ? 'bg-matrix-primary/20 text-matrix-primary'
                    : 'text-foreground/70 hover:text-matrix-primary'
                }`}
              >
                Visualizations
              </button>
              <button
                onClick={() => handleViewModeChange('analytics')}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === 'analytics'
                    ? 'bg-matrix-primary/20 text-matrix-primary'
                    : 'text-foreground/70 hover:text-matrix-primary'
                }`}
              >
                Analytics
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Data Status Banner */}
      {!hasApiKeys && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-r from-matrix-primary/10 to-matrix-secondary/10 border-b border-matrix-primary/30"
        >
          <div className="max-w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-matrix-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-matrix-primary mb-1">
                  No Data Yet
                </h3>
                <p className="text-xs text-foreground/70">
                  Add your API keys in Settings, then make a test call in the Playground to see real metrics here
                </p>
              </div>
            </div>
            <Link href="/settings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-matrix-primary text-background rounded-lg text-sm font-medium hover:bg-matrix-primary/90 transition-colors whitespace-nowrap"
              >
                Configure API Keys
              </motion.button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Has API Keys but No Usage */}
      {hasApiKeys && summaryStats.totalCalls === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-r from-blue-500/10 to-matrix-primary/10 border-b border-blue-500/30"
        >
          <div className="max-w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-500 mb-1">
                  Ready to Track Real Data
                </h3>
                <p className="text-xs text-foreground/70">
                  Visit the Playground to start making API calls and see your real metrics here
                </p>
              </div>
            </div>
            <Link href="/playground">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                Go to Playground →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-border bg-background/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-full grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'API Calls', value: summaryStats.totalCalls || 0, icon: Activity, color: 'text-matrix-primary' },
            { label: 'Avg Latency', value: `${summaryStats.avgLatency || 0}ms`, icon: Zap, color: 'text-matrix-secondary' },
            { label: 'Total Cost', value: `$${summaryStats.totalCost.toFixed(2)}`, icon: DollarSign, color: 'text-matrix-tertiary' },
            { label: 'Success Rate', value: `${summaryStats.successRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-green-500' }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-lg border border-matrix-primary/20 bg-background"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-foreground/70">{stat.label}</span>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Main Layout with Sidebar and Content */}
      <div className="flex h-[calc(100vh-13rem)]">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-background rounded-lg border border-border"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Left Sidebar - 20% */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -300 }}
          className={`${
            sidebarOpen ? 'fixed' : 'hidden lg:block'
          } lg:relative w-72 lg:w-1/5 h-full bg-background border-r border-border overflow-y-auto z-40`}
        >
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4 text-foreground/70">
              {viewMode === 'visualizations' ? 'Available Visualizations' : 'Analytics Components'}
            </h3>

            <div className="space-y-2">
              {currentItems.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedItem === item.id;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-matrix-primary bg-matrix-primary/10'
                        : 'border-border hover:border-matrix-primary/50'
                    }`}
                    onClick={() => handleItemToggle(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-matrix-primary" />
                          <span className="text-sm font-medium">{item.title}</span>
                        </div>
                        <p className="text-xs text-foreground/60 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.aside>

        {/* Right Content - 80% */}
        <main className="flex-1 lg:w-4/5 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {!visibleItem ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <EyeOff className="w-12 h-12 text-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Component Selected</h3>
                <p className="text-sm text-foreground/60">
                  Select a component from the sidebar to display it here
                </p>
              </div>
            ) : (() => {
              const Component = visibleItem.component;
              return (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={visibleItem.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="border border-border rounded-lg bg-card overflow-hidden"
                  >
                    <div className="p-4 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{visibleItem.title}</h3>
                          <p className="text-xs text-foreground/70">{visibleItem.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <ErrorBoundary>
                        <Suspense fallback={<VisualisationLoader />}>
                          <Component />
                        </Suspense>
                      </ErrorBoundary>
                    </div>
                  </motion.div>
                </AnimatePresence>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
