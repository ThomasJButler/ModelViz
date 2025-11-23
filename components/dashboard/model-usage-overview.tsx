/**
 * @file model-usage-overview.tsx
 * @description Overview of AI models being used with performance metrics
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, DollarSign, Activity } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface ModelMetrics {
  modelKey: string;
  provider: string;
  model: string;
  calls: number;
  avgLatency: number;
  successRate: number;
  totalCost: number;
  avgCost: number;
}

export function ModelUsageOverview() {
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');

      console.log('[ModelUsageOverview] Aggregated data:', {
        models: Object.keys(aggregated.byModel),
        totalCalls: aggregated.totalCalls,
        totalCost: aggregated.totalCost
      });

      if (Object.keys(aggregated.byModel).length > 0) {
        // Real data
        const modelMetrics: ModelMetrics[] = Object.entries(aggregated.byModel).map(([key, stats]) => {
          const [provider, model] = key.split(':');
          return {
            modelKey: key,
            provider,
            model: model || provider,
            calls: stats.totalCalls,
            avgLatency: Math.round(stats.avgLatency),
            successRate: stats.successRate * 100,
            totalCost: stats.totalCost,
            avgCost: stats.avgCostPerCall
          };
        });

        // Sort by usage
        modelMetrics.sort((a, b) => b.calls - a.calls);
        console.log('[ModelUsageOverview] Using real data:', modelMetrics.length, 'models');
        setModels(modelMetrics);
      } else {
        console.log('[ModelUsageOverview] Using demo data - no models available');
        // Demo data
        const demoModels: ModelMetrics[] = [
          {
            modelKey: 'OpenAI:gpt-4-turbo',
            provider: 'OpenAI',
            model: 'gpt-4-turbo',
            calls: 245,
            avgLatency: 1450,
            successRate: 98.8,
            totalCost: 8.50,
            avgCost: 0.0347
          },
          {
            modelKey: 'Anthropic:claude-3-sonnet',
            provider: 'Anthropic',
            model: 'claude-3-sonnet',
            calls: 180,
            avgLatency: 1320,
            successRate: 99.2,
            totalCost: 6.20,
            avgCost: 0.0344
          },
          {
            modelKey: 'OpenAI:gpt-3.5-turbo',
            provider: 'OpenAI',
            model: 'gpt-3.5-turbo',
            calls: 156,
            avgLatency: 890,
            successRate: 99.5,
            totalCost: 2.10,
            avgCost: 0.0135
          },
          {
            modelKey: 'DeepSeek:deepseek-chat',
            provider: 'DeepSeek',
            model: 'deepseek-chat',
            calls: 98,
            avgLatency: 1580,
            successRate: 97.1,
            totalCost: 0.85,
            avgCost: 0.0087
          }
        ];
        setModels(demoModels);
      }

      setLoading(false);
    };

    loadData();

    // Listen for metrics updates
    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Brain className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary">AI Models in Use</h3>
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <Brain className="w-4 h-4" />
          <span>{models.length} models</span>
        </div>
      </div>

      {models.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/50 mb-2">No API calls yet</p>
          <p className="text-sm text-foreground/30">Start using the Playground to see your models here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((model, index) => (
            <motion.div
              key={model.modelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50 hover:bg-matrix-primary/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-matrix-primary">{model.model}</h4>
                  <p className="text-xs text-foreground/50">{model.provider}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    model.successRate > 98 ? 'bg-green-500' :
                    model.successRate > 95 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-foreground/70">
                    {model.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3 text-foreground/50" />
                    <span className="text-xs text-foreground/50">Calls</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{model.calls}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-foreground/50" />
                    <span className="text-xs text-foreground/50">Latency</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{model.avgLatency}ms</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-foreground/50" />
                    <span className="text-xs text-foreground/50">Total</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">${model.totalCost.toFixed(2)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-foreground/50" />
                    <span className="text-xs text-foreground/50">Per Call</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">${model.avgCost.toFixed(4)}</p>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mt-3">
                <div className="h-1 bg-background rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(model.calls / models[0].calls) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-matrix-primary"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary */}
      {models.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-foreground/70 mb-1">Total Calls</p>
            <p className="text-lg font-bold text-matrix-primary">
              {models.reduce((sum, m) => sum + m.calls, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-foreground/70 mb-1">Avg Latency</p>
            <p className="text-lg font-bold text-matrix-secondary">
              {Math.round(models.reduce((sum, m) => sum + m.avgLatency, 0) / models.length)}ms
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-foreground/70 mb-1">Total Cost</p>
            <p className="text-lg font-bold text-matrix-tertiary">
              ${models.reduce((sum, m) => sum + m.totalCost, 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
