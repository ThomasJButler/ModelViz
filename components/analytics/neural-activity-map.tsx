/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Neural network activity visualisation showing real-time layer activations with canvas-based rendering,
 *              animated neuron firing patterns, particle effects, pulse waves, and interactive hover details.
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
  pulsePhase: number;
};

type Connection = {
  from: Neuron;
  to: Neuron;
  weight: number;
  pulseProgress: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

type MatrixChar = {
  x: number;
  y: number;
  char: string;
  opacity: number;
  speed: number;
};

/**
 * @constructor
 */
export function NeuralActivityMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNeuron, setHoveredNeuron] = useState<{ x: number; y: number; activation: number } | null>(null);
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
  const particlesRef = useRef<Particle[]>([]);
  const matrixRainRef = useRef<MatrixChar[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  /**
   * Initialises neural network structure with enhanced visual effects
   * @constructs
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Generate neurons for each layer with pulse phase
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
          layer: layerIndex,
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
    });

    neuronsRef.current = neurons;

    // Generate connections with pulse progress
    const connections: Connection[] = [];
    let neuronIndex = 0;

    for (let layerIndex = 0; layerIndex < layerSizes.length - 1; layerIndex++) {
      const currentLayerStart = neuronIndex;
      const currentLayerSize = layerSizes[layerIndex];
      const nextLayerStart = neuronIndex + currentLayerSize;
      const nextLayerSize = layerSizes[layerIndex + 1];

      for (let i = 0; i < currentLayerSize; i += Math.max(1, Math.floor(currentLayerSize / 20))) {
        for (let j = 0; j < nextLayerSize; j += Math.max(1, Math.floor(nextLayerSize / 20))) {
          connections.push({
            from: neurons[currentLayerStart + i],
            to: neurons[nextLayerStart + j],
            weight: Math.random() * 0.3 + 0.1,
            pulseProgress: Math.random()
          });
        }
      }

      neuronIndex += currentLayerSize;
    }

    connectionsRef.current = connections;

    // Initialise matrix rain characters
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    for (let i = 0; i < 30; i++) {
      matrixRainRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        opacity: Math.random() * 0.3,
        speed: Math.random() * 0.5 + 0.2
      });
    }

    // Mouse move handler for neuron hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Check if hovering over a neuron
      let foundNeuron = null;
      for (const neuron of neurons) {
        const dx = neuron.x - mouseRef.current.x;
        const dy = neuron.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10) {
          foundNeuron = neuron;
          break;
        }
      }
      setHoveredNeuron(foundNeuron);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop for enhanced effects
    let animationFrame: number;
    let lastUpdate = Date.now();
    let globalTime = 0;

    const animate = () => {
      const now = Date.now();
      const delta = now - lastUpdate;

      if (delta > 30) { // Increased frame rate for smoother animations
        lastUpdate = now;
        globalTime += 0.05;

        // Clear with slight fade for trail effect
        ctx.fillStyle = 'rgba(10, 10, 10, 0.92)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw matrix rain background
        ctx.font = '10px monospace';
        matrixRainRef.current.forEach(char => {
          char.y += char.speed * 2;
          char.opacity *= 0.98;

          if (char.y > canvas.height) {
            char.y = 0;
            char.x = Math.random() * canvas.width;
            char.opacity = 0.3;
          }

          ctx.fillStyle = `rgba(0, 255, 0, ${char.opacity * 0.1})`;
          ctx.fillText(char.char, char.x, char.y);
        });

        // Draw gradient mesh background
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.02)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.01)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0.005)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw connections with pulse waves
        connections.forEach(conn => {
          conn.pulseProgress += 0.02;
          if (conn.pulseProgress > 1) {
            conn.pulseProgress = 0;
            // Trigger particle on pulse completion if highly active
            if (conn.from.activation > 0.7 && particlesRef.current.length < 100) {
              particlesRef.current.push({
                x: conn.to.x,
                y: conn.to.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                color: 'cyan'
              });
            }
          }

          const opacity = conn.weight * conn.from.activation;

          // Base connection line
          ctx.strokeStyle = `rgba(0, 255, 0, ${opacity * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(conn.from.x, conn.from.y);
          ctx.lineTo(conn.to.x, conn.to.y);
          ctx.stroke();

          // Draw pulse wave along connection
          if (conn.from.activation > 0.5) {
            const pulseX = conn.from.x + (conn.to.x - conn.from.x) * conn.pulseProgress;
            const pulseY = conn.from.y + (conn.to.y - conn.from.y) * conn.pulseProgress;

            ctx.fillStyle = `rgba(0, 255, 255, ${(1 - conn.pulseProgress) * conn.from.activation})`;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= 0.02;
          particle.vy += 0.05; // Gravity effect

          if (particle.life > 0) {
            ctx.fillStyle = `rgba(0, 255, 255, ${particle.life * 0.8})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 1 + particle.life * 2, 0, Math.PI * 2);
            ctx.fill();

            // Particle trail
            ctx.strokeStyle = `rgba(0, 255, 255, ${particle.life * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
            ctx.stroke();
          }

          return particle.life > 0;
        });

        // Draw neurons with enhanced effects
        let activeCount = 0;
        let totalActivation = 0;

        neurons.forEach(neuron => {
          // Update activation with pulse rhythm
          neuron.pulsePhase += 0.05;
          const pulseFactor = Math.sin(neuron.pulsePhase) * 0.05;
          neuron.activation += (Math.random() - 0.5) * 0.1 + pulseFactor;
          neuron.activation = Math.max(0, Math.min(1, neuron.activation));

          if (neuron.activation > 0.5) activeCount++;
          totalActivation += neuron.activation;

          // Enhanced color gradient
          let color;
          if (neuron.activation < 0.33) {
            const t = neuron.activation * 3;
            color = `rgba(0, ${Math.floor(255 * t)}, 0, ${0.6 + neuron.activation * 0.4})`;
          } else if (neuron.activation < 0.66) {
            const t = (neuron.activation - 0.33) * 3;
            color = `rgba(0, ${Math.floor(255 * (1 - t))}, ${Math.floor(255 * t)}, ${0.7 + neuron.activation * 0.3})`;
          } else {
            const t = (neuron.activation - 0.66) * 3;
            color = `rgba(${Math.floor(255 * t)}, 0, 255, ${0.8 + neuron.activation * 0.2})`;
          }

          // Depth effect - middle layers slightly larger
          const depthScale = neuron.layer === 1 || neuron.layer === 2 ? 1.2 : 1;
          const baseRadius = (2 + neuron.activation * 2) * depthScale;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, baseRadius, 0, Math.PI * 2);
          ctx.fill();

          // Glow effect for active neurons
          if (neuron.activation > 0.6) {
            const glowRadius = 6 + neuron.activation * 6;
            ctx.fillStyle = `rgba(0, 255, 255, ${(neuron.activation - 0.6) * 0.2})`;
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, glowRadius * depthScale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Lightning effect for very active neurons
          if (neuron.activation > 0.85 && Math.random() > 0.95) {
            // Find random nearby neuron in next layer
            const nextLayerNeurons = neurons.filter(n => n.layer === neuron.layer + 1);
            if (nextLayerNeurons.length > 0) {
              const target = nextLayerNeurons[Math.floor(Math.random() * nextLayerNeurons.length)];

              ctx.strokeStyle = `rgba(255, 255, 255, ${neuron.activation})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(neuron.x, neuron.y);

              // Lightning bolt with segments
              const segments = 5;
              for (let i = 1; i <= segments; i++) {
                const t = i / segments;
                const x = neuron.x + (target.x - neuron.x) * t + (Math.random() - 0.5) * 10;
                const y = neuron.y + (target.y - neuron.y) * t + (Math.random() - 0.5) * 10;
                ctx.lineTo(x, y);
              }

              ctx.stroke();
            }

            // Spawn particles at highly active neurons
            if (particlesRef.current.length < 100) {
              for (let i = 0; i < 3; i++) {
                particlesRef.current.push({
                  x: neuron.x,
                  y: neuron.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 1,
                  color: 'magenta'
                });
              }
            }
          }
        });

        // Update metrics
        const avgActivation = totalActivation / neurons.length;
        const efficiency = (activeCount / neurons.length) * 100;
        const loadLevel = avgActivation > 0.7 ? 'CRITICAL' : avgActivation > 0.5 ? 'HIGH' : avgActivation > 0.3 ? 'MEDIUM' : 'LOW';

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
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const getLoadColour = (load: string) => {
    switch (load) {
      case 'CRITICAL': return 'text-purple-500';
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
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,255,0,0.3)' }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-5 h-5 text-matrix-primary" />
            <span className="text-sm font-medium text-matrix-primary font-mono">
              {metrics.activeNeurons} / {metrics.totalNeurons}
            </span>
          </div>
          <h4 className="text-sm text-foreground/70">Active Neurons</h4>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,255,255,0.3)' }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-matrix-secondary" />
            <span className="text-sm font-medium text-matrix-secondary font-mono">
              {metrics.avgActivation.toFixed(3)}
            </span>
          </div>
          <h4 className="text-sm text-foreground/70">Avg Activation</h4>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255,0,255,0.3)' }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-matrix-tertiary" />
            <span className="text-sm font-medium text-matrix-tertiary font-mono">
              {metrics.layerEfficiency.toFixed(1)}%
            </span>
          </div>
          <h4 className="text-sm text-foreground/70">Layer Efficiency</h4>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Gauge className="w-5 h-5 text-foreground/70" />
            <span className={`text-sm font-medium ${getLoadColour(metrics.networkLoad)} font-mono`}>
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
        className="p-6 rounded-lg border border-matrix-primary/20 bg-background/50 backdrop-blur-sm relative overflow-hidden"
      >
        <h3 className="text-sm font-medium text-matrix-primary mb-4">Network Activity</h3>

        {/* Hover tooltip */}
        {hoveredNeuron && (
          <div
            className="absolute z-10 px-2 py-1 bg-black/90 border border-matrix-primary rounded text-xs text-matrix-primary"
            style={{
              left: hoveredNeuron.x + 10,
              top: hoveredNeuron.y - 30
            }}
          >
            Activation: {hoveredNeuron.activation.toFixed(3)}
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-[400px] rounded-lg cursor-crosshair"
          style={{ background: '#0a0a0a' }}
        />

        {/* Layer Labels */}
        <div className="flex justify-around mt-4 text-xs text-foreground/70">
          {['Input', 'Hidden 1', 'Hidden 2', 'Hidden 3', 'Output'].map((label, index) => (
            <div key={label} className="text-center">
              <div className="text-matrix-primary font-medium">{label}</div>
              <div className="font-mono">{layerSizes[index]} neurons</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Layer Breakdown with enhanced styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-background/50 backdrop-blur-sm"
      >
        <h3 className="text-sm font-medium text-matrix-primary mb-4">Layer Activity Analysis</h3>
        <div className="space-y-3">
          {['Input Layer', 'Hidden Layer 1', 'Hidden Layer 2', 'Hidden Layer 3', 'Output Layer'].map((layer, index) => {
            const activity = 92 - index * 15;
            const colors = [
              'from-green-500 to-green-400',
              'from-cyan-500 to-cyan-400',
              'from-blue-500 to-blue-400',
              'from-purple-500 to-purple-400',
              'from-magenta-500 to-magenta-400'
            ];

            return (
              <div key={layer}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground/70">{layer}</span>
                  <span className="text-sm text-matrix-primary font-medium font-mono">{activity}%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activity}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                    className={`h-2 rounded-full bg-gradient-to-r ${colors[index]} shadow-lg`}
                    style={{
                      boxShadow: `0 0 10px rgba(0, 255, ${index * 50}, 0.5)`
                    }}
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