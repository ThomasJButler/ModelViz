/**
 * @file retention-metrics.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description User retention analytics with cohort analysis and engagement metrics visualisation.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Users, UserCheck, UserMinus, Activity } from 'lucide-react';

/**
 * @constructor
 */
export function RetentionMetrics() {
  const [timeRange, setTimeRange] = useState('7d');

  const retentionData = [
    { date: '2024-01-01', users: 1000, retained: 850, churned: 150 },
    { date: '2024-01-02', users: 1200, retained: 980, churned: 220 },
    { date: '2024-01-03', users: 1100, retained: 920, churned: 180 },
    { date: '2024-01-04', users: 1300, retained: 1050, churned: 250 },
    { date: '2024-01-05', users: 1250, retained: 1000, churned: 250 },
    { date: '2024-01-06', users: 1400, retained: 1150, churned: 250 },
    { date: '2024-01-07', users: 1350, retained: 1100, churned: 250 }
  ];

  const cohortData = Array.from({ length: 7 }, (_, week) => ({
    cohort: `Week ${week + 1}`,
    w1: 100,
    w2: Math.round(85 - week * 2),
    w3: Math.round(75 - week * 3),
    w4: Math.round(70 - week * 4),
    w5: Math.round(65 - week * 5),
    w6: Math.round(60 - week * 6)
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Users',
            value: '15.2K',
            change: '+12%',
            icon: Users
          },
          {
            title: 'Retained Users',
            value: '12.8K',
            change: '+8%',
            icon: UserCheck
          },
          {
            title: 'Churn Rate',
            value: '2.4%',
            change: '-0.5%',
            icon: UserMinus
          },
          {
            title: 'Engagement',
            value: '85%',
            change: '+5%',
            icon: Activity
          }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-matrix-primary" />
                <span className={`text-sm ${
                  metric.change.startsWith('+') 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h4 className="text-sm font-medium text-foreground/70">{metric.title}</h4>
              <p className="text-2xl font-bold text-matrix-primary">{metric.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Retention Chart */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-matrix-primary">User Retention</h4>
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
            <AreaChart data={retentionData}>
              <defs>
                <linearGradient id="retainedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="churnedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff00ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#666"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="retained"
                name="Retained Users"
                stroke="#00ff00"
                fillOpacity={1}
                fill="url(#retainedGradient)"
              />
              <Area
                type="monotone"
                dataKey="churned"
                name="Churned Users"
                stroke="#ff00ff"
                fillOpacity={1}
                fill="url(#churnedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cohort Analysis */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <h4 className="text-sm font-medium text-matrix-primary mb-4">Cohort Analysis</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2 text-foreground/70">Cohort</th>
                {['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map(week => (
                  <th key={week} className="p-2 text-foreground/70">{week}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.map((row) => (
                <tr key={row.cohort}>
                  <td className="p-2 text-foreground/70">{row.cohort}</td>
                  {['w1', 'w2', 'w3', 'w4', 'w5', 'w6'].map((week) => (
                    <td key={week} className="p-2">
                      <div className="flex justify-center">
                        <div
                          className="h-8 rounded"
                          style={{
                            width: `${row[week as keyof typeof row]}%`,
                            backgroundColor: `rgba(0, 255, 0, ${Number(row[week as keyof typeof row]) / 100})`
                          }}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}