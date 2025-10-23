/**
 * @file feature-grid.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Feature showcase grid displaying application capabilities and highlights.
 */

"use client";

import { motion } from 'framer-motion';
import { Brain, Cpu, Lock, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Advanced AI Models",
    description: "State-of-the-art neural networks trained on massive datasets"
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Lightning-fast inference with sub-10ms latency"
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-grade encryption and data protection"
  },
  {
    icon: Cpu,
    title: "Scalable Infrastructure",
    description: "Cloud-native architecture that grows with you"
  }
];

/**
 * @constructor
 */
export function FeatureGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-lg border border-border bg-card hover:border-matrix-primary/50 transition-colors"
            >
              <feature.icon className="w-10 h-10 text-matrix-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-foreground/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}