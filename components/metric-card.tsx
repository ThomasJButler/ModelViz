/**
 * @file metric-card.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Metric card component displaying key performance indicators and statistics.
 */

"use client";

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

/**
 * @constructor
 */
export function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      <div className="flex justify-between items-start mb-4">
        <Icon className="w-6 h-6 text-matrix-primary" />
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-matrix-primary' : 'text-matrix-tertiary'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {change}
        </div>
      </div>
      <h3 className="text-sm text-foreground/70 mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}