/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Floating 3D metrics with real-time updates
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Activity, Zap, DollarSign, TrendingUp } from 'lucide-react';

interface MetricInput {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

interface Metric extends MetricInput {
  id: string;
  position: { x: number; y: number; z: number };
}

interface FloatingMetricsProps {
  metrics?: MetricInput[];
}

export function FloatingMetrics({ metrics: inputMetrics }: FloatingMetricsProps = {}) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Use provided metrics or fall back to defaults
    const metricsToUse = inputMetrics || [
      {
        label: 'API Calls',
        value: '1,234',
        icon: Activity,
        color: '#00ff00'
      },
      {
        label: 'Avg Latency',
        value: '234ms',
        icon: Zap,
        color: '#00ffff'
      },
      {
        label: 'Total Cost',
        value: '$12.34',
        icon: DollarSign,
        color: '#ff00ff'
      },
      {
        label: 'Success Rate',
        value: '99.8%',
        icon: TrendingUp,
        color: '#ffff00'
      }
    ];

    // Default positions for up to 4 metrics
    const positions = [
      { x: -200, y: -100, z: 0 },
      { x: 200, y: -100, z: 50 },
      { x: -200, y: 100, z: 25 },
      { x: 200, y: 100, z: 75 }
    ];

    const initialMetrics: Metric[] = metricsToUse.map((metric, index) => ({
      ...metric,
      id: String(index + 1),
      position: positions[index] || { x: 0, y: 0, z: 0 }
    }));

    setMetrics(initialMetrics);
  }, [inputMetrics]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-[600px] perspective-1000">
      <AnimatePresence>
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const parallaxX = mousePosition.x * (metric.position.z + 50) / 10;
          const parallaxY = mousePosition.y * (metric.position.z + 50) / 10;

          return (
            <motion.div
              key={metric.id}
              className="absolute left-1/2 top-1/2"
              initial={{ opacity: 0, scale: 0, rotateY: -180 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateY: 0,
                x: metric.position.x + parallaxX,
                y: metric.position.y + parallaxY
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
                delay: index * 0.1
              }}
              whileHover={{
                scale: 1.1,
                rotateY: 15,
                rotateX: 10,
                transition: { type: 'spring', stiffness: 300 }
              }}
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateZ(${metric.position.z}px)`
              }}
            >
              <div
                className="relative p-6 rounded-xl backdrop-blur-md"
                style={{
                  background: `linear-gradient(135deg, ${metric.color}20, ${metric.color}10)`,
                  border: `2px solid ${metric.color}40`,
                  boxShadow: `0 0 30px ${metric.color}40, inset 0 0 20px ${metric.color}10`
                }}
              >
                {/* Holographic overlay */}
                <div
                  className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, transparent, ${metric.color}40, transparent)`,
                    animation: 'holographic 3s ease-in-out infinite'
                  }}
                />

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: metric.color }}
                    />
                  </motion.div>
                  <div className="text-center">
                    <p
                      className="text-2xl font-bold font-mono"
                      style={{ color: metric.color, textShadow: `0 0 10px ${metric.color}` }}
                    >
                      {metric.value}
                    </p>
                    <p className="text-sm text-foreground/60 mt-1">
                      {metric.label}
                    </p>
                  </div>
                </div>

                {/* Scan lines */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none opacity-20"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255, 255, 255, 0.05) 2px, rgba(255, 255, 255, 0.05) 4px)'
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <style jsx>{`
        @keyframes holographic {
          0%, 100% {
            transform: translateX(-100%) rotate(45deg);
            opacity: 0;
          }
          50% {
            transform: translateX(100%) rotate(45deg);
            opacity: 0.3;
          }
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
