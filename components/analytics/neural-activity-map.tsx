/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Neural network activity visualisation showing real-time layer activations with canvas-based rendering,
 *              animated neuron firing patterns, and data flow through network layers.
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Zap, Gauge } from 'lucide-react';

type Neuron = {
  x: number;
  y: number;
  activation: number;
  layer: number;
};

type Connection = {
  from: Neuron;
  to: Neuron;
  weight: number;
};

/**
 * @constructor
 */
export function NeuralActivityMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState({
    activeNeurons: 0,
    totalNeurons: 832,
    avgActivation: 0,
    layerEfficiency: 0,
    networkLoad: 'MEDIUM'
  });

  const layerSizes = [128, 256, 256, 128, 64];
  const neuronsRef = useRef<Neuron[]>([]);
  const connectionsRef = useRef<Connection[]>([]);

  /**
   * Initialises neural network structure with layers and connections
   * @constructs
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Generate neurons for each layer
    const neurons: Neuron[] = [];
    const layerSpacing = canvas.width / (layerSizes.length + 1);

    layerSizes.forEach((size, layerIndex) => {
      const x = layerSpacing * (layerIndex + 1);
      const neuronSpacing = canvas.height / (size + 1);

      for (let i = 0; i < size; i++) {
        neurons.push({
          x,
          y: neuronSpacing * (i + 1),
          activation: Math.random() * 0.3,
          layer: layerIndex
        });
      }
    });

    neuronsRef.current = neurons;

    // Generate connections between adjacent layers
    const connections: Connection[] = [];
    let neuronIndex = 0;

    for (let layerIndex = 0; layerIndex < layerSizes.length - 1; layerIndex++) {
      const currentLayerStart = neuronIndex;
      const currentLayerSize = layerSizes[layerIndex];
      const nextLayerStart = neuronIndex + currentLayerSize;
      const nextLayerSize = layerSizes[layerIndex + 1];

      // Connect subset of neurons to avoid visual clutter
      for (let i = 0; i < currentLayerSize; i += Math.max(1, Math.floor(currentLayerSize / 20))) {
        for (let j = 0; j < nextLayerSize; j += Math.max(1, Math.floor(nextLayerSize / 20))) {
          connections.push({
            from: neurons[currentLayerStart + i],
            to: neurons[nextLayerStart + j],
            weight: Math.random() * 0.3 + 0.1
          });
        }
      }

      neuronIndex += currentLayerSize;
    }

    connectionsRef.current = connections;

    // Animation loop for neuron activation and rendering
    let animationFrame: number;
    let lastUpdate = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = now - lastUpdate;

      if (delta > 50) {
        lastUpdate = now;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw connections with opacity based on weight
        connections.forEach(conn => {
          const opacity = conn.weight * conn.from.activation;
          ctx.strokeStyle = `rgba(0, 255, 0, ${opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(conn.from.x, conn.from.y);
          ctx.lineTo(conn.to.x, conn.to.y);
          ctx.stroke();
        });

        // Draw neurons with colour based on activation
        let activeCount = 0;
        let totalActivation = 0;

        neurons.forEach(neuron => {
          // Randomly update activation to simulate activity
          neuron.activation += (Math.random() - 0.5) * 0.1;
          neuron.activation = Math.max(0, Math.min(1, neuron.activation));

          if (neuron.activation > 0.5) activeCount++;
          totalActivation += neuron.activation;

          // Colour gradient from green → cyan → magenta based on activation
          let color;
          if (neuron.activation < 0.5) {
            const t = neuron.activation * 2;
            color = `rgba(0, ${Math.floor(255 * t)}, 0, ${0.6 + neuron.activation * 0.4})`;
          } else {
            const t = (neuron.activation - 0.5) * 2;
            color = `rgba(${Math.floor(255 * t)}, ${Math.floor(255 * (1 - t))}, 255, ${0.8 + neuron.activation * 0.2})`;
          }

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, 2 + neuron.activation * 2, 0, Math.PI * 2);
          ctx.fill();

          // Glow effect for highly active neurons
          if (neuron.activation > 0.7) {
            ctx.fillStyle = `rgba(0, 255, 255, ${(neuron.activation - 0.7) * 0.3})`;
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, 6 + neuron.activation * 4, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Update metrics
        const avgActivation = totalActivation / neurons.length;
        const efficiency = (activeCount / neurons.length) * 100;
        const loadLevel = avgActivation > 0.7 ? 'HIGH' : avgActivation > 0.4 ? 'MEDIUM' : 'LOW';

        setMetrics({
          activeNeurons: activeCount,
          totalNeurons: neurons.length,
          avgActivation,
          layerEfficiency: efficiency,
          networkLoad: loadLevel
        });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const getLoadColour = (load: string) => {
    switch (load) {
      case 'HIGH': return 'text-red-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'LOW': return 'text-matrix-primary';
      default: return 'text-foreground/70';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
        >
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-5 h-5 text-matrix-primary" />
            <span className="text-sm font-medium text-matrix-primary">
              {metrics.activeNeurons} / {metrics.totalNeurons}
            </span>
          </div>
          <h4 className="text-sm text-foreground/70">Active Neurons</h4>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-matrix-secondary" />
            <span className="text-sm font-medium text-matrix-secondary">
              {metrics.avgActivation.toFixed(2)}
            </span>
          </div>
          <h4 className="text-sm text-foreground/70">Avg Activation</h4>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
        >
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-matrix-tertiary" />
            <span className="text-sm font-medium text-matrix-tertiary">
              {metrics.layerEfficiency.toFixed(1)}%
            </span>
          </div>
          <h4 className="text-sm text-foreground/70">Layer Efficiency</h4>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
        >
          <div className="flex items-center justify-between mb-2">
            <Gauge className="w-5 h-5 text-foreground/70" />
            <span className={`text-sm font-medium ${getLoadColour(metrics.networkLoad)}`}>
              {metrics.networkLoad}
            </span>
          </div>
          <h4 className="text-sm text-foreground/70">Network Load</h4>
        </motion.div>
      </div>

      {/* Canvas Visualisation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-background/50 relative"
      >
        <h3 className="text-sm font-medium text-matrix-primary mb-4">Network Activity</h3>
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] rounded-lg"
          style={{ background: '#0a0a0a' }}
        />

        {/* Layer Labels */}
        <div className="flex justify-around mt-4 text-xs text-foreground/70">
          <div className="text-centre">
            <div className="text-matrix-primary font-medium">Input</div>
            <div>{layerSizes[0]} neurons</div>
          </div>
          <div className="text-centre">
            <div className="text-matrix-primary font-medium">Hidden 1</div>
            <div>{layerSizes[1]} neurons</div>
          </div>
          <div className="text-centre">
            <div className="text-matrix-primary font-medium">Hidden 2</div>
            <div>{layerSizes[2]} neurons</div>
          </div>
          <div className="text-centre">
            <div className="text-matrix-primary font-medium">Hidden 3</div>
            <div>{layerSizes[3]} neurons</div>
          </div>
          <div className="text-centre">
            <div className="text-matrix-primary font-medium">Output</div>
            <div>{layerSizes[4]} neurons</div>
          </div>
        </div>
      </motion.div>

      {/* Layer Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-background/50"
      >
        <h3 className="text-sm font-medium text-matrix-primary mb-4">Layer Breakdown</h3>
        <div className="space-y-3">
          {['Input Layer', 'Hidden 1', 'Hidden 2', 'Hidden 3', 'Output'].map((layer, index) => {
            const activity = 85 - index * 12;
            return (
              <div key={layer}>
                <div className="flex items-centre justify-between mb-1">
                  <span className="text-sm text-foreground/70">{layer}</span>
                  <span className="text-sm text-matrix-primary font-medium">{activity}% active</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activity}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="h-2 rounded-full bg-gradient-to-r from-matrix-primary to-matrix-secondary"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
