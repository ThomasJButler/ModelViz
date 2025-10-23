/**
 * @file analytics-tabs.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Analytics dashboard tab navigation component for switching between different analytics views.
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, Network, Activity, LineChart, BarChart, Clock, AlertTriangle, Target, BarChart as ChartBar } from 'lucide-react';
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

const tabs = [
  {
    id: 'usage',
    label: 'Usage Patterns',
    icon: LineChart,
    component: UsagePatterns,
    description: 'Analyse usage patterns and trends'
  },
  {
    id: 'resources',
    label: 'Resource Utilisation',
    icon: BarChart,
    component: ResourceUtilization,
    description: 'Monitor system resource usage'
  },
  {
    id: 'costs',
    label: 'Cost Analysis',
    icon: Clock,
    component: CostAnalysis,
    description: 'Track and optimise costs'
  },
  {
    id: 'predictions',
    label: 'Predictive Trends',
    icon: AlertTriangle,
    component: PredictiveTrends,
    description: 'AI-powered usage predictions'
  },
  {
    id: 'performance',
    label: 'Model Performance',
    icon: Brain,
    component: ModelPerformance,
    description: 'Monitor and analyse model performance metrics'
  },
  {
    id: 'comparison',
    label: 'Model Comparison',
    icon: Target,
    component: ModelComparison,
    description: 'Compare different model capabilities'
  },
  {
    id: 'f1score',
    label: 'AI F1 Score',
    icon: ChartBar,
    component: AIScorecard,
    description: 'Detailed AI model evaluation metrics'
  },
  {
    id: 'security',
    label: 'Security Insights',
    icon: Shield,
    component: SecurityInsights,
    description: 'Track security events and system vulnerabilities'
  },
  {
    id: 'api',
    label: 'API Gateway',
    icon: Network,
    component: APIGateway,
    description: 'Monitor API traffic and endpoint performance'
  },
  {
    id: 'health',
    label: 'System Health',
    icon: Activity,
    component: SystemHealth,
    description: 'Track overall system health and performance'
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
