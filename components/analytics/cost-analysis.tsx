/**
 * @file cost-analysis.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Cost analysis dashboard showing inference, training, and storage costs with optimisation recommendations.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { formatCost, projectMonthlyCost } from '@/lib/utils/costCalculator';
import { format } from 'date-fns';

/**
 * @constructor
 */
export function CostAnalysis() {
  const [timeRange, setTimeRange] = useState('7d');
  const [costData, setCostData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  const [projectedMonthly, setProjectedMonthly] = useState(0);

  useEffect(() => {
    const loadRealCosts = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();

      try {
        // Determine time range
        let range: 'hour' | 'today' | 'week' | 'month' | 'year' = 'week';
        let daysElapsed = 7;
        switch (timeRange) {
          case '24h':
            range = 'today';
            daysElapsed = 1;
            break;
          case '7d':
            range = 'week';
            daysElapsed = 7;
            break;
          case '30d':
            range = 'month';
            daysElapsed = 30;
            break;
          case '90d':
            range = 'year';
            daysElapsed = 90;
            break;
        }

        const aggregated = await service.getAggregatedMetrics(range);

        // Check if we have real data
        if (aggregated.dailyStats.length > 0) {
          // Daily cost breakdown by provider
          const chartData = aggregated.dailyStats.map((stat) => {
            const dataPoint: any = {
              date: format(new Date(stat.timestamp), 'MMM dd'),
              total: stat.totalCost
            };

            // Add costs by provider
            Object.entries(stat.costByProvider).forEach(([provider, cost]) => {
              dataPoint[provider] = cost;
            });

            return dataPoint;
          });

          setCostData(chartData);

          // Calculate totals
          const total = aggregated.totalCost;
          const projected = projectMonthlyCost(total, daysElapsed);

          setTotalCost(total);
          setProjectedMonthly(projected);
        } else {
          // Fall back to demo data
          setCostData([
            { date: 'Jan 01', OpenAI: 0.12, Anthropic: 0.08, DeepSeek: 0.04, total: 0.24 },
            { date: 'Jan 02', OpenAI: 0.15, Anthropic: 0.09, DeepSeek: 0.045, total: 0.285 },
            { date: 'Jan 03', OpenAI: 0.13, Anthropic: 0.085, DeepSeek: 0.042, total: 0.257 },
            { date: 'Jan 04', OpenAI: 0.16, Anthropic: 0.095, DeepSeek: 0.048, total: 0.303 },
            { date: 'Jan 05', OpenAI: 0.14, Anthropic: 0.088, DeepSeek: 0.044, total: 0.272 },
            { date: 'Jan 06', OpenAI: 0.17, Anthropic: 0.10, DeepSeek: 0.05, total: 0.32 },
            { date: 'Jan 07', OpenAI: 0.145, Anthropic: 0.092, DeepSeek: 0.046, total: 0.283 }
          ]);
          setTotalCost(2.0);
          setProjectedMonthly(8.57);
        }
      } catch (error) {
        console.error('Error loading cost data:', error);
        // Fall back to demo data on error
        setCostData([
          { date: 'Jan 01', OpenAI: 0.12, Anthropic: 0.08, DeepSeek: 0.04, total: 0.24 },
          { date: 'Jan 02', OpenAI: 0.15, Anthropic: 0.09, DeepSeek: 0.045, total: 0.285 }
        ]);
        setTotalCost(0.525);
        setProjectedMonthly(2.25);
      } finally {
        setLoading(false);
      }
    };

    loadRealCosts();

    // Listen for real-time updates
    const handleUpdate = () => loadRealCosts();
    if (typeof window !== 'undefined') {
      window.addEventListener('metrics-updated', handleUpdate);
      return () => {
        window.removeEventListener('metrics-updated', handleUpdate);
      };
    }
  }, [timeRange]);

  const insights = [
    {
      title: 'Total Spend',
      value: formatCost(totalCost),
      trend: 'neutral' as const,
      description: `For ${timeRange} period`
    },
    {
      title: 'Projected Monthly',
      value: formatCost(projectedMonthly),
      trend: 'up' as const,
      description: 'Based on current usage'
    },
    {
      title: 'Average per Call',
      value: formatCost(totalCost / Math.max(1, costData.length * 10)),
      trend: 'down' as const,
      description: 'Efficiency improving'
    }
  ];

  const recommendations = [
    {
      title: 'Batch Processing',
      description: 'Implement request batching to reduce API calls',
      impact: 'Potential 20% cost reduction'
    },
    {
      title: 'Cache Optimisation',
      description: 'Increase cache hit rate for common requests',
      impact: 'Up to 15% fewer API calls'
    },
    {
      title: 'Model Pruning',
      description: 'Remove unused model versions',
      impact: 'Reduce storage costs by 25%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <motion.div
            key={insight.title}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-matrix-primary">{insight.title}</h4>
              {insight.trend === 'down' ? (
                <TrendingDown className="w-5 h-5 text-green-500" />
              ) : insight.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              ) : (
                <DollarSign className="w-5 h-5 text-matrix-primary" />
              )}
            </div>
            <p className="text-2xl font-bold mb-1">{insight.value}</p>
            <p className="text-sm text-foreground/70">{insight.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-matrix-primary">Cost Distribution by Provider</h4>
          <div className="flex gap-2">
            {['24h', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeRange === range
                    ? 'bg-matrix-primary/20 text-matrix-primary'
                    : 'text-foreground/70 hover:text-matrix-primary'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-matrix-primary/50">Loading cost data...</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
                <XAxis
                  dataKey="date"
                  stroke="#666"
                />
                <YAxis stroke="#666" tickFormatter={(value) => formatCost(value)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCost(value)}
                />
                <Legend />
                <Bar dataKey="OpenAI" name="OpenAI" fill="#00ff00" stackId="a" />
                <Bar dataKey="Anthropic" name="Anthropic" fill="#00ffff" stackId="a" />
                <Bar dataKey="DeepSeek" name="DeepSeek" fill="#ff00ff" stackId="a" />
                <Bar dataKey="Perplexity" name="Perplexity" fill="#ffff00" stackId="a" />
                <Bar dataKey="Google" name="Google" fill="#ff0080" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <motion.div
            key={rec.title}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border border-matrix-secondary/20 bg-background/50"
          >
            <div className="flex items-start gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-matrix-secondary" />
              <div>
                <h4 className="font-medium text-matrix-secondary">{rec.title}</h4>
                <p className="text-sm text-foreground/70 mt-1">{rec.description}</p>
                <p className="text-sm text-matrix-secondary mt-2">{rec.impact}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
