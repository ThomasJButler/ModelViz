/**
 * @file model-comparison.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model comparison component for detailed side-by-side analysis.
 */

"use client";

import { motion } from 'framer-motion';
import { X, Check, Minus, AlertTriangle } from 'lucide-react';
import type { ModelCardProps } from './model-card';

interface ModelComparisonProps {
  models: ModelCardProps[];
  onClose: () => void;
}

/**
 * @constructor
 */
export function ModelComparison({ models, onClose }: ModelComparisonProps) {
  const metrics = [
    { key: 'accuracy', label: 'Accuracy', format: (v: string | number) => `${v}%`, color: 'text-matrix-primary' },
    { key: 'latency', label: 'Latency', format: (v: string | number) => `${v}ms`, color: 'text-matrix-secondary' },
    { key: 'requests', label: 'Total Requests', format: (v: string | number) => `${v}`, color: 'text-matrix-tertiary' },
    { key: 'costper1k', label: 'Cost per 1K', format: (v: string | number) => `$${v}`, color: 'text-yellow-500' },
    { key: 'contextLength', label: 'Context Length', format: (v: string | number) => typeof v === 'number' ? v.toLocaleString() : v, color: 'text-blue-500' },
    { key: 'dailyQuota', label: 'Daily Quota', format: (v: string | number) => typeof v === 'number' ? v.toLocaleString() : v, color: 'text-purple-500' }
  ];

  const getMetricComparison = (metric: string, index: number) => {
    const value1 = models[0].metrics[metric as keyof typeof models[0]['metrics']];
    const value2 = models[1].metrics[metric as keyof typeof models[1]['metrics']];
    
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      const isBetterHigher = metric === 'accuracy' || metric === 'requests' || metric === 'contextLength' || metric === 'dailyQuota';
      const model1Better = isBetterHigher ? value1 > value2 : value1 < value2;
      return index === 0 ? model1Better : !model1Better;
    }
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="relative"
    >
      <motion.div 
        className="absolute -top-16 right-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border hover:border-red-500/50 hover:text-red-500 transition-all duration-300 group"
        >
          <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {models.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.2,
              type: "spring",
              stiffness: 100
            }}
            className="relative p-6 rounded-lg border border-border bg-card overflow-hidden group"
          >
            {/* Winner highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-matrix-primary/0 via-matrix-primary/5 to-matrix-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 mb-6">
              <model.icon className="w-8 h-8 text-matrix-secondary" />
              <div>
                <h3 className="text-xl font-semibold">{model.title}</h3>
                <p className="text-sm text-matrix-primary">{model.provider}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Metrics */}
              <div className="relative z-10">
                <h4 className="text-sm font-medium mb-3 text-foreground/80">Performance Metrics</h4>
                <div className="space-y-3">
                  {metrics.map(({ key, label, format, color }) => {
                    const isBetter = getMetricComparison(key, index);
                    return (
                      <motion.div 
                        key={key} 
                        className="flex justify-between items-center p-2 rounded-lg bg-background/50 backdrop-blur-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + metrics.indexOf(metrics.find(m => m.key === key)!) * 0.05 }}
                      >
                        <span className="text-sm text-foreground/70">{label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${color}`}>
                            {format(model.metrics[key as keyof typeof model.metrics])}
                          </span>
                          {isBetter && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                            >
                              <Check className="w-4 h-4 text-matrix-primary" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h4 className="text-sm font-medium mb-3">Capabilities</h4>
                <div className="space-y-2">
                  {(model.capabilities ?? []).map((capability) => (
                    <div key={capability} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-matrix-primary" />
                      <span className="text-sm">{capability}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div>
                <h4 className="text-sm font-medium mb-3">Best Use Cases</h4>
                <div className="space-y-2">
                  {(model.bestFor ?? []).map((useCase) => (
                    <div key={useCase} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-matrix-secondary" />
                      <span className="text-sm">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limitations */}
              <div>
                <h4 className="text-sm font-medium mb-3">Limitations</h4>
                <div className="space-y-2">
                  {(model.limitations ?? []).map((limitation) => (
                    <div key={limitation} className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-matrix-tertiary" />
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}