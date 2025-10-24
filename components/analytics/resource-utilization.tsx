/**
 * @file resource-utilization.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description System resource utilisation dashboard monitoring CPU, memory, network, and storage usage.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Cpu, MemoryStick as Memory, Network, Database } from 'lucide-react';

/**
 * @constructor
 */
export function ResourceUtilization() {
  const [selectedResource, setSelectedResource] = useState('cpu');
  
  const resources = [
    { name: 'CPU', value: 65, color: '#00ff00', icon: Cpu },
    { name: 'Memory', value: 78, color: '#00ffff', icon: Memory },
    { name: 'Network', value: 45, color: '#ff00ff', icon: Network },
    { name: 'Storage', value: 32, color: '#ffff00', icon: Database }
  ];

  const detailedData = {
    cpu: [
      { name: 'User Processes', value: 45 },
      { name: 'System Processes', value: 20 },
      { name: 'Idle', value: 35 }
    ],
    memory: [
      { name: 'Active', value: 48 },
      { name: 'Cached', value: 30 },
      { name: 'Free', value: 22 }
    ],
    network: [
      { name: 'Inbound', value: 25 },
      { name: 'Outbound', value: 20 },
      { name: 'Available', value: 55 }
    ],
    storage: [
      { name: 'Models', value: 20 },
      { name: 'Cache', value: 12 },
      { name: 'Free', value: 68 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          const isSelected = selectedResource === resource.name.toLowerCase();
          
          return (
            <motion.button
              key={resource.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedResource(resource.name.toLowerCase())}
              className={`p-4 rounded-lg border ${
                isSelected
                  ? 'border-matrix-primary bg-matrix-primary/10'
                  : 'border-border hover:border-matrix-primary/50'
              } transition-colors`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-matrix-primary" />
                <span className="text-sm font-medium">{resource.value}%</span>
              </div>
              <h4 className="text-sm font-medium">{resource.name}</h4>
              <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${resource.value}%` }}
                  className="h-full"
                  style={{ backgroundColor: resource.color }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Distribution */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Resource Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={detailedData[selectedResource as keyof typeof detailedData]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {detailedData[selectedResource as keyof typeof detailedData].map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={[
                        '#00ff00',
                        '#00ffff',
                        '#ff00ff'
                      ][index % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Details */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Resource Details</h4>
          <div className="space-y-4">
            {detailedData[selectedResource as keyof typeof detailedData].map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">{item.name}</span>
                  <span className="text-matrix-primary">{item.value}%</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className="h-full"
                    style={{
                      backgroundColor: [
                        '#00ff00',
                        '#00ffff',
                        '#ff00ff'
                      ][index % 3]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}