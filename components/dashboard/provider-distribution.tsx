/**
 * @file provider-distribution.tsx
 * @description Visual distribution of API calls across providers
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Network, Zap } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface ProviderData {
  name: string;
  value: number;
  color: string;
  calls: number;
  cost: number;
}

export function ProviderDistribution() {
  const [data, setData] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'calls' | 'tokens' | 'cost'>('calls');

  const colors = {
    OpenAI: '#00ff00',
    Anthropic: '#00ffff',
    DeepSeek: '#ff00ff',
    Google: '#ffff00',
    Perplexity: '#ff8800',
    Mistral: '#00ff88',
    Cohere: '#8800ff'
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');

      console.log('[ProviderDistribution] Aggregated data:', {
        providers: Object.keys(aggregated.byProvider),
        totalCalls: aggregated.totalCalls,
        totalCost: aggregated.totalCost,
        selectedMetric
      });

      if (Object.keys(aggregated.byProvider).length > 0) {
        // Real data
        const providerData: ProviderData[] = Object.entries(aggregated.byProvider).map(([provider, stats]) => ({
          name: provider,
          value: selectedMetric === 'calls' ? stats.totalCalls :
                 selectedMetric === 'tokens' ? stats.totalTokens :
                 stats.totalCost,
          color: colors[provider as keyof typeof colors] || '#00ff00',
          calls: stats.totalCalls,
          cost: stats.totalCost
        }));

        console.log('[ProviderDistribution] Using real data:', providerData.length, 'providers');
        setData(providerData);
      } else {
        console.log('[ProviderDistribution] Using demo data - no real providers available');
        // Demo data
        const demoData: ProviderData[] = [
          { name: 'OpenAI', value: 450, color: colors.OpenAI, calls: 450, cost: 12.50 },
          { name: 'Anthropic', value: 320, color: colors.Anthropic, calls: 320, cost: 8.20 },
          { name: 'DeepSeek', value: 180, color: colors.DeepSeek, calls: 180, cost: 2.10 },
          { name: 'Google', value: 120, color: colors.Google, calls: 120, cost: 3.40 }
        ];

        // Adjust values based on selected metric
        if (selectedMetric === 'tokens') {
          demoData.forEach(d => d.value = d.value * 1000);
        } else if (selectedMetric === 'cost') {
          demoData.forEach(d => d.value = d.cost);
        }

        setData(demoData);
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
  }, [selectedMetric]);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Network className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary">API Provider Distribution</h3>
        <div className="flex gap-2">
          {(['calls', 'tokens', 'cost'] as const).map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                selectedMetric === metric
                  ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary'
                  : 'text-foreground/70 hover:text-matrix-primary border border-transparent'
              }`}
            >
              {metric === 'calls' ? 'Requests' : metric === 'tokens' ? 'Tokens' : 'Cost'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${((entry.value / totalValue) * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                formatter={(value: any, name: string) => {
                  if (selectedMetric === 'cost') {
                    return [`$${value.toFixed(2)}`, name];
                  } else if (selectedMetric === 'tokens') {
                    return [value.toLocaleString(), name];
                  }
                  return [value, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {data.map((provider, index) => {
            const percentage = (provider.value / totalValue) * 100;
            return (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: provider.color }}
                    />
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-foreground/70">{provider.calls} calls</span>
                    <span className="text-foreground/70">${provider.cost.toFixed(2)}</span>
                    <span className="text-matrix-primary font-bold">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full"
                    style={{ backgroundColor: provider.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Total Calls</p>
          <p className="text-lg font-bold text-matrix-primary">
            {data.reduce((sum, d) => sum + d.calls, 0).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Total Cost</p>
          <p className="text-lg font-bold text-matrix-secondary">
            ${data.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Providers</p>
          <p className="text-lg font-bold text-matrix-tertiary">{data.length}</p>
        </div>
      </div>
    </div>
  );
}
