/**
 * @file usage-chart.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Usage chart visualisation component displaying metrics over time.
 */

"use client";

import { Line, LineChart as RechartsLineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { date: '2024-01-01', requests: 120000 },
  { date: '2024-01-02', requests: 132000 },
  { date: '2024-01-03', requests: 125000 },
  { date: '2024-01-04', requests: 140000 },
  { date: '2024-01-05', requests: 160000 },
  { date: '2024-01-06', requests: 155000 },
  { date: '2024-01-07', requests: 170000 },
];

const timeRanges = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
];

interface UsageChartProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

/**
 * @constructor
 */
export function UsageChart({ timeRange, onTimeRangeChange }: UsageChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">API Usage</h3>
        <div className="flex gap-2">
          {timeRanges.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onTimeRangeChange(value)}
              className={`px-3 py-1 rounded-lg text-sm ${
                timeRange === value
                  ? 'bg-matrix-primary/20 text-matrix-primary'
                  : 'text-foreground/70 hover:text-matrix-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#00ff00"
              strokeWidth={2}
              dot={false}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}