/**
 * @file security-insights.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Security monitoring dashboard tracking threats, events, and system vulnerability insights.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Key, UserX, FileWarning, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

/**
 * @constructor
 */
export function SecurityInsights() {
  const [timeRange, setTimeRange] = useState('7d');

  const securityEvents = [
    { timestamp: '2024-01-01', attempts: 150, blocked: 148, suspicious: 12 },
    { timestamp: '2024-01-02', attempts: 180, blocked: 175, suspicious: 15 },
    { timestamp: '2024-01-03', attempts: 160, blocked: 158, suspicious: 10 },
    { timestamp: '2024-01-04', attempts: 200, blocked: 195, suspicious: 18 },
    { timestamp: '2024-01-05', attempts: 190, blocked: 187, suspicious: 14 },
    { timestamp: '2024-01-06', attempts: 220, blocked: 215, suspicious: 20 },
    { timestamp: '2024-01-07', attempts: 210, blocked: 205, suspicious: 16 }
  ];

  const threatCategories = [
    {
      type: 'Rate Limiting',
      count: 245,
      trend: 'up',
      severity: 'medium',
      icon: RefreshCw
    },
    {
      type: 'Invalid Auth',
      count: 158,
      trend: 'down',
      severity: 'high',
      icon: UserX
    },
    {
      type: 'API Abuse',
      count: 89,
      trend: 'up',
      severity: 'critical',
      icon: AlertTriangle
    },
    {
      type: 'Data Access',
      count: 67,
      trend: 'down',
      severity: 'low',
      icon: FileWarning
    }
  ];

  const securityScore = 92;

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="p-6 rounded-lg border border-matrix-primary/20 bg-background/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-medium text-matrix-primary">Security Score</h4>
            <p className="text-sm text-foreground/70">Overall system security rating</p>
          </div>
          <Shield className="w-8 h-8 text-matrix-primary" />
        </div>
        
        <div className="relative h-4 bg-background rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${securityScore}%` }}
            className="h-full bg-matrix-primary"
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-foreground/70">Current Score</span>
          <span className="text-matrix-primary font-bold">{securityScore}%</span>
        </div>
      </div>

      {/* Security Events Chart */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-matrix-primary">Security Events</h4>
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
            <AreaChart data={securityEvents}>
              <defs>
                <linearGradient id="attemptsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff0000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
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
                dataKey="attempts"
                name="Attempts"
                stroke="#ff0000"
                fill="url(#attemptsGradient)"
              />
              <Area
                type="monotone"
                dataKey="blocked"
                name="Blocked"
                stroke="#00ff00"
                fill="url(#blockedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {threatCategories.map((threat) => {
          const Icon = threat.icon;
          return (
            <motion.div
              key={threat.type}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg border ${
                threat.severity === 'critical'
                  ? 'border-red-500/20 bg-red-500/10'
                  : threat.severity === 'high'
                  ? 'border-yellow-500/20 bg-yellow-500/10'
                  : 'border-matrix-primary/20 bg-background/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${
                  threat.severity === 'critical'
                    ? 'text-red-500'
                    : threat.severity === 'high'
                    ? 'text-yellow-500'
                    : 'text-matrix-primary'
                }`} />
                <div>
                  <h4 className="font-medium">{threat.type}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{threat.count}</span>
                    <span className={`text-sm ${
                      threat.trend === 'up' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {threat.trend === 'up' ? '↑' : '↓'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: 'Enable 2FA',
            description: 'Strengthen account security with two-factor authentication',
            icon: Key,
            priority: 'high'
          },
          {
            title: 'API Rate Limiting',
            description: 'Implement stricter rate limiting policies',
            icon: RefreshCw,
            priority: 'medium'
          }
        ].map((rec) => {
          const Icon = rec.icon;
          return (
            <motion.div
              key={rec.title}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-matrix-secondary/20 bg-background/50"
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-matrix-secondary" />
                <div>
                  <h4 className="font-medium text-matrix-secondary">{rec.title}</h4>
                  <p className="text-sm text-foreground/70 mt-1">{rec.description}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                    rec.priority === 'high'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {rec.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}