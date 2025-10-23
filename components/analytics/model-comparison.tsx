/**
 * @file model-comparison.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model comparison tool for analysing and contrasting different AI model capabilities side by side.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip } from 'recharts';
import { Brain, Zap, Shield, Target } from 'lucide-react';

/**
 * @constructor
 */
export function ModelComparison() {
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4', 'claude-3']);

  const models = [
    { id: 'gpt-4', name: 'GPT-4 Turbo', icon: Brain },
    { id: 'claude-3', name: 'Claude 3', icon: Zap },
    { id: 'llama-3', name: 'LLaMA 3', icon: Shield }
  ];

  const metrics = [
    { name: 'Accuracy', gpt4: 98, claude3: 97, llama3: 96 },
    { name: 'Speed', gpt4: 92, claude3: 95, llama3: 97 },
    { name: 'Reliability', gpt4: 99, claude3: 98, llama3: 96 },
    { name: 'Cost Efficiency', gpt4: 85, claude3: 88, llama3: 94 },
    { name: 'Context Length', gpt4: 95, claude3: 98, llama3: 90 },
    { name: 'Consistency', gpt4: 96, claude3: 95, llama3: 93 }
  ];

  const getModelData = (modelId: string) => {
    return metrics.map(metric => ({
      metric: metric.name,
      value: metric[modelId.replace('-', '') as keyof typeof metric] || 0
    }));
  };

  const chartData = selectedModels.map(modelId => ({
    modelId,
    data: getModelData(modelId)
  }));

  return (
    <div className="p-6 rounded-lg border border-matrix-primary/20 bg-background/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-matrix-primary">Model Comparison</h3>
          <p className="text-sm text-foreground/70">Compare performance across models</p>
        </div>
        <Target className="w-5 h-5 text-matrix-primary" />
      </div>

      {/* Model Selection */}
      <div className="flex gap-4 mb-8">
        {models.map(model => {
          const Icon = model.icon;
          const isSelected = selectedModels.includes(model.id);
          
          return (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (isSelected) {
                  setSelectedModels(prev => prev.filter(id => id !== model.id));
                } else if (selectedModels.length < 2) {
                  setSelectedModels(prev => [...prev, model.id]);
                }
              }}
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

      {/* Radar Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData[0]?.data}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="metric" stroke="#666" />
            {chartData.map((model, index) => (
              <Radar
                key={model.modelId}
                name={models.find(m => m.id === model.modelId)?.name}
                dataKey="value"
                stroke={index === 0 ? '#00ff00' : '#00ffff'}
                fill={index === 0 ? '#00ff00' : '#00ffff'}
                fillOpacity={0.3}
              />
            ))}
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

      {/* Metrics Comparison */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {metrics.map(metric => (
          <div key={metric.name} className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
            <h4 className="text-sm font-medium text-matrix-primary mb-2">{metric.name}</h4>
            <div className="space-y-2">
              {selectedModels.map(modelId => {
                const value = metric[modelId.replace('-', '') as keyof typeof metric];
                return (
                  <div key={modelId} className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70">
                      {models.find(m => m.id === modelId)?.name}
                    </span>
                    <span className="text-sm font-medium text-matrix-primary">
                      {value}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}