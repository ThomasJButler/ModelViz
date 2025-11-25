/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description Matrix rain effect with customizable characters and colors
 */

"use client";

import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  className?: string;
  intensity?: number; // 0-1
  speed?: number; // pixels per frame
  fontSize?: number;
  color?: string;
}

export function MatrixRain({
  className = '',
  intensity = 0.5,
  speed = 1,
  fontSize = 16,
  color = '#00ff00'
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const charArray = chars.split('');

    // Columns
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Animation
    let animationFrameId: number;
    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Skip some columns based on intensity
        if (Math.random() > intensity) continue;

        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Draw character with glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fillText(char, x, y);

        // Reset drop if it goes off screen
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += speed;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, speed, fontSize, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ opacity: 0.15 }}
    />
  );
}
