/**
 * @file model-comparison.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model comparison tool for analysing and contrasting different AI model capabilities side by side.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip } from 'recharts';
import { Brain, Zap, Shield, Target } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface ModelInfo {
  id: string;
  name: string;
  icon: typeof Brain;
}

interface MetricData {
  metric: string;
  value: number;
}

interface ChartData {
  modelId: string;
  data: MetricData[];
}

/**
 * @constructor
 */
export function ModelComparison() {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Normalize a value to 0-100 scale
  const normalizeValue = (value: number, min: number, max: number, invert: boolean = false): number => {
    if (max === min) return 50; // Return middle value if all values are the same
    const normalized = ((value - min) / (max - min)) * 100;
    return invert ? 100 - normalized : normalized;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('month');

      // Check if we have real model data
      if (Object.keys(aggregated.byModel).length > 0) {
        // Extract models from real data
        const modelList: ModelInfo[] = Object.keys(aggregated.byModel).map((key, index) => {
          const [provider, modelName] = key.split(':');
          const icons = [Brain, Zap, Shield, Target];
          return {
            id: key,
            name: modelName || provider,
            icon: icons[index % icons.length]
          };
        });

        setModels(modelList);

        // Set first two models as selected by default
        if (selectedModels.length === 0 && modelList.length >= 2) {
          setSelectedModels([modelList[0].id, modelList[1].id]);
        } else if (selectedModels.length === 0 && modelList.length === 1) {
          setSelectedModels([modelList[0].id]);
        }

        // Find min/max values for normalization
        const allLatencies = Object.values(aggregated.byModel).map(m => m.avgLatency);
        const allCosts = Object.values(aggregated.byModel).map(m => m.avgCostPerCall);
        const allTokens = Object.values(aggregated.byModel).map(m => m.avgTokensPerCall);

        const minLatency = Math.min(...allLatencies);
        const maxLatency = Math.max(...allLatencies);
        const minCost = Math.min(...allCosts);
        const maxCost = Math.max(...allCosts);
        const minTokens = Math.min(...allTokens);
        const maxTokens = Math.max(...allTokens);

        // Build chart data for all models
        const allChartData: ChartData[] = modelList.map(model => {
          const stats = aggregated.byModel[model.id];
          return {
            modelId: model.id,
            data: [
              {
                metric: 'Success Rate',
                value: stats.successRate * 100
              },
              {
                metric: 'Speed',
                value: normalizeValue(stats.avgLatency, minLatency, maxLatency, true) // Lower is better
              },
              {
                metric: 'Cost Efficiency',
                value: normalizeValue(stats.avgCostPerCall, minCost, maxCost, true) // Lower is better
              },
              {
                metric: 'Reliability',
                value: (stats.successfulCalls / stats.totalCalls) * 100
              },
              {
                metric: 'Token Efficiency',
                value: normalizeValue(stats.avgTokensPerCall, minTokens, maxTokens, false)
              },
              {
                metric: 'Usage',
                value: Math.min(100, (stats.totalCalls / 100) * 100)
              }
            ]
          };
        });

        setChartData(allChartData);
      } else {
        // Fallback to demo data
        const demoModels: ModelInfo[] = [
          { id: 'gpt-4', name: 'GPT-4 Turbo', icon: Brain },
          { id: 'claude-3', name: 'Claude 3', icon: Zap },
          { id: 'llama-3', name: 'LLaMA 3', icon: Shield }
        ];

        setModels(demoModels);
        setSelectedModels(['gpt-4', 'claude-3']);

        const demoMetrics = [
          { name: 'Accuracy', gpt4: 98, claude3: 97, llama3: 96 },
          { name: 'Speed', gpt4: 92, claude3: 95, llama3: 97 },
          { name: 'Reliability', gpt4: 99, claude3: 98, llama3: 96 },
          { name: 'Cost Efficiency', gpt4: 85, claude3: 88, llama3: 94 },
          { name: 'Context Length', gpt4: 95, claude3: 98, llama3: 90 },
          { name: 'Consistency', gpt4: 96, claude3: 95, llama3: 93 }
        ];

        const demoChartData: ChartData[] = demoModels.map(model => ({
          modelId: model.id,
          data: demoMetrics.map(metric => {
            const key = model.id.replace('-', '') as keyof typeof metric;
            const value = metric[key];
            return {
              metric: metric.name,
              value: typeof value === 'number' ? value : 0
            };
          })
        }));

        setChartData(demoChartData);
      }

      setLoading(false);
    };

    loadData();

    // Listen for metrics updates
    const handleUpdate = () => loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('metrics-updated', handleUpdate);
      return () => {
        window.removeEventListener('metrics-updated', handleUpdate);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="mb-8">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-matrix-primary/50">Loading models...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-matrix-primary/50">No models available for comparison</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {models.map(model => {
              const Icon = model.icon;
              const isSelected = selectedModels.includes(model.id);
              const canSelect = isSelected || selectedModels.length < 2;

              return (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: canSelect ? 1.02 : 1 }}
                  whileTap={{ scale: canSelect ? 0.98 : 1 }}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedModels(prev => prev.filter(id => id !== model.id));
                    } else if (selectedModels.length < 2) {
                      setSelectedModels(prev => [...prev, model.id]);
                    }
                  }}
                  disabled={!canSelect && !isSelected}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary'
                      : canSelect
                      ? 'border border-border hover:border-matrix-primary/50 text-foreground/70'
                      : 'border border-border text-foreground/30 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{model.name}</span>
                </motion.button>
              );
            })}
          </div>
        )}
        <p className="text-sm text-foreground/50 mt-2">Select up to 2 models to compare</p>
      </div>

      {/* Radar Chart */}
      <div className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-matrix-tertiary">Loading comparison data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-matrix-tertiary">No model data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData[0]?.data}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="metric" stroke="#666" />
              {chartData.filter(m => selectedModels.includes(m.modelId)).map((model, index) => (
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
        )}
      </div>

      {/* Metrics Comparison */}
      {!loading && chartData.length > 0 && chartData[0]?.data && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          {chartData[0].data.map((metricData) => (
            <div key={metricData.metric} className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
              <h4 className="text-sm font-medium text-matrix-primary mb-2">{metricData.metric}</h4>
              <div className="space-y-2">
                {selectedModels.map(modelId => {
                  const modelData = chartData.find(m => m.modelId === modelId);
                  const value = modelData?.data.find(d => d.metric === metricData.metric)?.value || 0;
                  return (
                    <div key={modelId} className="flex justify-between items-center">
                      <span className="text-sm text-foreground/70">
                        {models.find(m => m.id === modelId)?.name}
                      </span>
                      <span className="text-sm font-medium text-matrix-primary">
                        {value.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}