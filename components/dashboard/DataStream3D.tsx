/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Real-time 3D data stream visualization with live updates
 */

"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricsService } from '@/lib/services/MetricsService';
import { Activity, CheckCircle, XCircle, Zap } from 'lucide-react';

interface StreamData {
  id: string;
  timestamp: number;
  provider: string;
  model: string;
  status: 'success' | 'error' | 'timeout';
  latency: number;
  tokens: number;
  cost: number;
}

export function DataStream3D() {
  const [streamData, setStreamData] = useState<StreamData[]>([]);
  const [isLive, setIsLive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRecentData = async () => {
      try {
        const service = MetricsService.getInstance();
        const recent = await service.getRecentMetrics(20);

        const formatted = recent.map(metric => ({
          id: metric.id,
          timestamp: metric.timestamp,
          provider: metric.provider,
          model: metric.model,
          status: metric.status,
          latency: metric.latency,
          tokens: metric.tokensUsed,
          cost: metric.estimatedCost
        }));

        setStreamData(formatted);
      } catch (error) {
        console.error('Failed to load stream data:', error);
      }
    };

    loadRecentData();

    const handleMetricsUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const metric = customEvent.detail;

      if (!metric) return;

      const newData: StreamData = {
        id: metric.id || crypto.randomUUID(),
        timestamp: metric.timestamp,
        provider: metric.provider,
        model: metric.model,
        status: metric.status,
        latency: metric.latency,
        tokens: metric.tokensUsed,
        cost: metric.estimatedCost
      };

      setStreamData(prev => [newData, ...prev].slice(0, 20));
    };

    window.addEventListener('metrics-updated', handleMetricsUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleMetricsUpdate);
    };
  }, []);

  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      'OpenAI': '#00ff00',
      'Anthropic': '#ff00ff',
      'DeepSeek': '#00ffff',
      'Google': '#ffff00'
    };
    return colors[provider] || '#ffffff';
  };

  return (
    <div className="relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-matrix-primary flex items-center gap-3">
          <Activity className="w-6 h-6" />
          Live Data Stream
        </h2>
        <motion.div
          animate={{
            scale: isLive ? [1, 1.2, 1] : 1,
            opacity: isLive ? 1 : 0.5
          }}
          transition={{
            duration: 2,
            repeat: isLive ? Infinity : 0
          }}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-matrix-primary/10 border border-matrix-primary"
        >
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-matrix-primary' : 'bg-foreground/30'}`} />
          <span className="text-sm text-matrix-primary">{isLive ? 'LIVE' : 'PAUSED'}</span>
        </motion.div>
      </div>

      {/* Stream Container */}
      <div
        ref={containerRef}
        className="relative h-[500px] overflow-hidden rounded-lg border border-matrix-primary/20 bg-black/50"
        style={{
          perspective: '1000px'
        }}
      >
        {/* 3D Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 255, 0, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: 'rotateX(60deg) scale(2)',
              transformOrigin: 'center'
            }}
          />
        </div>

        {/* Data Stream */}
        <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-matrix-primary/30 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {streamData.map((data, index) => (
              <motion.div
                key={data.id}
                initial={{
                  opacity: 0,
                  x: -100,
                  rotateY: -90,
                  scale: 0.8
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  rotateY: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  x: 100,
                  rotateY: 90,
                  scale: 0.8
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.02
                }}
                className="relative mb-2 mx-4"
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    z: 20,
                    rotateY: -5
                  }}
                  className="relative p-4 rounded-lg backdrop-blur-md"
                  style={{
                    background: `linear-gradient(135deg, ${getProviderColor(data.provider)}15, ${getProviderColor(data.provider)}05)`,
                    border: `1px solid ${getProviderColor(data.provider)}30`,
                    boxShadow: `0 0 20px ${getProviderColor(data.provider)}20`
                  }}
                >
                  {/* Holographic scan line */}
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, transparent, ${getProviderColor(data.provider)}30, transparent)`,
                      backgroundSize: '100% 50px'
                    }}
                    animate={{
                      y: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {data.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-matrix-primary" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p
                          className="font-bold"
                          style={{ color: getProviderColor(data.provider) }}
                        >
                          {data.provider}
                        </p>
                        <p className="text-sm text-foreground/60">{data.model}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-foreground/60">Latency</p>
                        <p className="font-mono text-matrix-secondary">{data.latency}ms</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-foreground/60">Tokens</p>
                        <p className="font-mono text-matrix-tertiary">{data.tokens}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-foreground/60">Cost</p>
                        <p className="font-mono text-yellow-500">${data.cost.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {streamData.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-foreground/40">
              <Zap className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Waiting for API calls...</p>
              <p className="text-sm">Data will stream here in real-time</p>
            </div>
          )}
        </div>

        {/* Glitch overlay effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-lg mix-blend-screen"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 0, 0.03) 50%, transparent 100%)'
          }}
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>
    </div>
  );
}
