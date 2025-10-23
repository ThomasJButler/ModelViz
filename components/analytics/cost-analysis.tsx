/**
 * @file cost-analysis.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Cost analysis dashboard showing inference, training, and storage costs with optimisation recommendations.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

/**
 * @constructor
 */
export function CostAnalysis() {
  const [timeRange, setTimeRange] = useState('7d');

  const costData = [
    { date: '2024-01-01', inference: 120, training: 80, storage: 40 },
    { date: '2024-01-02', inference: 150, training: 90, storage: 45 },
    { date: '2024-01-03', inference: 130, training: 85, storage: 42 },
    { date: '2024-01-04', inference: 160, training: 95, storage: 48 },
    { date: '2024-01-05', inference: 140, training: 88, storage: 44 },
    { date: '2024-01-06', inference: 170, training: 100, storage: 50 },
    { date: '2024-01-07', inference: 145, training: 92, storage: 46 }
  ];

  const insights = [
    {
      title: 'Cost Reduction',
      value: '-12%',
      trend: 'down',
      description: 'Month-over-month inference costs'
    },
    {
      title: 'Training Costs',
      value: '+8%',
      trend: 'up',
      description: 'Due to new model versions'
    },
    {
      title: 'Storage Efficiency',
      value: '+15%',
      trend: 'up',
      description: 'Better resource utilisation'
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
              ) : (
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <p className="text-2xl font-bold mb-1">{insight.value}</p>
            <p className="text-sm text-foreground/70">{insight.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-matrix-primary">Cost Distribution</h4>
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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData}>
              <XAxis
                dataKey="date"
                stroke="#666"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="inference" name="Inference" fill="#00ff00" />
              <Bar dataKey="training" name="Training" fill="#00ffff" />
              <Bar dataKey="storage" name="Storage" fill="#ff00ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
