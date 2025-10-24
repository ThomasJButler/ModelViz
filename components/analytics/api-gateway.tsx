/**
 * @file api-gateway.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description API gateway monitoring dashboard tracking requests, latency, error rates, and endpoint performance.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Network, Globe, Zap, Clock, ArrowUpDown, Database } from 'lucide-react';

/**
 * @constructor
 */
export function APIGateway() {
  const [timeRange, setTimeRange] = useState('7d');

  const trafficData = [
    { timestamp: '2024-01-01', requests: 15000, latency: 120, errors: 150 },
    { timestamp: '2024-01-02', requests: 18000, latency: 115, errors: 180 },
    { timestamp: '2024-01-03', requests: 16000, latency: 125, errors: 160 },
    { timestamp: '2024-01-04', requests: 20000, latency: 110, errors: 200 },
    { timestamp: '2024-01-05', requests: 19000, latency: 118, errors: 190 },
    { timestamp: '2024-01-06', requests: 22000, latency: 105, errors: 220 },
    { timestamp: '2024-01-07', requests: 21000, latency: 112, errors: 210 }
  ];

  const endpointMetrics = [
    { endpoint: '/api/v1/generate', calls: 12500, latency: 145, errors: 25 },
    { endpoint: '/api/v1/analyze', calls: 8900, latency: 165, errors: 18 },
    { endpoint: '/api/v1/transform', calls: 6700, latency: 185, errors: 15 },
    { endpoint: '/api/v1/optimise', calls: 4500, latency: 125, errors: 9 }
  ];

  return (
    <div className="space-y-6">
      {/* API Gateway Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Total Requests',
            value: '2.4M',
            change: '+12%',
            icon: Globe,
            color: 'text-matrix-primary'
          },
          {
            title: 'Avg. Latency',
            value: '125ms',
            change: '-5%',
            icon: Clock,
            color: 'text-matrix-secondary'
          },
          {
            title: 'Error Rate',
            value: '0.8%',
            change: '-2%',
            icon: Zap,
            color: 'text-matrix-tertiary'
          }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <span className={`text-sm ${
                  metric.change.startsWith('+') ? 'text-red-500' : 'text-green-500'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h4 className="text-sm font-medium text-foreground/70">{metric.title}</h4>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Traffic Overview */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-matrix-primary">API Traffic</h4>
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
            <LineChart data={trafficData}>
              <XAxis
                dataKey="timestamp"
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
              <Line
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#00ff00"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="latency"
                name="Latency (ms)"
                stroke="#00ffff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Endpoint Performance */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <h4 className="text-sm font-medium text-matrix-primary mb-4">Endpoint Performance</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-2 text-foreground/70">Endpoint</th>
                <th className="p-2 text-foreground/70">Calls</th>
                <th className="p-2 text-foreground/70">Latency</th>
                <th className="p-2 text-foreground/70">Errors</th>
                <th className="p-2 text-foreground/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {endpointMetrics.map((endpoint) => (
                <tr key={endpoint.endpoint} className="border-t border-border">
                  <td className="p-2 text-matrix-primary">{endpoint.endpoint}</td>
                  <td className="p-2">{endpoint.calls.toLocaleString()}</td>
                  <td className="p-2">{endpoint.latency}ms</td>
                  <td className="p-2">{endpoint.errors}</td>
                  <td className="p-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      endpoint.errors < 20
                        ? 'bg-matrix-primary/20 text-matrix-primary'
                        : 'bg-matrix-tertiary/20 text-matrix-tertiary'
                    }`}>
                      {endpoint.errors < 20 ? 'Healthy' : 'Warning'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Time Distribution */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <h4 className="text-sm font-medium text-matrix-primary mb-4">Response Time Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { range: '0-50ms', count: 4500 },
              { range: '50-100ms', count: 8900 },
              { range: '100-150ms', count: 6700 },
              { range: '150-200ms', count: 2500 },
              { range: '200ms+', count: 1200 }
            ]}>
              <XAxis dataKey="range" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="count"
                name="Requests"
                fill="#00ff00"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}