/**
 * @file game-scenario.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Interactive game scenario component for demonstrating AI model capabilities.
 */

"use client";

import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: typeof LucideIcon;
  effects: {
    latency: number;
    errorRate: number;
    resourceUsage: number;
  };
}

interface GameScenarioProps {
  scenarios: Scenario[];
  activeScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
}

/**
 * @constructor
 */
export function GameScenario({ scenarios, activeScenario, onSelectScenario }: GameScenarioProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-matrix-primary/20 bg-card"
    >
      <h3 className="text-lg font-bold mb-4">Active Scenario</h3>
      <div className="space-y-4">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isActive = scenario.id === activeScenario.id;

          return (
            <motion.button
              key={scenario.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectScenario(scenario)}
              className={`w-full p-4 rounded-lg border ${
                isActive
                  ? 'border-matrix-primary bg-matrix-primary/10'
                  : 'border-border hover:border-matrix-primary/50'
              } transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-matrix-primary/20' : 'bg-background'
                }`}>
                  <Icon className="w-5 h-5 text-matrix-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium mb-1">{scenario.name}</h4>
                  <p className="text-sm text-foreground/70">{scenario.description}</p>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 grid grid-cols-3 gap-2 text-xs text-foreground/50"
                    >
                      <div>
                        Latency: {scenario.effects.latency}x
                      </div>
                      <div>
                        Errors: {(scenario.effects.errorRate * 100).toFixed(1)}%
                      </div>
                      <div>
                        Load: {scenario.effects.resourceUsage}x
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}