/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description 3D visualization of AI response with animated text flow
 */

"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';

interface ResponseVisualization3DProps {
  text: string;
  isAnimating: boolean;
  provider: string;
  model: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  opacity: number;
}

export function ResponseVisualization3D({
  text,
  isAnimating,
  provider,
  model
}: ResponseVisualization3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (!isAnimating) {
      setDisplayText(text);
      setCurrentIndex(text.length);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [text, isAnimating, currentIndex]);

  // Particle system for characters
  useEffect(() => {
    if (!isAnimating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const newParticles: Particle[] = [];
    const chars = displayText.split('');

    // Create particles from recent characters
    for (let i = Math.max(0, chars.length - 20); i < chars.length; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        char: chars[i],
        opacity: 1
      });
    }

    setParticles(newParticles);

    // Animate particles
    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      newParticles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.opacity *= 0.99;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.fillStyle = `rgba(0, 255, 0, ${particle.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        ctx.fillText(particle.char, particle.x, particle.y);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [displayText, isAnimating]);

  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      'OpenAI': '#00ff00',
      'Anthropic': '#ff00ff',
      'DeepSeek': '#00ffff',
      'Google': '#ffff00'
    };
    return colors[provider] || '#00ff00';
  };

  return (
    <div className="relative w-full min-h-[400px]">
      {/* Background particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30"
      />

      {/* Main content area */}
      <div className="relative z-10 p-6">
        {/* Header with animated icon */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.div
            animate={{
              rotate: isAnimating ? 360 : 0,
              scale: isAnimating ? [1, 1.2, 1] : 1
            }}
            transition={{
              rotate: { duration: 2, repeat: isAnimating ? Infinity : 0, ease: 'linear' },
              scale: { duration: 1, repeat: isAnimating ? Infinity : 0 }
            }}
          >
            <Brain
              className="w-8 h-8"
              style={{ color: getProviderColor(provider) }}
            />
          </motion.div>
          <div>
            <p className="text-sm font-mono" style={{ color: getProviderColor(provider) }}>
              {provider}
            </p>
            <p className="text-xs text-foreground/60">{model}</p>
          </div>
          {isAnimating && (
            <motion.div
              className="ml-auto flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-matrix-primary" />
              <span className="text-xs text-matrix-primary">Generating...</span>
            </motion.div>
          )}
        </motion.div>

        {/* Response text with 3D perspective */}
        <motion.div
          className="relative"
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          <AnimatePresence mode="wait">
            {displayText && (
              <motion.div
                initial={{ opacity: 0, rotateX: -15, y: 20 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, rotateX: 15, y: -20 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="prose prose-invert max-w-none"
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                {displayText.split('\n').map((line, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="mb-2 font-mono text-foreground/90"
                    style={{
                      textShadow: `0 0 10px ${getProviderColor(provider)}40`
                    }}
                  >
                    {line}
                  </motion.p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typing cursor */}
          {isAnimating && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-5 ml-1 bg-matrix-primary"
              style={{ verticalAlign: 'middle' }}
            />
          )}
        </motion.div>

        {/* Scan line effect */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-matrix-primary to-transparent"
          animate={{
            top: isAnimating ? ['0%', '100%'] : '50%'
          }}
          transition={{
            duration: 3,
            repeat: isAnimating ? Infinity : 0,
            ease: 'linear'
          }}
          style={{
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
            opacity: 0.5
          }}
        />

        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-matrix-primary/50" />
        <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-matrix-primary/50" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-matrix-primary/50" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-matrix-primary/50" />
      </div>

      {/* Holographic overlay */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent, ${getProviderColor(provider)}20, transparent)`,
          backgroundSize: '200% 200%'
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}
