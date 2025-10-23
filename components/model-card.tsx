/**
 * @file model-card.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model card component displaying AI model information, capabilities, and metrics.
 */

"use client";

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ModelStatusBadge } from './model-status-badge';

export interface ModelMetrics {
  accuracy: number;
  latency: number;
  requests: string;
  costper1k: number; 
  contextLength: number;
  dailyQuota: number;
}

export interface ModelCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  provider: string;
  metrics: ModelMetrics;
  capabilities?: string[];
  bestFor?: string[];
  limitations?: string[];
}

/**
 * @constructor
 */
export function ModelCard({
  id,
  title,
  description,
  icon: Icon,
  category,
  provider,
  metrics,
  capabilities = []
}: ModelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className="group relative p-6 rounded-lg border border-border bg-card hover:border-matrix-secondary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-matrix-primary/10 overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-matrix-primary/5 via-transparent to-matrix-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={false}
      />
      
      {/* Glow effect on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-matrix-primary/20 via-matrix-secondary/20 to-matrix-tertiary/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10" />
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-8 h-8 text-matrix-secondary transition-all duration-300 group-hover:text-matrix-primary group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-matrix-primary">{title}</h3>
            <p className="text-sm text-matrix-primary/70 transition-colors duration-300 group-hover:text-matrix-primary">{provider}</p>
          </div>
        </div>
        <ModelStatusBadge modelId={id} />
      </div>

      <p className="relative z-10 text-sm text-foreground/70 mb-6 transition-colors duration-300 group-hover:text-foreground/90">{description}</p>

      <div className="relative z-10 grid grid-cols-3 gap-4 text-sm mb-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-transparent transition-all duration-300 hover:border-matrix-primary/30"
        >
          <p className="text-foreground/50 text-xs">Accuracy</p>
          <p className="font-semibold text-matrix-primary text-lg">{metrics.accuracy}%</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-transparent transition-all duration-300 hover:border-matrix-secondary/30"
        >
          <p className="text-foreground/50 text-xs">Latency</p>
          <p className="font-semibold text-matrix-secondary text-lg">{metrics.latency}ms</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-transparent transition-all duration-300 hover:border-matrix-tertiary/30"
        >
          <p className="text-foreground/50 text-xs">Requests</p>
          <p className="font-semibold text-matrix-tertiary text-lg">{metrics.requests}</p>
        </motion.div>
      </div>

      {capabilities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <p className="text-sm font-medium mb-2 text-foreground/70 group-hover:text-foreground transition-colors duration-300">Capabilities</p>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((capability, index) => (
              <motion.span
                key={capability}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 text-xs rounded-full bg-matrix-primary/10 text-matrix-primary border border-matrix-primary/20 backdrop-blur-sm transition-all duration-300 hover:bg-matrix-primary/20 hover:border-matrix-primary/40 hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]"
              >
                {capability}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}