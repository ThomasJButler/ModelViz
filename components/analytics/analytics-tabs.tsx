/**
 * @file analytics-tabs.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Analytics dashboard tab navigation component for switching between different analytics views.
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, Network, Activity, LineChart, BarChart, Clock, AlertTriangle, Target, BarChart as ChartBar, Layers } from 'lucide-react';
import { UsagePatterns } from './usage-patterns';
import { ResourceUtilization } from './resource-utilization';
import { CostAnalysis } from './cost-analysis';
import { PredictiveTrends } from './predictive-trends';
import { RetentionMetrics } from './retention-metrics';
import { AlertsOverview } from './alerts-overview';
import { ModelPerformance } from './model-performance';
import { SecurityInsights } from './security-insights';
import { APIGateway } from './api-gateway';
import { SystemHealth } from './system-health';
import { ModelComparison } from './model-comparison';
import { AIScorecard } from './ai-scorecard';
import { NeuralActivityMap } from './neural-activity-map';

const tabs = [
  {
    id: 'usage',
    label: 'Usage Patterns',
    icon: LineChart,
    component: UsagePatterns,
    description: 'Recharts area charts showing token consumption trends with heatmap visualisation for peak usage periods'
  },
  {
    id: 'resources',
    label: 'Resource Utilisation',
    icon: BarChart,
    component: ResourceUtilization,
    description: 'Recharts pie charts displaying CPU, memory, network, and storage allocation with detailed breakdowns'
  },
  {
    id: 'costs',
    label: 'Cost Analysis',
    icon: Clock,
    component: CostAnalysis,
    description: 'Recharts stacked bar charts tracking inference, training, and storage costs with optimisation recommendations'
  },
  {
    id: 'predictions',
    label: 'Predictive Trends',
    icon: AlertTriangle,
    component: PredictiveTrends,
    description: 'Recharts dual-line forecast combining 24h historical data with 12h predictions and confidence intervals'
  },
  {
    id: 'performance',
    label: 'Model Performance',
    icon: Brain,
    component: ModelPerformance,
    description: 'Recharts radar charts comparing 6 metrics (accuracy, latency, reliability, throughput, cost, scalability) across GPT-4, Claude, and LLaMA'
  },
  {
    id: 'comparison',
    label: 'Model Comparison',
    icon: Target,
    component: ModelComparison,
    description: 'Multi-model radar chart overlay for side-by-side performance analysis across 6 key dimensions'
  },
  {
    id: 'f1score',
    label: 'AI F1 Score',
    icon: ChartBar,
    component: AIScorecard,
    description: 'Recharts time series tracking precision, recall, F1 score, and accuracy trends with confusion matrix data'
  },
  {
    id: 'security',
    label: 'Security Insights',
    icon: Shield,
    component: SecurityInsights,
    description: 'Recharts area chart monitoring security events with threat categorisation and severity tracking'
  },
  {
    id: 'api',
    label: 'API Gateway',
    icon: Network,
    component: APIGateway,
    description: 'Dual charts showing request volume, endpoint latency (ms), and error rate distribution across 4 API routes'
  },
  {
    id: 'health',
    label: 'System Health',
    icon: Activity,
    component: SystemHealth,
    description: 'Real-time Recharts line graphs with 2-second updates displaying CPU, memory, disk, and network utilisation'
  },
  {
    id: 'neural-map',
    label: 'Neural Activity Map',
    icon: Layers,
    component: NeuralActivityMap,
    description: 'Canvas-based 3D visualisation of neural network layer activations with real-time neuron firing patterns and data flow animation'
  }
];

/**
 * @constructor
 */
export function AnalyticsTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary'
                  : 'border border-border hover:border-matrix-primary/50 text-foreground/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tabs.map((tab) => {
          if (tab.id === activeTab) {
            const Component = tab.component;
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 p-3 rounded-lg bg-matrix-primary/5 border border-matrix-primary/20">
                  <p className="text-sm text-foreground/70">{tab.description}</p>
                </div>
                <Component />
              </motion.div>
            );
          }
          return null;
        })}
      </AnimatePresence>
    </div>
  );
}
