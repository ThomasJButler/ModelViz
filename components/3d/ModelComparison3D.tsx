/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Interactive 3D model performance comparison with rotating bars
 */

"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MetricsService } from '@/lib/services/MetricsService';
import { Brain, Zap, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

interface ModelMetric {
  model: string;
  provider: string;
  latency: number; // normalized 0-100
  successRate: number; // 0-100
  costEfficiency: number; // normalized 0-100
  throughput: number; // normalized 0-100
  totalCalls: number;
}

export function ModelComparison3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [models, setModels] = useState<ModelMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'latency' | 'successRate' | 'costEfficiency' | 'throughput'>('latency');
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    loadModelData();

    const handleUpdate = () => loadModelData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  const loadModelData = async () => {
    try {
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');

      const modelMetrics: ModelMetric[] = [];

      Object.entries(aggregated.byModel).forEach(([modelKey, stats]) => {
        const [provider, model] = modelKey.split(':');

        // Normalize metrics to 0-100 scale
        const latency = Math.max(0, 100 - (stats.avgLatency / 10)); // Lower is better
        const successRate = stats.successRate * 100;
        const costEfficiency = Math.max(0, 100 - (stats.avgCostPerCall * 10000)); // Lower cost is better
        const throughput = stats.totalCalls; // Higher is better

        modelMetrics.push({
          model,
          provider,
          latency,
          successRate,
          costEfficiency,
          throughput: Math.min(100, throughput / 10),
          totalCalls: stats.totalCalls
        });
      });

      setModels(modelMetrics);
    } catch (error) {
      console.error('Failed to load model data:', error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || models.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw 3D grid base
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw circular grid
      for (let r = 1; r <= 5; r++) {
        ctx.beginPath();
        ctx.arc(0, 0, (radius / 5) * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.1 + r * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw radial lines
      const angleStep = (Math.PI * 2) / models.length;
      models.forEach((_, index) => {
        const angle = angleStep * index;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius
        );
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw 3D bars for each model
      models.forEach((model, index) => {
        const angle = angleStep * index;
        const value = model[selectedMetric];
        const barHeight = (value / 100) * radius;
        const barWidth = 30;

        const x = Math.cos(angle) * radius * 0.7;
        const y = Math.sin(angle) * radius * 0.7;

        // Draw 3D bar
        const color = getProviderColor(model.provider);

        // Back face
        ctx.fillStyle = `${color}40`;
        ctx.fillRect(x - barWidth / 2, y - barHeight, barWidth, barHeight);

        // Front face (lighter)
        ctx.fillStyle = `${color}80`;
        ctx.fillRect(x - barWidth / 2 + 2, y - barHeight + 2, barWidth - 4, barHeight - 4);

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fillRect(x - barWidth / 2 + 4, y - barHeight + 4, barWidth - 8, barHeight - 8);
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          model.model.slice(0, 10),
          x,
          y + 20
        );

        // Value
        ctx.fillStyle = color;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(
          value.toFixed(0),
          x,
          y - barHeight - 10
        );
      });

      ctx.restore();

      // Draw legend
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Metric: ${selectedMetric.toUpperCase()}`, 20, 30);

      setRotation(prev => (prev + 0.5) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [models, selectedMetric, rotation]);

  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      'OpenAI': '#00ff00',
      'Anthropic': '#ff00ff',
      'DeepSeek': '#00ffff',
      'Google': '#ffff00'
    };
    return colors[provider] || '#ffffff';
  };

  const metrics = [
    { id: 'latency', label: 'Latency', icon: Zap, description: 'Response speed' },
    { id: 'successRate', label: 'Success Rate', icon: CheckCircle, description: 'Reliability' },
    { id: 'costEfficiency', label: 'Cost Efficiency', icon: DollarSign, description: 'Value for money' },
    { id: 'throughput', label: 'Throughput', icon: TrendingUp, description: 'Usage volume' }
  ];

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-foreground/60">
        <Brain className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">No model data available yet</p>
        <p className="text-sm">Start making API calls to see the comparison</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Metric selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <motion.button
              key={metric.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMetric(metric.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                selectedMetric === metric.id
                  ? 'bg-matrix-primary/20 border-2 border-matrix-primary text-matrix-primary'
                  : 'bg-black/50 border border-matrix-primary/30 text-foreground/70 hover:border-matrix-primary/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <div className="text-left">
                <p className="text-sm font-bold">{metric.label}</p>
                <p className="text-xs opacity-60">{metric.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 3D Canvas */}
      <div className="relative rounded-lg border border-matrix-primary/20 bg-black/50 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-[600px]"
        />

        {/* Overlay effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scan lines */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0, 255, 0, 0.5) 2px, rgba(0, 255, 0, 0.5) 4px)'
            }}
          />

          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-matrix-primary/50" />
          <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-matrix-primary/50" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-matrix-primary/50" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-matrix-primary/50" />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {models.map((model, index) => (
          <motion.div
            key={model.model}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg border border-matrix-primary/20 bg-black/30"
            style={{
              borderColor: `${getProviderColor(model.provider)}40`
            }}
          >
            <p
              className="font-bold text-sm mb-1"
              style={{ color: getProviderColor(model.provider) }}
            >
              {model.model}
            </p>
            <p className="text-xs text-foreground/60">{model.provider}</p>
            <p className="text-xs text-foreground/60 mt-1">
              {model.totalCalls} calls
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
