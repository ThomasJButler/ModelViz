/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description AI thought stream visualisation showing flowing consciousness with branching thoughts, particle trails,
 *              and connecting neural pathways representing real-time AI reasoning processes.
 */

"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type Thought = {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  category: 'nlp' | 'vision' | 'logic' | 'creativity';
  opacity: number;
  size: number;
  connections: number[];
  phase: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

/**
 * @constructor
 */
export default function AIThoughtStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thoughtsRef = useRef<Thought[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);

  const thoughtTexts = {
    nlp: [
      'semantic analysis', 'token prediction', 'context window', 'attention weights',
      'embedding space', 'transformer layers', 'beam search', 'language modeling',
      'syntactic parsing', 'named entities', 'sentiment analysis', 'text generation'
    ],
    vision: [
      'edge detection', 'feature extraction', 'convolution', 'pooling layers',
      'object recognition', 'image segmentation', 'pattern matching', 'visual cortex',
      'depth perception', 'colour space', 'texture analysis', 'facial recognition'
    ],
    logic: [
      'inference engine', 'boolean algebra', 'decision tree', 'logic gates',
      'constraint solving', 'rule evaluation', 'hypothesis testing', 'deduction',
      'probabilistic reasoning', 'causal inference', 'knowledge graph', 'reasoning chain'
    ],
    creativity: [
      'neural synthesis', 'generative models', 'latent exploration', 'style transfer',
      'creative divergence', 'imagination engine', 'novelty detection', 'artistic expression',
      'conceptual blending', 'emergent patterns', 'creative constraints', 'inspiration flow'
    ]
  };

  const categoryColors = {
    nlp: { r: 0, g: 255, b: 255 },      // Cyan
    vision: { r: 255, g: 0, b: 255 },    // Magenta
    logic: { r: 0, g: 255, b: 0 },       // Green
    creativity: { r: 255, g: 165, b: 0 }  // Orange
  };

  /**
   * Initialises thought stream with flowing particles and connections
   * @constructs
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialise thoughts
    const initThoughts = () => {
      const thoughts: Thought[] = [];
      const categories: Array<'nlp' | 'vision' | 'logic' | 'creativity'> = ['nlp', 'vision', 'logic', 'creativity'];

      for (let i = 0; i < 20; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const texts = thoughtTexts[category];

        thoughts.push({
          id: i,
          text: texts[Math.floor(Math.random() * texts.length)],
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          category,
          opacity: Math.random() * 0.5 + 0.5,
          size: Math.random() * 20 + 15,
          connections: [],
          phase: Math.random() * Math.PI * 2
        });
      }

      // Create connections between related thoughts
      thoughts.forEach((thought, i) => {
        const numConnections = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numConnections; j++) {
          const targetId = Math.floor(Math.random() * thoughts.length);
          if (targetId !== i && !thought.connections.includes(targetId)) {
            thought.connections.push(targetId);
          }
        }
      });

      return thoughts;
    };

    thoughtsRef.current = initThoughts();

    // Animation loop
    let animationId: number;
    const animate = () => {
      frameRef.current++;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      gradient.addColorStop(0.5, 'rgba(0, 20, 40, 0.95)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw connections
      thoughtsRef.current.forEach((thought, i) => {
        thought.connections.forEach(targetId => {
          const target = thoughtsRef.current[targetId];
          if (target) {
            // Draw connection line with gradient
            const gradient = ctx.createLinearGradient(thought.x, thought.y, target.x, target.y);
            const color1 = categoryColors[thought.category];
            const color2 = categoryColors[target.category];

            gradient.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, ${thought.opacity * 0.2})`);
            gradient.addColorStop(1, `rgba(${color2.r}, ${color2.g}, ${color2.b}, ${target.opacity * 0.2})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(thought.x, thought.y);

            // Bezier curve for organic feel
            const cp1x = thought.x + (target.x - thought.x) * 0.25;
            const cp1y = thought.y + Math.sin(frameRef.current * 0.01 + thought.phase) * 20;
            const cp2x = thought.x + (target.x - thought.x) * 0.75;
            const cp2y = target.y + Math.sin(frameRef.current * 0.01 + target.phase) * 20;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, target.x, target.y);
            ctx.stroke();

            // Draw pulse along connection
            if (Math.random() > 0.98) {
              const t = (frameRef.current * 0.01) % 1;
              const pulseX = thought.x + (target.x - thought.x) * t;
              const pulseY = thought.y + (target.y - thought.y) * t;

              particlesRef.current.push({
                x: pulseX,
                y: pulseY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                color: `rgb(${color1.r}, ${color1.g}, ${color1.b})`
              });
            }
          }
        });
      });

      // Update and draw thoughts
      thoughtsRef.current.forEach((thought) => {
        // Update position with organic flow
        thought.phase += 0.02;
        thought.x += thought.vx + Math.sin(thought.phase) * 0.3;
        thought.y += thought.vy + Math.cos(thought.phase * 0.7) * 0.2;

        // Bounce off edges with smooth reflection
        if (thought.x < 50 || thought.x > canvas.width - 50) {
          thought.vx *= -0.9;
          thought.x = Math.max(50, Math.min(canvas.width - 50, thought.x));
        }
        if (thought.y < 50 || thought.y > canvas.height - 50) {
          thought.vy *= -0.9;
          thought.y = Math.max(50, Math.min(canvas.height - 50, thought.y));
        }

        // Add slight attraction to center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = centerX - thought.x;
        const dy = centerY - thought.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 200) {
          thought.vx += dx / distance * 0.01;
          thought.vy += dy / distance * 0.01;
        }

        // Update opacity with pulse
        thought.opacity = 0.5 + Math.sin(thought.phase) * 0.3;

        // Draw thought bubble with glow
        const color = categoryColors[thought.category];

        // Outer glow
        const glowGradient = ctx.createRadialGradient(thought.x, thought.y, 0, thought.x, thought.y, thought.size * 2);
        glowGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${thought.opacity * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(thought.x - thought.size * 2, thought.y - thought.size * 2, thought.size * 4, thought.size * 4);

        // Inner bubble
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${thought.opacity * 0.1})`;
        ctx.beginPath();
        ctx.arc(thought.x, thought.y, thought.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${thought.opacity * 0.8})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${thought.opacity})`;
        ctx.font = `${Math.min(12, thought.size * 0.6)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(thought.text, thought.x, thought.y);

        // Spawn trailing particles
        if (Math.random() > 0.95) {
          particlesRef.current.push({
            x: thought.x,
            y: thought.y,
            vx: -thought.vx * 2 + (Math.random() - 0.5),
            vy: -thought.vy * 2 + (Math.random() - 0.5),
            life: 1,
            color: `rgb(${color.r}, ${color.g}, ${color.b})`
          });
        }
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        if (particle.life > 0) {
          ctx.fillStyle = particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.life * 0.5})`);
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.life * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        return particle.life > 0;
      });

      // Limit particles for performance
      if (particlesRef.current.length > 200) {
        particlesRef.current = particlesRef.current.slice(-200);
      }

      // Occasionally spawn new thoughts
      if (Math.random() > 0.995 && thoughtsRef.current.length < 25) {
        const categories: Array<'nlp' | 'vision' | 'logic' | 'creativity'> = ['nlp', 'vision', 'logic', 'creativity'];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const texts = thoughtTexts[category];

        const newThought: Thought = {
          id: thoughtsRef.current.length,
          text: texts[Math.floor(Math.random() * texts.length)],
          x: Math.random() > 0.5 ? -50 : canvas.width + 50,
          y: Math.random() * canvas.height,
          vx: Math.random() > 0.5 ? 1 : -1,
          vy: (Math.random() - 0.5) * 0.5,
          category,
          opacity: 0,
          size: Math.random() * 20 + 15,
          connections: [],
          phase: 0
        };

        // Connect to random existing thoughts
        const numConnections = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numConnections; i++) {
          const targetId = Math.floor(Math.random() * thoughtsRef.current.length);
          newThought.connections.push(targetId);
        }

        thoughtsRef.current.push(newThought);
      }

      // Remove old thoughts that have faded
      thoughtsRef.current = thoughtsRef.current.filter(thought => thought.opacity > 0.01);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full rounded-lg overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Category legend */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-matrix-primary/20">
        <div className="text-xs text-foreground/70 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span>Natural Language</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-magenta-500" />
            <span>Computer Vision</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Logic & Reasoning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Creative Synthesis</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}