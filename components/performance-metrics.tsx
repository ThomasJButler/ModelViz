/**
 * @file performance-metrics.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Performance metrics display showing system and application performance indicators.
 */

"use client";

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

interface PerformanceMetricsProps {
  model: string;
  scenario: {
    id: string;
    name: string;
    effects: {
      latency: number;
      errorRate: number;
      resourceUsage: number;
    };
  };
  metrics: {
    cpu: number;
    memory: number;
    network: number;
    errorRate: number;
  };
}

/**
 * @constructor
 */
export function PerformanceMetrics({ model, scenario, metrics }: PerformanceMetricsProps) {
  const [data, setData] = useState<any[]>([]);

  /** @constructs */
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          latency: metrics.network * scenario.effects.latency,
          errorRate: metrics.errorRate * 100,
          throughput: Math.max(0, 100 - metrics.cpu) * (1 - metrics.errorRate)
        };

        const newData = [...prev, newPoint];
        if (newData.length > 20) newData.shift();
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [metrics, scenario]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-matrix-primary/20 bg-card"
    >
      <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="time"
              stroke="#666"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#666" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="latency"
              name="Latency"
              stroke="#00ff00"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="errorRate"
              name="Error Rate"
              stroke="#ff00ff"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="throughput"
              name="Throughput"
              stroke="#00ffff"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}