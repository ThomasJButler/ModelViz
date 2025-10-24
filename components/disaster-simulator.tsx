/**
 * @file disaster-simulator.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Disaster scenario simulator for testing system resilience and failover.
 */

"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Shield, Activity } from 'lucide-react';

interface DisasterSimulatorProps {
  onTrigger: (type: string) => void;
}

/**
 * @constructor
 */
export function DisasterSimulator({ onTrigger }: DisasterSimulatorProps) {
  const disasters = [
    {
      id: 'high-load',
      name: 'Traffic Spike',
      description: 'Simulate sudden traffic increase',
      icon: Activity,
      severity: 'warning'
    },
    {
      id: 'network-issues',
      name: 'Network Outage',
      description: 'Simulate network instability',
      icon: Zap,
      severity: 'error'
    },
    {
      id: 'security-incident',
      name: 'Security Breach',
      description: 'Simulate security incident',
      icon: Shield,
      severity: 'critical'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-matrix-primary/20 bg-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-matrix-tertiary" />
        <h3 className="text-lg font-bold">Disaster Simulator</h3>
      </div>

      <div className="space-y-3">
        {disasters.map((disaster) => {
          const Icon = disaster.icon;
          
          return (
            <motion.button
              key={disaster.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTrigger(disaster.id)}
              className="w-full p-3 rounded-lg border border-matrix-tertiary/20 bg-matrix-tertiary/5 hover:bg-matrix-tertiary/10 transition-colors flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-matrix-tertiary/10">
                <Icon className="w-4 h-4 text-matrix-tertiary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-matrix-tertiary">{disaster.name}</h4>
                <p className="text-sm text-foreground/50">{disaster.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}