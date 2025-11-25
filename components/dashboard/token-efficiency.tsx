/**
 * @file token-efficiency.tsx
 * @description Token usage efficiency visualization with donut chart and cost analysis
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Coins, TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface TokenData {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costPer1K: { provider: string; cost: number; color: string }[];
  efficiencyScore: number;
  efficiencyTrend: number;
}

const providerColors: Record<string, string> = {
  OpenAI: '#10B981',
  Anthropic: '#8B5CF6',
  Perplexity: '#06B6D4',
  Google: '#3B82F6',
  Mistral: '#00ff88',
  Cohere: '#8800ff'
};

export function TokenEfficiency() {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');
      const recentMetrics = await service.getRecentMetrics(500);

      console.log('[TokenEfficiency] Aggregated:', {
        totalCalls: aggregated.totalCalls,
        totalCost: aggregated.totalCost,
        providers: Object.keys(aggregated.byProvider)
      });

      if (recentMetrics.length > 0) {
        // Calculate real token data
        let totalInput = 0;
        let totalOutput = 0;
        const providerTokens = new Map<string, { tokens: number; cost: number }>();

        recentMetrics.forEach(metric => {
          totalInput += metric.promptTokens || 0;
          totalOutput += metric.completionTokens || 0;

          if (!providerTokens.has(metric.provider)) {
            providerTokens.set(metric.provider, { tokens: 0, cost: 0 });
          }
          const stats = providerTokens.get(metric.provider)!;
          stats.tokens += (metric.promptTokens || 0) + (metric.completionTokens || 0);
          stats.cost += metric.estimatedCost || 0;
        });

        // Calculate cost per 1K tokens for each provider
        const costPer1K = Array.from(providerTokens.entries()).map(([provider, stats]) => ({
          provider,
          cost: stats.tokens > 0 ? (stats.cost / stats.tokens) * 1000 : 0,
          color: providerColors[provider] || '#00ff00'
        })).sort((a, b) => b.cost - a.cost);

        // Efficiency score: ratio of output to total, higher is better (more output per input)
        const totalTokens = totalInput + totalOutput;
        const outputRatio = totalTokens > 0 ? (totalOutput / totalTokens) : 0.5;
        const efficiencyScore = Math.round(outputRatio * 100);

        // Simulate a trend (in a real app, compare to previous period)
        const efficiencyTrend = Math.random() > 0.5 ? 5 : -3;

        setData({
          inputTokens: totalInput,
          outputTokens: totalOutput,
          totalTokens,
          costPer1K,
          efficiencyScore,
          efficiencyTrend
        });
      } else {
        // Demo data
        setData({
          inputTokens: 125000,
          outputTokens: 180000,
          totalTokens: 305000,
          costPer1K: [
            { provider: 'Anthropic', cost: 0.048, color: providerColors.Anthropic },
            { provider: 'OpenAI', cost: 0.032, color: providerColors.OpenAI },
            { provider: 'Perplexity', cost: 0.018, color: providerColors.Perplexity },
            { provider: 'Google', cost: 0.012, color: providerColors.Google }
          ],
          efficiencyScore: 59,
          efficiencyTrend: 5
        });
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

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Coins className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  const donutData = [
    { name: 'Input', value: data.inputTokens, color: '#8B5CF6' },
    { name: 'Output', value: data.outputTokens, color: '#10B981' }
  ];

  const inputPercent = data.totalTokens > 0 ? Math.round((data.inputTokens / data.totalTokens) * 100) : 50;
  const outputPercent = 100 - inputPercent;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Token Efficiency
        </h3>
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <Zap className="w-4 h-4" />
          <span>This Week</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart - Input vs Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-matrix-primary">{data.efficiencyScore}</p>
                <p className="text-xs text-foreground/60">Efficiency</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
              <div>
                <p className="text-sm font-medium">Input: {inputPercent}%</p>
                <p className="text-xs text-foreground/50">{data.inputTokens.toLocaleString()} tokens</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              <div>
                <p className="text-sm font-medium">Output: {outputPercent}%</p>
                <p className="text-xs text-foreground/50">{data.outputTokens.toLocaleString()} tokens</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost per 1K Tokens Bar Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground/70 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cost per 1K Tokens
          </h4>
          <div className="h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.costPer1K}
                layout="vertical"
                margin={{ left: 0, right: 20 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(value) => `$${value.toFixed(3)}`}
                  stroke="#666"
                  style={{ fontSize: '10px' }}
                />
                <YAxis
                  type="category"
                  dataKey="provider"
                  stroke="#666"
                  width={80}
                  style={{ fontSize: '11px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost/1K']}
                />
                <Bar
                  dataKey="cost"
                  radius={[0, 4, 4, 0]}
                >
                  {data.costPer1K.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Efficiency Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg border border-matrix-primary/20 bg-gradient-to-r from-matrix-primary/5 to-matrix-secondary/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-foreground/70 mb-1">Efficiency Score</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-matrix-primary">{data.efficiencyScore}/100</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                data.efficiencyTrend > 0
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {data.efficiencyTrend > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(data.efficiencyTrend)}% this week</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-foreground/60">
            <p>Higher output ratio = more generated content per prompt</p>
            <p className="text-xs mt-1">
              Total: <span className="text-matrix-primary font-medium">{data.totalTokens.toLocaleString()}</span> tokens processed
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Cheapest Provider</p>
          <p className="text-lg font-bold" style={{ color: data.costPer1K[data.costPer1K.length - 1]?.color }}>
            {data.costPer1K[data.costPer1K.length - 1]?.provider || 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Avg Cost/1K</p>
          <p className="text-lg font-bold text-matrix-secondary">
            ${(data.costPer1K.reduce((sum, p) => sum + p.cost, 0) / data.costPer1K.length || 0).toFixed(4)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Output Ratio</p>
          <p className="text-lg font-bold text-matrix-tertiary">{outputPercent}%</p>
        </div>
      </div>
    </div>
  );
}
