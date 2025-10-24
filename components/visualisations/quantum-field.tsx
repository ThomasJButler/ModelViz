/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Quantum field visualisation with charged particles and dynamic force interactions
 */

"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * @constructor
 */
export default function QuantumField() {
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
    const particleCount = 100;
    const maxDistance = 150;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        charge: Math.random() < 0.5 ? -1 : 1
      });
    }

    let frame = 0;
    function animate() {
      frame = requestAnimationFrame(animate);
      ctx!.fillStyle = 'rgba(13, 13, 13, 0.1)';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach(particle => {
        particles.forEach(other => {
          if (particle === other) return;

          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const force = (particle.charge * other.charge) / (distance * distance);
            const angle = Math.atan2(dy, dx);

            particle.vx += Math.cos(angle) * force * 0.1;
            particle.vy += Math.sin(angle) * force * 0.1;
            const gradient = ctx!!.createLinearGradient(
              particle.x, particle.y, other.x, other.y
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, other.color);

            ctx!.beginPath();
            ctx!.strokeStyle = gradient;
            ctx!.lineWidth = (1 - distance / maxDistance) * 2;
            ctx!.moveTo(particle.x, particle.y);
            ctx!.lineTo(other.x, other.y);
            ctx!.stroke();
          }
        });
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > canvas!.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas!.height) particle.vy *= -1;
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        ctx!.beginPath();
        ctx!.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx!.fillStyle = particle.color;
        ctx!.fill();
        const gradient = ctx!.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 4
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx!.beginPath();
        ctx!.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
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