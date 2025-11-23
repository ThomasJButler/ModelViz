/**
 * @file model-performance.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model performance monitoring with radar charts showing accuracy, latency, reliability, and throughput metrics.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { Brain, Zap, Shield, Target } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface PerformanceMetric {
  metric: string;
  value: number;
}

interface ModelInfo {
  id: string;
  name: string;
  icon: typeof Brain;
}

/**
 * @constructor
 */
export function ModelPerformance() {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [performanceData, setPerformanceData] = useState<Record<string, PerformanceMetric[]>>({});
  const [loading, setLoading] = useState(true);

  // Normalize a value to 0-100 scale
  const normalizeValue = (value: number, min: number, max: number, invert: boolean = false): number => {
    const normalized = ((value - min) / (max - min)) * 100;
    return invert ? 100 - normalized : normalized;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('month');

      // Check if we have real model data
      if (Object.keys(aggregated.byModel).length > 0) {
        // Extract models from real data
        const modelList: ModelInfo[] = Object.keys(aggregated.byModel).map((key, index) => {
          const [provider, modelName] = key.split(':');
          const icons = [Brain, Zap, Shield, Target];
          return {
            id: key,
            name: modelName || provider,
            icon: icons[index % icons.length]
          };
        });

        setModels(modelList);

        // Find min/max values for normalization across all models
        const modelStats = Object.values(aggregated.byModel);
        const allLatencies = modelStats.map(m => m.p95Latency || m.avgLatency);
        const allCosts = modelStats.map(m => m.avgCostPerCall);
        const allTokens = modelStats.map(m => m.avgTokensPerCall);

        const minLatency = Math.min(...allLatencies);
        const maxLatency = Math.max(...allLatencies);
        const minCost = Math.min(...allCosts);
        const maxCost = Math.max(...allCosts);
        const minTokens = Math.min(...allTokens);
        const maxTokens = Math.max(...allTokens);

        // Transform to radar chart format with real metrics
        const perfData: Record<string, PerformanceMetric[]> = {};
        Object.entries(aggregated.byModel).forEach(([modelKey, stats]) => {
          const latency = stats.p95Latency || stats.avgLatency;

          perfData[modelKey] = [
            {
              metric: 'Success Rate',
              value: stats.successRate * 100
            },
            {
              metric: 'Speed (p95)',
              value: normalizeValue(latency, minLatency, maxLatency, true) // Invert: lower latency is better
            },
            {
              metric: 'Token Efficiency',
              value: normalizeValue(stats.avgTokensPerCall, minTokens, maxTokens, false)
            },
            {
              metric: 'Cost Efficiency',
              value: normalizeValue(stats.avgCostPerCall, minCost, maxCost, true) // Invert: lower cost is better
            },
            {
              metric: 'Reliability',
              value: (stats.successfulCalls / stats.totalCalls) * 100
            },
            {
              metric: 'Volume',
              value: stats.totalCalls > 0 ? Math.min(100, (stats.totalCalls / Math.max(...modelStats.map(m => m.totalCalls))) * 100) : 0
            }
          ];
        });

        setPerformanceData(perfData);

        // Set first model as selected if none selected
        if (!selectedModel && modelList.length > 0) {
          setSelectedModel(modelList[0].id);
        }
      } else {
        // Fallback to demo data
        const demoModels: ModelInfo[] = [
          { id: 'gpt-4', name: 'GPT-4 Turbo', icon: Brain },
          { id: 'claude-3', name: 'Claude 3', icon: Zap },
          { id: 'llama-3', name: 'LLaMA 3', icon: Shield }
        ];

        setModels(demoModels);

        const demoData = {
          'gpt-4': [
            { metric: 'Accuracy', value: 98 },
            { metric: 'Latency', value: 95 },
            { metric: 'Reliability', value: 99 },
            { metric: 'Throughput', value: 92 },
            { metric: 'Cost Efficiency', value: 85 },
            { metric: 'Scalability', value: 90 }
          ],
          'claude-3': [
            { metric: 'Accuracy', value: 97 },
            { metric: 'Latency', value: 97 },
            { metric: 'Reliability', value: 98 },
            { metric: 'Throughput', value: 94 },
            { metric: 'Cost Efficiency', value: 88 },
            { metric: 'Scalability', value: 92 }
          ],
          'llama-3': [
            { metric: 'Accuracy', value: 96 },
            { metric: 'Latency', value: 98 },
            { metric: 'Reliability', value: 97 },
            { metric: 'Throughput', value: 96 },
            { metric: 'Cost Efficiency', value: 94 },
            { metric: 'Scalability', value: 95 }
          ]
        };

        setPerformanceData(demoData);
        setSelectedModel('gpt-4');
      }

      setLoading(false);
    };

    loadData();

    // Listen for metrics updates
    const handleUpdate = () => loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('metrics-updated', handleUpdate);
      return () => {
        window.removeEventListener('metrics-updated', handleUpdate);
      };
    }
  }, [selectedModel]);

  // Calculate benchmarks from selected model's real data
  const getBenchmarks = () => {
    if (!selectedModel || !performanceData[selectedModel]) {
      return [
        { metric: 'Token Processing', current: 15000, target: 20000, unit: 'tokens/sec' },
        { metric: 'Response Time', current: 120, target: 100, unit: 'ms' },
        { metric: 'Error Rate', current: 0.2, target: 0.1, unit: '%' },
        { metric: 'Memory Usage', current: 85, target: 70, unit: '%' }
      ];
    }

    const metrics = performanceData[selectedModel];
    const successRate = metrics.find(m => m.metric === 'Success Rate')?.value || 0;
    const reliability = metrics.find(m => m.metric === 'Reliability')?.value || 0;

    return [
      { metric: 'Success Rate', current: successRate, target: 100, unit: '%' },
      { metric: 'Speed Score', current: metrics.find(m => m.metric === 'Speed (p95)')?.value || 0, target: 100, unit: 'score' },
      { metric: 'Error Rate', current: 100 - reliability, target: 0, unit: '%', invert: true },
      { metric: 'Efficiency', current: metrics.find(m => m.metric === 'Cost Efficiency')?.value || 0, target: 100, unit: 'score' }
    ];
  };

  const benchmarks = getBenchmarks();

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {models.map(model => {
          const Icon = model.icon;
          const isSelected = model.id === selectedModel;

          return (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedModel(model.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isSelected
                  ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary'
                  : 'border border-border hover:border-matrix-primary/50 text-foreground/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{model.name}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Performance Metrics</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceData[selectedModel as keyof typeof performanceData]}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="metric" stroke="#666" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#00ff00"
                  fill="#00ff00"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Performance Benchmarks</h4>
          <div className="space-y-6">
            {benchmarks.map(benchmark => {
              const progress = (benchmark.current / benchmark.target) * 100;
              const isGood = 'invert' in benchmark && benchmark.invert
                ? benchmark.current <= benchmark.target
                : benchmark.current >= benchmark.target * 0.8; // 80% of target is good

              return (
                <div key={benchmark.metric} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">{benchmark.metric}</span>
                    <span className="text-matrix-primary">
                      {benchmark.current.toFixed(1)} / {benchmark.target} {benchmark.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, progress)}%` }}
                      className={`h-full ${
                        isGood ? 'bg-matrix-primary' : 'bg-matrix-tertiary'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Optimisation Target',
            value: '+15%',
            description: 'Performance headroom available',
            icon: Target,
            colour: 'text-matrix-primary'
          },
          {
            title: 'Peak Performance',
            value: '98.5%',
            description: 'Maximum efficiency achieved',
            icon: Zap,
            colour: 'text-matrix-secondary'
          },
          {
            title: 'Reliability Score',
            value: 'A+',
            description: 'System stability rating',
            icon: Shield,
            colour: 'text-matrix-tertiary'
          }
        ].map((insight) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.title}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${insight.colour}`} />
                <div>
                  <h4 className="font-medium text-foreground/70">{insight.title}</h4>
                  <p className={`text-2xl font-bold ${insight.colour}`}>{insight.value}</p>
                  <p className="text-sm text-foreground/50 mt-1">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
