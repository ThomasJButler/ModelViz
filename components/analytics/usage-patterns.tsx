/**
 * @file usage-patterns.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Usage pattern analytics showing token consumption and request distribution over time.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import { generateTimeSeriesData } from '@/lib/data';
import { TokenUsageHeatmap } from './token-usage-heatmap';

/**
 * @constructor
 */
export function UsagePatterns() {
  const [timeRange, setTimeRange] = useState('7d');
  const data = generateTimeSeriesData(24);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-matrix-primary">Usage Patterns</h3>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage Over Time */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Token Usage</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  stroke="#666"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value1"
                  stroke="#00ff00"
                  fillOpacity={1}
                  fill="url(#tokenGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Request Distribution */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Request Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="timestamp"
                  stroke="#666"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke="#00ffff"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Enhanced Token Usage Heatmap */}
      <TokenUsageHeatmap />
    </div>
  );
}