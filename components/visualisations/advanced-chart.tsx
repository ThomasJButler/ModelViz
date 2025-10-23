/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Advanced area chart visualisation displaying time-series data with multiple data streams
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { generateTimeSeriesData } from '@/lib/data';

/**
 * @constructor
 */
export default function AdvancedChart() {
  const [data, setData] = useState(generateTimeSeriesData());

  /** @constructs */
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateTimeSeriesData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[400px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff00ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="timestamp" 
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
            labelFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <Area
            type="monotone"
            dataKey="value1"
            name="Base Load"
            stroke="#00ff00"
            fillOpacity={1}
            fill="url(#gradient1)"
          />
          <Area
            type="monotone"
            dataKey="value2"
            name="API Calls"
            stroke="#00ffff"
            fillOpacity={1}
            fill="url(#gradient2)"
          />
          <Area
            type="monotone"
            dataKey="value3"
            name="Active Users"
            stroke="#ff00ff"
            fillOpacity={1}
            fill="url(#gradient3)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}