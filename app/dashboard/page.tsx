/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Dashboard page displaying interactive data visualisations with dynamic loading and error handling
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
  Cpu
} from "lucide-react";
import dynamic from 'next/dynamic';
import { VisualisationLoader } from '@/components/visualisation-loader';
import Loading from '../loading';
import { analytics } from '@/lib/analytics';
import { ErrorBoundary } from '@/components/error-boundary';

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

const Visualisations = [
  {
    id: 'ai-consciousness',
    title: 'AI Consciousness',
    description: 'WebGL particle system demonstrating GPU-accelerated rendering with 10,000+ interactive nodes',
    icon: Cpu,
    component: AIConsciousness
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

/**
 * @constructor
 */
export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState(Visualisations[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  /** @constructs */
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * Visualisations.length);
    setSelectedTab(Visualisations[randomIndex].id);

    analytics.trackPageView('/dashboard');
  }, []);

  const handleTabChange = async (id: string) => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);

      // Track Visualisation change
      analytics.trackFeatureUsage('Visualisation_change', { from: selectedTab, to: id });

      // Simulate progressive loading
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Change tab
      setSelectedTab(id);

      // Complete loading after minimum time
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingProgress(100);

      // Cleanup
      clearInterval(loadingInterval);
    } catch (error) {
      analytics.trackError(error as Error, { context: 'Visualisation_change' });
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const selectedViz = Visualisations.find(v => v.id === selectedTab);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
              Data Visualisations Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-foreground/70">
              Explore advanced data visualisations and insights
            </p>
          </div>
        </motion.div>

        {/* Visualisation Tabs */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex flex-nowrap gap-2 min-w-max">
            {Visualisations.map((viz) => {
              const Icon = viz.icon;
              const isSelected = selectedTab === viz.id;
              
              return (
                <motion.button
                  key={viz.id}
                  onClick={() => handleTabChange(viz.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary/30'
                      : 'text-foreground/70 hover:text-matrix-primary hover:bg-matrix-primary/10 border border-transparent'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm whitespace-nowrap">{viz.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Visualisation Display */}
        <ErrorBoundary>
          <motion.div
            layout
            className="relative rounded-lg border border-border bg-card overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold mb-1">{selectedViz?.title}</h2>
                  <p className="text-xs sm:text-sm text-foreground/70">{selectedViz?.description}</p>
                </div>
                {selectedViz && <selectedViz.icon className="w-5 h-5 sm:w-6 sm:h-6 text-matrix-primary" />}
              </div>
            </div>
            
            {/* Loading Progress */}
            {isLoading && loadingProgress > 0 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-matrix-primary/20">
                <motion.div
                  className="h-full bg-matrix-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
            
            {/* Content */}
            <div className="p-4 sm:p-6">
              <Suspense fallback={<VisualisationLoader />}>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loading />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {selectedViz && <selectedViz.component />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Suspense>
            </div>
          </motion.div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
