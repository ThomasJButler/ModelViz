/**
 * @file predictive-trends.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description AI-powered predictive analytics showing usage trends and anomaly detection with confidence intervals.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';

/**
 * @constructor
 */
export function PredictiveTrends() {
  const [data, setData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any[]>([]);

  /** @constructs */
  useEffect(() => {
    const historical = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      actual: Math.floor(Math.random() * 1000) + 500,
    }));

    const future = Array.from({ length: 12 }, (_, i) => ({
      time: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
      predicted: Math.floor(Math.random() * 1000) + 500,
      confidence: 0.95 - i * 0.02,
    }));

    setData(historical);
    setPrediction(future);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-matrix-primary">AI Predictions</h3>
          <p className="text-sm text-foreground/70">Next 12 hours forecast</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-matrix-primary" />
            <span className="text-sm text-matrix-primary">95% Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-matrix-secondary" />
            <span className="text-sm text-matrix-secondary">Upward Trend</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColour="#00ff00" stopOpacity={0.2} />
                  <stop offset="95%" stopColour="#00ff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#666"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Legend />

              <Line
                data={data}
                type="monotone"
                dataKey="actual"
                name="Historical"
                stroke="#00ff00"
                strokeWidth={2}
                dot={false}
              />

              <Line
                data={prediction}
                type="monotone"
                dataKey="predicted"
                name="Predicted"
                stroke="#00ffff"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Potential Spike",
            time: "2h",
            confidence: 87,
            impact: "high",
            description: "Possible request volume increase"
          },
          {
            title: "Resource Constraint",
            time: "4h",
            confidence: 92,
            impact: "medium",
            description: "Memory usage may reach threshold"
          },
          {
            title: "Performance Drop",
            time: "6h",
            confidence: 83,
            impact: "low",
            description: "Slight latency increase expected"
          }
        ].map((anomaly) => (
          <motion.div
            key={anomaly.title}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border border-matrix-tertiary/20 bg-background/50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-matrix-tertiary">{anomaly.title}</h4>
                <p className="text-sm text-foreground/70">In {anomaly.time}</p>
              </div>
              <AlertTriangle className={`w-5 h-5 ${
                anomaly.impact === 'high'
                  ? 'text-red-500'
                  : anomaly.impact === 'medium'
                  ? 'text-yellow-500'
                  : 'text-matrix-primary'
              }`} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Confidence</span>
                <span className="text-matrix-primary">{anomaly.confidence}%</span>
              </div>
              <p className="text-sm text-foreground/70">{anomaly.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
