/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Neural network flow visualisation with animated signals propagating through layers
 */

"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * @constructor
 */
export default function NeuralFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** @constructs */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const neurons: any[] = [];
    const synapses: any[] = [];
    const layerCount = 5;
    const neuronsPerLayer = 6;
    for (let layer = 0; layer < layerCount; layer++) {
      for (let i = 0; i < neuronsPerLayer; i++) {
        const x = (layer + 1) * (canvas.width / (layerCount + 1));
        const y = (i + 1) * (canvas.height / (neuronsPerLayer + 1));
        
        neurons.push({
          x,
          y,
          radius: 4,
          activation: 0,
          layer
        });
      }
    }
    neurons.forEach((neuron, i) => {
      if (neuron.layer < layerCount - 1) {
        const nextLayer = neurons.filter(n => n.layer === neuron.layer + 1);
        nextLayer.forEach(target => {
          synapses.push({
            source: neuron,
            target,
            weight: Math.random(),
            signals: []
          });
        });
      }
    });

    function createSignal(synapse: any) {
      synapse.signals.push({
        position: 0,
        strength: Math.random(),
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
      });
    }

    let frame = 0;
    function animate() {
      frame = requestAnimationFrame(animate);
      ctx!.fillStyle = 'rgba(13, 13, 13, 0.1)';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      neurons.filter(n => n.layer === 0).forEach(neuron => {
        if (Math.random() < 0.05) {
          neuron.activation = 1;
        }
      });
      synapses.forEach(synapse => {
        if (synapse.source.activation > 0.5 && Math.random() < 0.1) {
          createSignal(synapse);
        }
        ctx!.beginPath();
        ctx!.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        ctx!.lineWidth = 1;
        ctx!.moveTo(synapse.source.x, synapse.source.y);
        ctx!.lineTo(synapse.target.x, synapse.target.y);
        ctx!.stroke();
        synapse.signals = synapse.signals.filter((signal: any) => {
          signal.position += 0.02;

          if (signal.position >= 1) {
            synapse.target.activation = Math.min(1, synapse.target.activation + signal.strength * 0.5);
            return false;
          }

          const x = synapse.source.x + (synapse.target.x - synapse.source.x) * signal.position;
          const y = synapse.source.y + (synapse.target.y - synapse.source.y) * signal.position;
          const gradient = ctx!.createRadialGradient(x, y, 0, x, y, 4);
          gradient.addColorStop(0, signal.color);
          gradient.addColorStop(1, 'transparent');

          ctx!.beginPath();
          ctx!.fillStyle = gradient;
          ctx!.arc(x, y, 4, 0, Math.PI * 2);
          ctx!.fill();

          return true;
        });
      });
      neurons.forEach(neuron => {
        neuron.activation *= 0.95;
        const gradient = ctx!.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, neuron.radius * 2
        );
        gradient.addColorStop(0, `rgba(0, 255, 0, ${neuron.activation})`);
        gradient.addColorStop(1, 'transparent');

        ctx!.beginPath();
        ctx!.fillStyle = gradient;
        ctx!.arc(neuron.x, neuron.y, neuron.radius * 2, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.beginPath();
        ctx!.fillStyle = '#00ff00';
        ctx!.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
        ctx!.fill();
      });
    }

    animate();

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[400px] w-full"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ background: '#0d0d0d' }}
      />
    </motion.div>
  );
}