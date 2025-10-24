/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Canvas-based data flow visualisation with animated particles and connection lines
 */

"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * @constructor
 */
export default function DataFlowDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** @constructs */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: any[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: ['#00ff00', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 3)],
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(13, 13, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        particles.forEach(other => {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(${particle.color.match(/\w\w/g)?.map((c: string) => parseInt(c, 16)).join(',')},${1 - distance / 100})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      <h2 className="text-xl font-bold mb-4 text-matrix-secondary">Data Flow Visualisation</h2>
      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-lg"
        style={{ background: '#0d0d0d' }}
      />
    </motion.div>
  );
}