/**
 * @file performance-chart.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Performance chart visualisation showing metrics and trends over time.
 */

"use client";

import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { model: 'GPT-4', latency: 150, success: 98.7, cost: 0.03, tokens: 128000 },
  { model: 'Claude 3', latency: 145, success: 98.9, cost: 0.025, tokens: 200000 },
  { model: 'LLaMA 3', latency: 120, success: 97.8, cost: 0.015, tokens: 100000 },
  { model: 'DALL·E 3', latency: 250, success: 96.5, cost: 0.04, tokens: 0 },
  { model: 'Whisper V3', latency: 90, success: 97.2, cost: 0.01, tokens: 0 }
];

interface PerformanceChartProps {
  timeRange: string;
  metric?: 'latency' | 'success' | 'cost' | 'tokens';
}

/**
 * @constructor
 */
export function PerformanceChart({ timeRange, metric = 'latency' }: PerformanceChartProps) {
  const metricConfig = {
    latency: {
      key: 'latency',
      name: 'Average Latency (ms)',
      color: '#00ffff',
      formatter: (value: number) => `${value}ms`
    },
    success: {
      key: 'success',
      name: 'Success Rate (%)',
      color: '#00ff00',
      formatter: (value: number) => `${value}%`
    },
    cost: {
      key: 'cost',
      name: 'Cost per 1K tokens ($)',
      color: '#ff00ff',
      formatter: (value: number) => `$${value}`
    },
    tokens: {
      key: 'tokens',
      name: 'Max Context Length',
      color: '#ffff00',
      formatter: (value: number) => value.toLocaleString()
    }
  };

  const config = metricConfig[metric];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      <h3 className="text-lg font-semibold mb-6">Model {config.name}</h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="model" 
              stroke="#666" 
              fontSize={12}
            />
            <YAxis 
              stroke="#666" 
              fontSize={12}
              tickFormatter={config.formatter}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              formatter={config.formatter}
            />
            <Legend />
            <Bar
              dataKey={config.key}
              name={config.name}
              fill={config.color}
              radius={[4, 4, 0, 0]}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}