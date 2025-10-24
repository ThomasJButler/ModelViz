/**
 * @file ai-scorecard.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description AI model performance scorecard with F1 metrics, precision, recall, and confusion matrix visualisation.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Brain, Target, Award, TrendingUp } from 'lucide-react';

/**
 * @constructor
 */
export function AIScorecard() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [timeRange, setTimeRange] = useState('7d');

  const models = [
    { id: 'gpt-4', name: 'GPT-4 Turbo', icon: Brain },
    { id: 'claude-3', name: 'Claude 3', icon: Brain },
    { id: 'llama-3', name: 'LLaMA 3', icon: Brain }
  ];

  const f1Metrics = {
    'gpt-4': {
      precision: 0.95,
      recall: 0.93,
      f1Score: 0.94,
      accuracy: 0.96,
      trends: [
        { date: '2024-01-01', f1: 0.92, precision: 0.93, recall: 0.91 },
        { date: '2024-01-02', f1: 0.93, precision: 0.94, recall: 0.92 },
        { date: '2024-01-03', f1: 0.94, precision: 0.95, recall: 0.93 },
        { date: '2024-01-04', f1: 0.94, precision: 0.95, recall: 0.93 },
        { date: '2024-01-05', f1: 0.95, precision: 0.96, recall: 0.94 },
        { date: '2024-01-06', f1: 0.94, precision: 0.95, recall: 0.93 },
        { date: '2024-01-07', f1: 0.94, precision: 0.95, recall: 0.93 }
      ]
    },
    'claude-3': {
      precision: 0.93,
      recall: 0.92,
      f1Score: 0.925,
      accuracy: 0.94,
      trends: [
        { date: '2024-01-01', f1: 0.91, precision: 0.92, recall: 0.90 },
        { date: '2024-01-02', f1: 0.92, precision: 0.93, recall: 0.91 },
        { date: '2024-01-03', f1: 0.92, precision: 0.93, recall: 0.91 },
        { date: '2024-01-04', f1: 0.93, precision: 0.94, recall: 0.92 },
        { date: '2024-01-05', f1: 0.93, precision: 0.94, recall: 0.92 },
        { date: '2024-01-06', f1: 0.92, precision: 0.93, recall: 0.91 },
        { date: '2024-01-07', f1: 0.93, precision: 0.94, recall: 0.92 }
      ]
    },
    'llama-3': {
      precision: 0.91,
      recall: 0.90,
      f1Score: 0.905,
      accuracy: 0.92,
      trends: [
        { date: '2024-01-01', f1: 0.89, precision: 0.90, recall: 0.88 },
        { date: '2024-01-02', f1: 0.90, precision: 0.91, recall: 0.89 },
        { date: '2024-01-03', f1: 0.90, precision: 0.91, recall: 0.89 },
        { date: '2024-01-04', f1: 0.91, precision: 0.92, recall: 0.90 },
        { date: '2024-01-05', f1: 0.91, precision: 0.92, recall: 0.90 },
        { date: '2024-01-06', f1: 0.90, precision: 0.91, recall: 0.89 },
        { date: '2024-01-07', f1: 0.91, precision: 0.92, recall: 0.90 }
      ]
    }
  };

  const confusionMatrix = {
    'gpt-4': {
      truePositives: 950,
      trueNegatives: 930,
      falsePositives: 50,
      falseNegatives: 70
    },
    'claude-3': {
      truePositives: 930,
      trueNegatives: 910,
      falsePositives: 70,
      falseNegatives: 90
    },
    'llama-3': {
      truePositives: 910,
      trueNegatives: 890,
      falsePositives: 90,
      falseNegatives: 110
    }
  };

  const selectedMetrics = f1Metrics[selectedModel as keyof typeof f1Metrics];
  const matrix = confusionMatrix[selectedModel as keyof typeof confusionMatrix];

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'F1 Score', value: selectedMetrics.f1Score, icon: Target },
          { label: 'Precision', value: selectedMetrics.precision, icon: Award },
          { label: 'Recall', value: selectedMetrics.recall, icon: TrendingUp },
          { label: 'Accuracy', value: selectedMetrics.accuracy, icon: Brain }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-matrix-primary" />
                <span className="text-sm text-matrix-primary">
                  {(metric.value * 100).toFixed(1)}%
                </span>
              </div>
              <h4 className="text-sm font-medium text-foreground/70">{metric.label}</h4>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-matrix-primary">F1 Score Trends</h4>
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
              <LineChart data={selectedMetrics.trends}>
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#666" domain={[0.8, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="f1"
                  name="F1 Score"
                  stroke="#00ff00"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="precision"
                  name="Precision"
                  stroke="#00ffff"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="recall"
                  name="Recall"
                  stroke="#ff00ff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Confusion Matrix</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded bg-matrix-primary/10 border border-matrix-primary/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-matrix-primary">
                  {matrix.truePositives}
                </div>
                <div className="text-sm text-foreground/70">True Positives</div>
              </div>
            </div>
            <div className="p-4 rounded bg-matrix-tertiary/10 border border-matrix-tertiary/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-matrix-tertiary">
                  {matrix.falsePositives}
                </div>
                <div className="text-sm text-foreground/70">False Positives</div>
              </div>
            </div>
            <div className="p-4 rounded bg-matrix-tertiary/10 border border-matrix-tertiary/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-matrix-tertiary">
                  {matrix.falseNegatives}
                </div>
                <div className="text-sm text-foreground/70">False Negatives</div>
              </div>
            </div>
            <div className="p-4 rounded bg-matrix-primary/10 border border-matrix-primary/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-matrix-primary">
                  {matrix.trueNegatives}
                </div>
                <div className="text-sm text-foreground/70">True Negatives</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
