/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Tracks AI model health status including online/offline state, latency metrics,
 *              and uptime percentages. Uses mock data for demo purposes with simulated updates.
 */

"use client";

import { useState, useEffect } from 'react';

export type ModelStatus = 'online' | 'offline' | 'degraded' | 'maintenance';

interface ModelHealth {
  id: string;
  status: ModelStatus;
  latency: number;
  uptime: number;
  lastChecked: Date;
}

// Mock health data for demo mode
// Production would fetch from real monitoring service
const mockModelStatus: Record<string, ModelHealth> = {
  'gpt-4': {
    id: 'gpt-4',
    status: 'online',
    latency: 150,
    uptime: 99.9,
    lastChecked: new Date(),
  },
  'claude-3': {
    id: 'claude-3',
    status: 'online',
    latency: 145,
    uptime: 99.8,
    lastChecked: new Date(),
  },
  'llama-3': {
    id: 'llama-3',
    status: 'online',
    latency: 120,
    uptime: 99.7,
    lastChecked: new Date(),
  },
  'dall-e-3': {
    id: 'dall-e-3',
    status: 'online',
    latency: 250,
    uptime: 99.5,
    lastChecked: new Date(),
  },
  'midjourney-v6': {
    id: 'midjourney-v6',
    status: 'online',
    latency: 280,
    uptime: 99.4,
    lastChecked: new Date(),
  },
  'stable-diffusion-3': {
    id: 'stable-diffusion-3',
    status: 'online',
    latency: 200,
    uptime: 99.6,
    lastChecked: new Date(),
  },
  'whisper-v3': {
    id: 'whisper-v3',
    status: 'online',
    latency: 90,
    uptime: 99.8,
    lastChecked: new Date(),
  },
  'palm-2': {
    id: 'palm-2',
    status: 'online',
    latency: 160,
    uptime: 99.7,
    lastChecked: new Date(),
  }
};

/**
 * Monitors model health and provides status updates
 * @param {string} modelId - Unique identifier for the AI model
 * @return {{
 *   health: ModelHealth | null
 * }}
 */
export function useModelStatus(modelId: string) {
  const [health, setHealth] = useState<ModelHealth | null>(null);

  /**
   * @listens modelId - Reinitialises monitoring when model changes
   */
  useEffect(() => {
    // Initialise with mock data or offline status if model not found
    setHealth(mockModelStatus[modelId] || {
      id: modelId,
      status: 'offline',
      latency: 0,
      uptime: 0,
      lastChecked: new Date(),
    });

    // Simulate latency fluctuations every 5 seconds
    // Real implementation would poll actual monitoring endpoint
    const interval = setInterval(() => {
      setHealth((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          // Simulated latency variation of ±1ms per update
          latency: Math.max(1, prev.latency + (Math.random() - 0.5) * 2),
          lastChecked: new Date(),
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [modelId]);

  return { health };
}
