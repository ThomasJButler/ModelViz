/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Interactive network graph with physics-based node positioning and mouse interaction
 */

"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  connections: number[];
}

/**
 * @constructor
 */
export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();

  /** @constructs */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes: Node[] = [];
    const nodeCount = 30;
    const colors = ["#00FF00", "#00FFFF", "#FF00FF", "#FFA500", "#FF4500"];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        connections: [],
      });
    }
    nodes.forEach((node, i) => {
      const connectionCount = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < connectionCount; j++) {
        const target = Math.floor(Math.random() * nodeCount);
        if (target !== i && !node.connections.includes(target)) {
          node.connections.push(target);
          nodes[target].connections.push(i);
        }
      }
    });
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove);

    function animate() {
      if (!canvas || !ctx) return;
      ctx.fillStyle = "rgba(13, 13, 13, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((node) => {
        // Repel from mouse
        const dxMouse = node.x - mouseX;
        const dyMouse = node.y - mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 100) {
          const force = (100 - distMouse) / 100;
          const angle = Math.atan2(dyMouse, dxMouse);
          node.vx += Math.cos(angle) * force * 0.3;
          node.vy += Math.sin(angle) * force * 0.3;
        }
        nodes.forEach((other) => {
          if (other === node) return;

          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const force = (150 - distance) / 150;
            const angle = Math.atan2(dy, dx);

            if (node.connections.includes(nodes.indexOf(other))) {
              // Attractive force for connected nodes
              node.vx += Math.cos(angle) * force * 0.1;
              node.vy += Math.sin(angle) * force * 0.1;
            } else {
              // Repulsive force for unconnected nodes
              node.vx -= Math.cos(angle) * force * 0.15;
              node.vy -= Math.sin(angle) * force * 0.15;
            }
          }
        });
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.94;
        node.vy *= 0.94;
        if (node.x < 0) {
          node.x = 0;
          node.vx *= -1;
        }
        if (node.x > canvas.width) {
          node.x = canvas.width;
          node.vx *= -1;
        }
        if (node.y < 0) {
          node.y = 0;
          node.vy *= -1;
        }
        if (node.y > canvas.height) {
          node.y = canvas.height;
          node.vy *= -1;
        }
      });
      nodes.forEach((node) => {
        node.connections.forEach((targetIndex) => {
          const target = nodes[targetIndex];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          const rgb = node.color
            .match(/\w\w/g)
            ?.map((c) => parseInt(c, 16))
            .join(",") || "255,255,255";
          ctx.strokeStyle = `rgba(${rgb},0.25)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      animationIdRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      <h2 className="text-xl font-bold mb-4 text-matrix-tertiary">
        Network Analysis Graph
      </h2>
      <canvas
        ref={canvasRef}
        className="w-full h-[600px] rounded-lg"
        style={{ background: "#0d0d0d" }}
      />
    </motion.div>
  );
}