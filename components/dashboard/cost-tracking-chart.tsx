/**
 * @file cost-tracking-chart.tsx
 * @description Real-time cost tracking visualization by provider and model
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { format, subDays } from 'date-fns';

interface CostData {
  date: string;
  [key: string]: number | string;
}

export function CostTrackingChart() {
  const [dailyCosts, setDailyCosts] = useState<CostData[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [projectedMonthlyCost, setProjectedMonthlyCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<string[]>([]);

  const colors = {
    OpenAI: '#10B981',      // Green
    Anthropic: '#8B5CF6',   // Purple
    Perplexity: '#06B6D4',  // Cyan
    Google: '#3B82F6',      // Blue
    Mistral: '#00ff88',
    Cohere: '#8800ff'
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');

      if (aggregated.dailyStats && aggregated.dailyStats.length > 0) {
        // Real data - group by provider
        const providerSet = new Set<string>();
        const dateMap = new Map<string, Record<string, number>>();

        // Get recent metrics to calculate daily costs per provider
        const recentMetrics = await service.getRecentMetrics(500);

        recentMetrics.forEach(metric => {
          const date = format(new Date(metric.timestamp), 'MMM dd');
          if (!dateMap.has(date)) {
            dateMap.set(date, {});
          }
          const dayData = dateMap.get(date)!;
          dayData[metric.provider] = (dayData[metric.provider] || 0) + metric.estimatedCost;
          providerSet.add(metric.provider);
        });

        // Convert to chart format
        const chartData: CostData[] = Array.from(dateMap.entries()).map(([date, providers]) => ({
          date,
          ...providers
        }));

        // Sort by date
        chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setDailyCosts(chartData);
        setProviders(Array.from(providerSet));
        setTotalCost(aggregated.totalCost);

        // Project monthly cost
        const daysWithData = chartData.length;
        if (daysWithData > 0) {
          const avgDailyCost = aggregated.totalCost / daysWithData;
          setProjectedMonthlyCost(avgDailyCost * 30);
        }
      } else {
        // Demo data
        const demoData: CostData[] = Array.from({ length: 7 }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'MMM dd'),
          OpenAI: 1.5 + Math.random() * 0.8,
          Anthropic: 1.2 + Math.random() * 0.6,
          Perplexity: 0.5 + Math.random() * 0.3,
          Google: 0.8 + Math.random() * 0.4
        }));

        setDailyCosts(demoData);
        setProviders(['OpenAI', 'Anthropic', 'Perplexity', 'Google']);
        setTotalCost(25.40);
        setProjectedMonthlyCost(108.60);
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
        <DollarSign className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary">Cost Tracking</h3>
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <DollarSign className="w-4 h-4" />
          <span>Last 7 days</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-matrix-primary/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-matrix-primary" />
            <span className="text-xs text-foreground/70">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-matrix-primary">
            ${totalCost.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border border-matrix-secondary/20 bg-matrix-secondary/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-matrix-secondary" />
            <span className="text-xs text-foreground/70">Projected Monthly</span>
          </div>
          <p className="text-2xl font-bold text-matrix-secondary">
            ${projectedMonthlyCost.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border border-matrix-tertiary/20 bg-matrix-tertiary/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-matrix-tertiary" />
            <span className="text-xs text-foreground/70">Avg per Day</span>
          </div>
          <p className="text-2xl font-bold text-matrix-tertiary">
            ${(totalCost / dailyCosts.length).toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Cost Chart */}
      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyCosts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#666"
              label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid rgba(0, 255, 65, 0.2)',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`$${Number(value).toFixed(3)}`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
            />
            {providers.map(provider => (
              <Bar
                key={provider}
                dataKey={provider}
                name={provider}
                stackId="cost"
                fill={colors[provider as keyof typeof colors] || '#00ff00'}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {providers.map(provider => {
          const providerTotal = dailyCosts.reduce((sum, day) => {
            return sum + (Number(day[provider]) || 0);
          }, 0);

          return (
            <motion.div
              key={provider}
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-lg border border-border bg-background/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors[provider as keyof typeof colors] }}
                />
                <span className="text-xs text-foreground/70">{provider}</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                ${providerTotal.toFixed(2)}
              </p>
              <p className="text-xs text-foreground/50">
                {((providerTotal / totalCost) * 100).toFixed(1)}% of total
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
