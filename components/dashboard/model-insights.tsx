/**
 * @file model-insights.tsx
 * @description Model performance insights - rankings, efficiency, and comparisons
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface ModelStats {
  model: string;
  provider: string;
  calls: number;
  avgLatency: number;
  successRate: number;
  totalTokens: number;
  totalCost: number;
  efficiency: number; // tokens per dollar
}

export function ModelInsights() {
  const [modelStats, setModelStats] = useState<ModelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'calls' | 'efficiency' | 'latency'>('calls');

  const providerColors: Record<string, string> = {
    OpenAI: '#10B981',
    Anthropic: '#8B5CF6',
    Perplexity: '#06B6D4',
    Google: '#3B82F6',
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');

      if (Object.keys(aggregated.byModel).length > 0) {
        // Real data
        const stats: ModelStats[] = Object.entries(aggregated.byModel).map(([model, data]) => {
          // Find provider for this model
          const provider = Object.entries(aggregated.byProvider).find(([_, pData]) =>
            pData.totalCalls > 0 && model.toLowerCase().includes(_.toLowerCase().slice(0, 3))
          )?.[0] || 'Unknown';

          return {
            model,
            provider,
            calls: data.totalCalls,
            avgLatency: Math.round(data.avgLatency),
            successRate: data.successRate * 100,
            totalTokens: data.totalTokens,
            totalCost: data.totalCost,
            efficiency: data.totalCost > 0 ? data.totalTokens / data.totalCost : 0
          };
        });

        setModelStats(stats);
      } else {
        // Demo data
        const demoStats: ModelStats[] = [
          { model: 'gpt-4o', provider: 'OpenAI', calls: 145, avgLatency: 1250, successRate: 98.5, totalTokens: 125000, totalCost: 3.75, efficiency: 33333 },
          { model: 'claude-3.5-sonnet', provider: 'Anthropic', calls: 98, avgLatency: 980, successRate: 99.2, totalTokens: 89000, totalCost: 2.67, efficiency: 33333 },
          { model: 'gemini-2.0-flash', provider: 'Google', calls: 76, avgLatency: 650, successRate: 97.8, totalTokens: 54000, totalCost: 0.81, efficiency: 66667 },
          { model: 'sonar-pro', provider: 'Perplexity', calls: 52, avgLatency: 1100, successRate: 96.5, totalTokens: 41000, totalCost: 1.23, efficiency: 33333 },
          { model: 'gpt-4o-mini', provider: 'OpenAI', calls: 234, avgLatency: 450, successRate: 99.1, totalTokens: 98000, totalCost: 0.49, efficiency: 200000 },
          { model: 'claude-3.5-haiku', provider: 'Anthropic', calls: 89, avgLatency: 320, successRate: 98.9, totalTokens: 67000, totalCost: 0.34, efficiency: 197059 },
        ];

        setModelStats(demoStats);
      }

      setLoading(false);
    };

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  const sortedStats = [...modelStats].sort((a, b) => {
    switch (sortBy) {
      case 'calls': return b.calls - a.calls;
      case 'efficiency': return b.efficiency - a.efficiency;
      case 'latency': return a.avgLatency - b.avgLatency;
      default: return 0;
    }
  });

  const topModel = sortedStats[0];
  const fastestModel = [...modelStats].sort((a, b) => a.avgLatency - b.avgLatency)[0];
  const cheapestModel = [...modelStats].sort((a, b) => b.efficiency - a.efficiency)[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Lightbulb className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-matrix-primary">Model Insights</h3>

        {/* Sort Toggle */}
        <div className="flex gap-1 p-1 bg-black/50 rounded-lg border border-matrix-primary/20">
          {[
            { key: 'calls', label: 'Most Used' },
            { key: 'efficiency', label: 'Best Value' },
            { key: 'latency', label: 'Fastest' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key as typeof sortBy)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                sortBy === key
                  ? 'bg-matrix-primary text-black font-medium'
                  : 'text-foreground/70 hover:text-matrix-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {topModel && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border border-matrix-primary/20 bg-matrix-primary/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-matrix-primary" />
              <span className="text-xs text-foreground/70">Most Used</span>
            </div>
            <p className="text-lg font-bold text-matrix-primary truncate">{topModel.model}</p>
            <p className="text-xs text-foreground/50">{topModel.calls} calls</p>
          </motion.div>
        )}

        {fastestModel && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border border-matrix-secondary/20 bg-matrix-secondary/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-matrix-secondary" />
              <span className="text-xs text-foreground/70">Fastest</span>
            </div>
            <p className="text-lg font-bold text-matrix-secondary truncate">{fastestModel.model}</p>
            <p className="text-xs text-foreground/50">{fastestModel.avgLatency}ms avg</p>
          </motion.div>
        )}

        {cheapestModel && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border border-matrix-tertiary/20 bg-matrix-tertiary/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-matrix-tertiary" />
              <span className="text-xs text-foreground/70">Best Value</span>
            </div>
            <p className="text-lg font-bold text-matrix-tertiary truncate">{cheapestModel.model}</p>
            <p className="text-xs text-foreground/50">{(cheapestModel.efficiency / 1000).toFixed(0)}k tokens/$</p>
          </motion.div>
        )}
      </div>

      {/* Model Rankings Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/70">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/70">Model</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground/70">Calls</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground/70">Latency</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground/70">Success</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground/70">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedStats.map((stat, index) => (
                <motion.tr
                  key={stat.model}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-matrix-primary/5 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground/50">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: providerColors[stat.provider] || '#666' }}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{stat.model}</p>
                        <p className="text-xs text-foreground/50">{stat.provider}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {stat.calls.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm ${stat.avgLatency < 500 ? 'text-green-500' : stat.avgLatency < 1000 ? 'text-yellow-500' : 'text-foreground'}`}>
                      {stat.avgLatency}ms
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {stat.successRate >= 98 && <CheckCircle className="w-3 h-3 text-green-500" />}
                      <span className={`text-sm ${stat.successRate >= 98 ? 'text-green-500' : stat.successRate >= 95 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {stat.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    ${stat.totalCost.toFixed(2)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Token Distribution */}
      <div className="p-4 rounded-lg border border-border bg-background/50">
        <h4 className="text-sm font-medium text-foreground/70 mb-3">Token Distribution by Model</h4>
        <div className="space-y-2">
          {sortedStats.slice(0, 5).map((stat) => {
            const totalTokens = modelStats.reduce((sum, s) => sum + s.totalTokens, 0);
            const percentage = totalTokens > 0 ? (stat.totalTokens / totalTokens) * 100 : 0;

            return (
              <div key={stat.model} className="flex items-center gap-3">
                <span className="text-xs text-foreground/70 w-32 truncate">{stat.model}</span>
                <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: providerColors[stat.provider] || '#00ff00' }}
                  />
                </div>
                <span className="text-xs text-foreground/50 w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
