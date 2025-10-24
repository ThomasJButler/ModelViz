/**
 * @file model-performance.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model performance monitoring with radar charts showing accuracy, latency, reliability, and throughput metrics.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { Brain, Zap, Shield, Target } from 'lucide-react';

/**
 * @constructor
 */
export function ModelPerformance() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  const models = [
    { id: 'gpt-4', name: 'GPT-4 Turbo', icon: Brain },
    { id: 'claude-3', name: 'Claude 3', icon: Zap },
    { id: 'llama-3', name: 'LLaMA 3', icon: Shield }
  ];

  const performanceData = {
    'gpt-4': [
      { metric: 'Accuracy', value: 98 },
      { metric: 'Latency', value: 95 },
      { metric: 'Reliability', value: 99 },
      { metric: 'Throughput', value: 92 },
      { metric: 'Cost Efficiency', value: 85 },
      { metric: 'Scalability', value: 90 }
    ],
    'claude-3': [
      { metric: 'Accuracy', value: 97 },
      { metric: 'Latency', value: 97 },
      { metric: 'Reliability', value: 98 },
      { metric: 'Throughput', value: 94 },
      { metric: 'Cost Efficiency', value: 88 },
      { metric: 'Scalability', value: 92 }
    ],
    'llama-3': [
      { metric: 'Accuracy', value: 96 },
      { metric: 'Latency', value: 98 },
      { metric: 'Reliability', value: 97 },
      { metric: 'Throughput', value: 96 },
      { metric: 'Cost Efficiency', value: 94 },
      { metric: 'Scalability', value: 95 }
    ]
  };

  const benchmarks = [
    { metric: 'Token Processing', current: 15000, target: 20000, unit: 'tokens/sec' },
    { metric: 'Response Time', current: 120, target: 100, unit: 'ms' },
    { metric: 'Error Rate', current: 0.2, target: 0.1, unit: '%' },
    { metric: 'Memory Usage', current: 85, target: 70, unit: '%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {models.map(model => {
          const Icon = model.icon;
          const isSelected = model.id === selectedModel;

          return (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedModel(model.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isSelected
                  ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary'
                  : 'border border-border hover:border-matrix-primary/50 text-foreground/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{model.name}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Performance Metrics</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceData[selectedModel as keyof typeof performanceData]}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="metric" stroke="#666" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#00ff00"
                  fill="#00ff00"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Performance Benchmarks</h4>
          <div className="space-y-6">
            {benchmarks.map(benchmark => {
              const progress = (benchmark.current / benchmark.target) * 100;
              const isGood = benchmark.current >= benchmark.target;

              return (
                <div key={benchmark.metric} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">{benchmark.metric}</span>
                    <span className="text-matrix-primary">
                      {benchmark.current} / {benchmark.target} {benchmark.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full ${
                        isGood ? 'bg-matrix-primary' : 'bg-matrix-tertiary'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Optimisation Target',
            value: '+15%',
            description: 'Performance headroom available',
            icon: Target,
            colour: 'text-matrix-primary'
          },
          {
            title: 'Peak Performance',
            value: '98.5%',
            description: 'Maximum efficiency achieved',
            icon: Zap,
            colour: 'text-matrix-secondary'
          },
          {
            title: 'Reliability Score',
            value: 'A+',
            description: 'System stability rating',
            icon: Shield,
            colour: 'text-matrix-tertiary'
          }
        ].map((insight) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.title}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${insight.colour}`} />
                <div>
                  <h4 className="font-medium text-foreground/70">{insight.title}</h4>
                  <p className={`text-2xl font-bold ${insight.colour}`}>{insight.value}</p>
                  <p className="text-sm text-foreground/50 mt-1">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
