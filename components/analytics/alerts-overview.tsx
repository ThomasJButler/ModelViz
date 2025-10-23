/**
 * @file alerts-overview.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description System alerts and notifications overview dashboard displaying active and historical alerts.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, Bell, BellOff } from 'lucide-react';

/**
 * @constructor
 */
export function AlertsOverview() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const alerts = [
    {
      id: 1,
      type: 'critical',
      title: 'High Memory Usage',
      description: 'Memory utilisation exceeded 90%',
      time: '2 minutes ago',
      status: 'active'
    },
    {
      id: 2,
      type: 'warning',
      title: 'API Latency Spike',
      description: 'Response time increased by 50%',
      time: '15 minutes ago',
      status: 'active'
    },
    {
      id: 3,
      type: 'info',
      title: 'New Model Version',
      description: 'GPT-4 Turbo update available',
      time: '1 hour ago',
      status: 'resolved'
    },
    {
      id: 4,
      type: 'critical',
      title: 'Rate Limit Warning',
      description: '80% of API quota consumed',
      time: '2 hours ago',
      status: 'resolved'
    }
  ];

  const alertTypes = {
    critical: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20'
    },
    info: {
      icon: CheckCircle,
      color: 'text-matrix-primary',
      bg: 'bg-matrix-primary/10',
      border: 'border-matrix-primary/20'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <div className="flex items-center gap-4">
          {alertsEnabled ? (
            <Bell className="w-5 h-5 text-matrix-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-foreground/50" />
          )}
          <div>
            <h4 className="font-medium">Alert Notifications</h4>
            <p className="text-sm text-foreground/70">
              {alertsEnabled ? 'Notifications are enabled' : 'Notifications are disabled'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAlertsEnabled(!alertsEnabled)}
          className={`px-4 py-2 rounded-lg border transition-colours ${
            alertsEnabled
              ? 'border-matrix-primary text-matrix-primary'
              : 'border-foreground/20 text-foreground/50'
          }`}
        >
          {alertsEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-matrix-primary">Active Alerts</h4>
        <div className="space-y-3">
          {alerts.filter(alert => alert.status === 'active').map((alert) => {
            const AlertIcon = alertTypes[alert.type as keyof typeof alertTypes].icon;
            const styles = alertTypes[alert.type as keyof typeof alertTypes];

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border ${styles.border} ${styles.bg}`}
              >
                <div className="flex items-start gap-3">
                  <AlertIcon className={`w-5 h-5 ${styles.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-medium ${styles.color}`}>{alert.title}</h5>
                      <div className="flex items-center gap-2 text-sm text-foreground/50">
                        <Clock className="w-4 h-4" />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/70 mt-1">{alert.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-matrix-primary">Alert History</h4>
        <div className="space-y-3">
          {alerts.filter(alert => alert.status === 'resolved').map((alert) => {
            const AlertIcon = alertTypes[alert.type as keyof typeof alertTypes].icon;

            return (
              <motion.div
                key={alert.id}
                className="p-4 rounded-lg border border-border bg-background/50"
              >
                <div className="flex items-start gap-3">
                  <AlertIcon className="w-5 h-5 text-foreground/50" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-foreground/70">{alert.title}</h5>
                      <div className="flex items-center gap-2 text-sm text-foreground/50">
                        <Clock className="w-4 h-4" />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/50 mt-1">{alert.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
