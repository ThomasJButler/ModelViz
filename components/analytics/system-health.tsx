/**
 * @file system-health.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Real-time system health monitoring displaying CPU, memory, disk, and network metrics.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Cpu, MemoryStick as Memory, HardDrive, Network, Activity, Gauge } from 'lucide-react';

/**
 * @constructor
 */
export function SystemHealth() {
  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 65,
    disk: 55,
    network: 35
  });

  // Simulate real-time updates
  /** @constructs */
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.min(100, Math.max(0, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.min(100, Math.max(0, prev.disk + (Math.random() - 0.5) * 2)),
        network: Math.min(100, Math.max(0, prev.network + (Math.random() - 0.5) * 15))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (value: number) => {
    if (value > 90) return { status: 'Critical', color: 'text-red-500' };
    if (value > 70) return { status: 'Warning', color: 'text-yellow-500' };
    return { status: 'Healthy', color: 'text-matrix-primary' };
  };

  const systemMetrics = [
    { name: 'CPU Usage', value: metrics.cpu, icon: Cpu, unit: '%' },
    { name: 'Memory Usage', value: metrics.memory, icon: Memory, unit: '%' },
    { name: 'Disk Usage', value: metrics.disk, icon: HardDrive, unit: '%' },
    { name: 'Network Load', value: metrics.network, icon: Network, unit: '%' }
  ];

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          const health = getHealthStatus(metric.value);
          
          return (
            <motion.div
              key={metric.name}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-matrix-primary" />
                <span className={`text-sm ${health.color}`}>
                  {health.status}
                </span>
              </div>
              <h4 className="text-sm font-medium text-foreground/70">{metric.name}</h4>
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-2xl font-bold text-matrix-primary">
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    className={`h-full ${
                      metric.value > 90
                        ? 'bg-red-500'
                        : metric.value > 70
                        ? 'bg-yellow-500'
                        : 'bg-matrix-primary'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Load */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-matrix-primary">System Load</h4>
            <Activity className="w-5 h-5 text-matrix-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { time: 'T-6', load: 45 },
                { time: 'T-5', load: 52 },
                { time: 'T-4', load: 48 },
                { time: 'T-3', load: 55 },
                { time: 'T-2', load: 49 },
                { time: 'T-1', load: 53 },
                { time: 'T-0', load: 51 }
              ]}>
                <XAxis dataKey="time" stroke="#666" />
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
                  dataKey="load"
                  stroke="#00ff00"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Score */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-matrix-primary">Health Score</h4>
            <Gauge className="w-5 h-5 text-matrix-primary" />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              {/* Circular progress background */}
              <div className="absolute inset-0 rounded-full border-8 border-background" />
              
              {/* Animated progress */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#00ff00"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88 * 0.85} ${2 * Math.PI * 88 * 0.15}`}
                  className="transition-all duration-1000"
                />
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-matrix-primary">85%</span>
                <span className="text-sm text-foreground/70">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Events */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <h4 className="text-sm font-medium text-matrix-primary mb-4">Recent Events</h4>
        <div className="space-y-4">
          {[
            {
              type: 'info',
              message: 'System backup completed successfully',
              time: '2 minutes ago'
            },
            {
              type: 'warning',
              message: 'High memory usage detected',
              time: '15 minutes ago'
            },
            {
              type: 'error',
              message: 'Failed to connect to secondary database',
              time: '1 hour ago'
            }
          ].map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${
                event.type === 'error'
                  ? 'border-red-500/20 bg-red-500/10'
                  : event.type === 'warning'
                  ? 'border-yellow-500/20 bg-yellow-500/10'
                  : 'border-matrix-primary/20 bg-matrix-primary/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={
                  event.type === 'error'
                    ? 'text-red-500'
                    : event.type === 'warning'
                    ? 'text-yellow-500'
                    : 'text-matrix-primary'
                }>
                  {event.message}
                </span>
                <span className="text-sm text-foreground/50">{event.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}