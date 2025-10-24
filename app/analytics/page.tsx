/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Analytics dashboard page providing advanced insights and predictive analytics for AI models
 */
"use client";

import { motion } from 'framer-motion';
import { AnalyticsTabs } from '@/components/analytics/analytics-tabs';

/**
 * @constructor
 */
export default function AnalyticsPage() {
  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
            Analytics Dashboard
          </h1>
          <p className="text-foreground/70">
            Advanced insights and predictive analytics for your AI models
          </p>
        </motion.div>

        <AnalyticsTabs />
      </div>
    </div>
  );
}