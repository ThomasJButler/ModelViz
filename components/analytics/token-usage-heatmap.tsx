/**
 * @file token-usage-heatmap.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Token usage heatmap visualisation showing 24-hour activity patterns across the week.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Zap } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface HeatmapCell {
  hour: number;
  day: number;
  value: number;
  tokens: number;
}

/**
 * @constructor
 */
export function TokenUsageHeatmap() {
  const [data, setData] = useState<HeatmapCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  /** @constructs */
  useEffect(() => {
    const loadData = async () => {
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');

      // Check if we have real data
      if (aggregated.hourlyStats && aggregated.hourlyStats.length > 0) {
        // Find max tokens for normalization
        const maxTokens = Math.max(...aggregated.hourlyStats.map(stat => stat.tokens), 1);

        // Create a map of existing hourly data
        const hourlyMap: Record<string, { tokens: number; value: number }> = {};
        aggregated.hourlyStats.forEach(stat => {
          const date = new Date(stat.timestamp);
          const day = date.getDay();
          const hour = date.getHours();
          const key = `${day}-${hour}`;

          // Aggregate if multiple entries for same hour/day
          if (hourlyMap[key]) {
            hourlyMap[key].tokens += stat.tokens;
            hourlyMap[key].value = hourlyMap[key].tokens / maxTokens;
          } else {
            hourlyMap[key] = {
              tokens: stat.tokens,
              value: stat.tokens / maxTokens
            };
          }
        });

        // Fill in all cells (7 days x 24 hours)
        const filledData: HeatmapCell[] = [];
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            const key = `${day}-${hour}`;
            const existing = hourlyMap[key];

            if (existing) {
              filledData.push({
                day,
                hour,
                value: existing.value,
                tokens: existing.tokens
              });
            } else {
              filledData.push({ hour, day, value: 0, tokens: 0 });
            }
          }
        }

        setData(filledData);
      } else {
        // Fallback to demo data if no real data exists
        const newData: HeatmapCell[] = [];
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            // Create realistic patterns
            let baseValue = Math.sin(hour / 24 * Math.PI) * 0.5 + 0.5; // Daily pattern
            baseValue *= 1 - Math.cos(day / 7 * Math.PI) * 0.3; // Weekly pattern

            // Add some randomness
            const value = Math.min(1, Math.max(0, baseValue + (Math.random() - 0.5) * 0.3));
            const tokens = Math.floor(value * 10000); // Scale to realistic token counts

            newData.push({ hour, day, value, tokens });
          }
        }
        setData(newData);
      }
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
  }, []);

  const getDayLabel = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  const getTimeLabel = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getColor = (value: number) => {
    const intensity = Math.floor(value * 255);
    return `rgb(0, ${intensity}, 0)`;
  };

  return (
    <div className="p-6 rounded-lg border border-matrix-primary/20 bg-background/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-matrix-primary">Token Usage Heatmap</h3>
          <p className="text-sm text-foreground/70">24-hour activity patterns</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-matrix-primary" />
            <span className="text-sm text-matrix-primary">Hourly Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-matrix-secondary" />
            <span className="text-sm text-matrix-secondary">7-Day View</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Time labels */}
        <div className="flex mb-2">
          <div className="w-16" /> {/* Spacer for day labels */}
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-xs text-foreground/50">{getTimeLabel(i)}</span>
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {Array.from({ length: 7 }, (_, day) => (
            <div key={day} className="flex items-center">
              <div className="w-16 text-sm text-foreground/70">
                {getDayLabel(day)}
              </div>
              <div className="flex-1 flex gap-1">
                {data
                  .filter(cell => cell.day === day)
                  .map(cell => (
                    <motion.div
                      key={`${cell.day}-${cell.hour}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: cell.hour * 0.01 }}
                      className="flex-1 aspect-square relative group"
                      onMouseEnter={() => setSelectedCell(cell)}
                      onMouseLeave={() => setSelectedCell(null)}
                    >
                      <div
                        className="w-full h-full rounded transition-all duration-200 group-hover:scale-110 group-hover:z-10"
                        style={{ backgroundColor: getColor(cell.value) }}
                      />
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bg-background/90 backdrop-blur-sm border border-matrix-primary/20 p-3 rounded-lg shadow-lg z-20"
            style={{
              left: `${(selectedCell.hour / 24) * 100}%`,
              top: `${((selectedCell.day + 1) / 7) * 100}%`,
              transform: 'translate(-50%, 20px)'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-matrix-primary" />
              <span className="font-medium">{selectedCell.tokens.toLocaleString()} tokens</span>
            </div>
            <div className="text-sm text-foreground/70">
              {getDayLabel(selectedCell.day)} at {getTimeLabel(selectedCell.hour)}
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-8">
          {[0, 0.25, 0.5, 0.75, 1].map(value => (
            <div key={value} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getColor(value) }}
              />
              <span className="text-xs text-foreground/70">
                {Math.floor(value * 10000).toLocaleString()} tokens
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}