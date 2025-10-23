/**
 * @file model-stats.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model statistics display showing usage metrics and performance data.
 */

"use client";

import { motion } from 'framer-motion';
import { Brain, Cpu, Network, Zap } from 'lucide-react';

const models = [
  {
    name: 'NeuralNet-X',
    icon: Brain,
    stats: {
      requests: '1.2M',
      latency: '12ms',
      success: '98.5%',
      users: '5.2K'
    }
  },
  {
    name: 'QuantumAI',
    icon: Cpu,
    stats: {
      requests: '800K',
      latency: '8ms',
      success: '99.1%',
      users: '3.8K'
    }
  },
  {
    name: 'DeepFlow',
    icon: Network,
    stats: {
      requests: '2.1M',
      latency: '15ms',
      success: '97.8%',
      users: '7.1K'
    }
  },
  {
    name: 'FastInference',
    icon: Zap,
    stats: {
      requests: '3.5M',
      latency: '5ms',
      success: '96.9%',
      users: '9.3K'
    }
  }
];

/**
 * @constructor
 */
export function ModelStats() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Model Statistics</h3>
      </div>
      
      <div className="divide-y divide-border">
        {models.map((model, index) => {
          const Icon = model.icon;
          
          return (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-matrix-primary" />
                <span className="font-semibold">{model.name}</span>
              </div>
              <div className="text-sm">
                <span className="text-foreground/70">Requests:</span>{' '}
                <span className="font-semibold text-matrix-primary">{model.stats.requests}</span>
              </div>
              <div className="text-sm">
                <span className="text-foreground/70">Latency:</span>{' '}
                <span className="font-semibold text-matrix-secondary">{model.stats.latency}</span>
              </div>
              <div className="text-sm">
                <span className="text-foreground/70">Success Rate:</span>{' '}
                <span className="font-semibold text-matrix-primary">{model.stats.success}</span>
              </div>
              <div className="text-sm">
                <span className="text-foreground/70">Active Users:</span>{' '}
                <span className="font-semibold text-matrix-tertiary">{model.stats.users}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}