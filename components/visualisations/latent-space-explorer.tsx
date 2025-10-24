/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description 3D latent space explorer visualisation showing AI embedding clusters with smooth camera movement,
 *              concept relationships, and interactive depth navigation through semantic space.
 */

"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type Concept = {
  id: number;
  text: string;
  x: number;
  y: number;
  z: number;
  cluster: 'language' | 'vision' | 'logic' | 'creativity' | 'memory';
  size: number;
  connections: number[];
  opacity: number;
  pulsePhase: number;
};

type Star = {
  x: number;
  y: number;
  z: number;
  brightness: number;
};

type Camera = {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  rotation: number;
};

/**
 * @constructor
 */
export default function LatentSpaceExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const conceptsRef = useRef<Concept[]>([]);
  const starsRef = useRef<Star[]>([]);
  const cameraRef = useRef<Camera>({ x: 0, y: 0, z: -500, targetX: 0, targetY: 0, targetZ: -500, rotation: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  const conceptTexts = {
    language: [
      'syntax tree', 'word embedding', 'semantic meaning', 'grammar rules',
      'phonetics', 'morphology', 'pragmatics', 'lexicon',
      'discourse', 'prosody', 'etymology', 'linguistics'
    ],
    vision: [
      'pixel array', 'edge gradient', 'feature map', 'object boundary',
      'texture pattern', 'colour histogram', 'shape descriptor', 'spatial frequency',
      'depth map', 'optical flow', 'saliency map', 'visual attention'
    ],
    logic: [
      'truth table', 'inference rule', 'predicate logic', 'axiom system',
      'proof tree', 'set theory', 'formal system', 'modal logic',
      'fuzzy logic', 'temporal logic', 'boolean circuit', 'theorem prover'
    ],
    creativity: [
      'imagination space', 'novel combination', 'artistic style', 'creative constraint',
      'emergent pattern', 'aesthetic value', 'conceptual blend', 'divergent thinking',
      'creative flow', 'innovation metric', 'originality score', 'artistic expression'
    ],
    memory: [
      'episodic memory', 'semantic store', 'working memory', 'long-term storage',
      'memory consolidation', 'recall mechanism', 'associative network', 'memory trace',
      'encoding process', 'retrieval cue', 'memory palace', 'forgetting curve'
    ]
  };

  const clusterColors = {
    language: { r: 0, g: 150, b: 255 },      // Blue
    vision: { r: 180, g: 0, b: 255 },        // Purple
    logic: { r: 0, g: 255, b: 100 },         // Green
    creativity: { r: 255, g: 150, b: 0 },    // Orange
    memory: { r: 255, g: 0, b: 150 }         // Pink
  };

  /**
   * Projects 3D coordinates to 2D canvas space
   * @param {number} x - 3D x coordinate
   * @param {number} y - 3D y coordinate
   * @param {number} z - 3D z coordinate
   * @param {Camera} camera - Camera position
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @return {{x: number, y: number, scale: number}}
   */
  const project3D = (x: number, y: number, z: number, camera: Camera, canvasWidth: number, canvasHeight: number) => {
    // Apply camera transformation
    const dx = x - camera.x;
    const dy = y - camera.y;
    const dz = z - camera.z;

    // Apply rotation around Y axis
    const cos = Math.cos(camera.rotation);
    const sin = Math.sin(camera.rotation);
    const rotX = dx * cos - dz * sin;
    const rotZ = dx * sin + dz * cos;

    // Perspective projection
    const perspective = 800 / (800 + rotZ);
    const projX = rotX * perspective + canvasWidth / 2;
    const projY = dy * perspective + canvasHeight / 2;

    return {
      x: projX,
      y: projY,
      scale: perspective
    };
  };

  /**
   * Initialises 3D latent space with concepts and starfield
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

    // Initialise concepts in 3D clusters
    const initConcepts = () => {
      const concepts: Concept[] = [];
      const clusters: Array<'language' | 'vision' | 'logic' | 'creativity' | 'memory'> =
        ['language', 'vision', 'logic', 'creativity', 'memory'];

      clusters.forEach((cluster, clusterIndex) => {
        const texts = conceptTexts[cluster];
        // Position clusters in 3D space
        const clusterAngle = (clusterIndex / clusters.length) * Math.PI * 2;
        const clusterRadius = 300;
        const clusterX = Math.cos(clusterAngle) * clusterRadius;
        const clusterY = Math.sin(clusterAngle) * clusterRadius * 0.5;
        const clusterZ = Math.sin(clusterIndex * 1.3) * 200;

        // Add concepts to cluster
        texts.forEach((text, i) => {
          const angle = (i / texts.length) * Math.PI * 2;
          const radius = 50 + Math.random() * 100;

          concepts.push({
            id: concepts.length,
            text,
            x: clusterX + Math.cos(angle) * radius,
            y: clusterY + (Math.random() - 0.5) * 100,
            z: clusterZ + Math.sin(angle) * radius,
            cluster,
            size: 8 + Math.random() * 8,
            connections: [],
            opacity: 0.8 + Math.random() * 0.2,
            pulsePhase: Math.random() * Math.PI * 2
          });
        });
      });

      // Create connections between related concepts
      concepts.forEach((concept, i) => {
        const numConnections = 2 + Math.floor(Math.random() * 2);
        for (let j = 0; j < numConnections; j++) {
          // Prefer connections within same cluster
          const sameClusterConcepts = concepts.filter((c, idx) =>
            c.cluster === concept.cluster && idx !== i
          );

          if (sameClusterConcepts.length > 0 && Math.random() > 0.3) {
            const target = sameClusterConcepts[Math.floor(Math.random() * sameClusterConcepts.length)];
            concept.connections.push(concepts.indexOf(target));
          } else {
            // Occasional cross-cluster connection
            const targetId = Math.floor(Math.random() * concepts.length);
            if (targetId !== i) {
              concept.connections.push(targetId);
            }
          }
        }
      });

      return concepts;
    };

    // Initialise starfield background
    const initStars = () => {
      const stars: Star[] = [];
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: (Math.random() - 0.5) * 2000,
          brightness: Math.random()
        });
      }
      return stars;
    };

    conceptsRef.current = initConcepts();
    starsRef.current = initStars();

    // Mouse move handler for parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5
      };

      // Update camera target based on mouse
      cameraRef.current.targetX = -mouseRef.current.x * 100;
      cameraRef.current.targetY = -mouseRef.current.y * 50;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(0, 10, 30, 0.8)');
      gradient.addColorStop(0.5, 'rgba(0, 5, 20, 0.9)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update camera with smooth interpolation
      const camera = cameraRef.current;
      camera.x += (camera.targetX - camera.x) * 0.05;
      camera.y += (camera.targetY - camera.y) * 0.05;
      camera.z = -500 + Math.sin(time * 0.5) * 50; // Gentle z-axis movement
      camera.rotation = time * 0.2; // Slow rotation

      // Draw starfield with parallax
      starsRef.current.forEach(star => {
        const proj = project3D(star.x, star.y, star.z, camera, canvas.width, canvas.height);

        if (proj.scale > 0 && proj.x > 0 && proj.x < canvas.width && proj.y > 0 && proj.y < canvas.height) {
          const size = proj.scale * 1.5 * star.brightness;
          const opacity = proj.scale * star.brightness;

          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Sort concepts by Z-depth for proper rendering order
      const sortedConcepts = [...conceptsRef.current].sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow(a.x - camera.x, 2) +
          Math.pow(a.y - camera.y, 2) +
          Math.pow(a.z - camera.z, 2)
        );
        const distB = Math.sqrt(
          Math.pow(b.x - camera.x, 2) +
          Math.pow(b.y - camera.y, 2) +
          Math.pow(b.z - camera.z, 2)
        );
        return distB - distA; // Further objects first
      });

      // Draw connections
      conceptsRef.current.forEach(concept => {
        concept.connections.forEach(targetId => {
          const target = conceptsRef.current[targetId];
          if (target) {
            const proj1 = project3D(concept.x, concept.y, concept.z, camera, canvas.width, canvas.height);
            const proj2 = project3D(target.x, target.y, target.z, camera, canvas.width, canvas.height);

            if (proj1.scale > 0 && proj2.scale > 0) {
              const opacity = Math.min(proj1.scale, proj2.scale) * 0.3;
              const color = clusterColors[concept.cluster];

              ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
              ctx.lineWidth = Math.max(0.5, Math.min(proj1.scale, proj2.scale) * 2);
              ctx.beginPath();
              ctx.moveTo(proj1.x, proj1.y);
              ctx.lineTo(proj2.x, proj2.y);
              ctx.stroke();
            }
          }
        });
      });

      // Draw concepts
      let hoveredText = null;
      sortedConcepts.forEach(concept => {
        // Update concept animation
        concept.pulsePhase += 0.05;
        const pulse = Math.sin(concept.pulsePhase) * 0.2 + 1;

        const proj = project3D(concept.x, concept.y, concept.z, camera, canvas.width, canvas.height);

        if (proj.scale > 0 && proj.x > -50 && proj.x < canvas.width + 50 &&
            proj.y > -50 && proj.y < canvas.height + 50) {

          const color = clusterColors[concept.cluster];
          const size = concept.size * proj.scale * pulse;
          const opacity = concept.opacity * proj.scale;

          // Glow effect
          const glowGradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, size * 3);
          glowGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`);
          glowGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.2})`);
          glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Core orb
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
          ctx.fill();

          // Draw text for nearby concepts
          if (proj.scale > 0.5) {
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.9})`;
            ctx.font = `${Math.max(8, proj.scale * 12)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(concept.text, proj.x, proj.y + size + 5);

            // Check for hover
            const dx = Math.abs(proj.x - (mouseRef.current.x + 0.5) * canvas.width);
            const dy = Math.abs(proj.y - (mouseRef.current.y + 0.5) * canvas.height);
            if (dx < size && dy < size) {
              hoveredText = concept.text;
            }
          }
        }
      });

      setHoveredConcept(hoveredText);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
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
        className="w-full h-full cursor-move"
        style={{ minHeight: '400px' }}
      />

      {/* Cluster legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-matrix-primary/20">
        <div className="text-xs text-foreground/70 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span>Language</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span>Vision</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span>Logic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span>Creativity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-400" />
            <span>Memory</span>
          </div>
        </div>
      </div>

      {/* Hover info */}
      {hoveredConcept && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-matrix-primary/30">
          <div className="text-sm text-matrix-primary font-mono">{hoveredConcept}</div>
        </div>
      )}

      {/* Navigation hint */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-matrix-primary/20">
        <div className="text-xs text-foreground/50">Move mouse to navigate 3D space</div>
      </div>
    </motion.div>
  );
}