/**
 * @file matrix-background.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Matrix-style animated background effect for visual enhancement.
 */

"use client";

import { useEffect, useRef } from 'react';

/**
 * @constructor
 */
export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** @constructs */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      (ctx as CanvasRenderingContext2D).fillStyle = 'rgba(13, 13, 13, 0.05)';
      (ctx as CanvasRenderingContext2D).fillRect(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height);

      (ctx as CanvasRenderingContext2D).fillStyle = '#0f0';
      (ctx as CanvasRenderingContext2D).font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        (ctx as CanvasRenderingContext2D).fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-bg"
      aria-hidden="true"
    />
  );
}