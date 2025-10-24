/**
 * @file playground-monitoring.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Playground monitoring dashboard tracking usage and performance metrics.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Brain, Network, Cpu } from 'lucide-react';
import { SystemStatus } from './system-status';
import { GameScenario } from './game-scenario';
import { DisasterSimulator } from './disaster-simulator';
import { PerformanceMetrics } from './performance-metrics';

interface PlaygroundMonitoringProps {
  systemMetrics: {
    cpu: number;
    memory: number;
    network: number;
    errorRate: number;
  };
  activeScenario: any;
  onScenarioChange: (scenario: any) => void;
  selectedModel: string;
}

const scenarios = [
  { id: 'scenario1', name: 'Basic Scenario', description: 'A simple test scenario', icon: Brain, effects: { latency: 0, errorRate: 0, resourceUsage: 0 } },
  { id: 'scenario2', name: 'Advanced Scenario', description: 'A more complex scenario', icon: Network, effects: { latency: 0, errorRate: 0, resourceUsage: 0 } }
];

const tabs = [
  { id: 'status', label: 'System Status', icon: Activity },
  { id: 'scenarios', label: 'Scenarios', icon: Brain },
  { id: 'disasters', label: 'Disasters', icon: Shield },
  { id: 'performance', label: 'Performance', icon: Zap }
];

/**
 * @constructor
 */
export function PlaygroundMonitoring({
  systemMetrics,
  activeScenario,
  onScenarioChange,
  selectedModel
}: PlaygroundMonitoringProps) {
  const [activeTab, setActiveTab] = useState('status');

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary'
                  : 'border border-border hover:border-matrix-primary/50 text-foreground/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'status' && (
          <SystemStatus metrics={systemMetrics} />
        )}

        {activeTab === 'scenarios' && (
          <GameScenario
            scenarios={scenarios}
            activeScenario={activeScenario}
            onSelectScenario={onScenarioChange}
          />
        )}

        {activeTab === 'disasters' && (
          <DisasterSimulator
            onTrigger={(type) => {
              const scenario = scenarios.find(s => s.id === type);
              if (scenario) onScenarioChange(scenario);
            }}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceMetrics
            model={selectedModel}
            scenario={activeScenario}
            metrics={systemMetrics}
          />
        )}
      </motion.div>
    </div>
  );
}