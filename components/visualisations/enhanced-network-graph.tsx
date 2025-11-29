/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Enhanced network graph visualisation showing API connections with interactive nodes and real-time data flow
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { NetworkNode, NetworkConnection, createApiNetworkData } from "@/lib/api/transformers/networkGraphData";

interface NodeWithPosition extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  displayColor: string;
}

interface ConnectionWithNodes extends NetworkConnection {
  sourceNode: NodeWithPosition;
  targetNode: NodeWithPosition;
  displayColor: string;
  width: number;
}

interface NodeTypeConfig {
  color: string;
  baseSize: number;
}

/**
 * @constructor
 */
export default function EnhancedNetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeWithPosition | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeWithPosition | null>(null);
  const animationIdRef = useRef<number>();
  const nodeTypeConfig: Record<string, NodeTypeConfig> = {
    api: { color: "#00FF00", baseSize: 8 },
    model: { color: "#00FFFF", baseSize: 7 },
    service: { color: "#FF00FF", baseSize: 10 },
    user: { color: "#FFA500", baseSize: 6 },
    data: { color: "#FF4500", baseSize: 8 }
  };
  
  // Define status colors
  const statusColors: Record<string, string> = {
    active: "#00FF00",
    inactive: "#888888",
    warning: "#FFA500",
    error: "#FF0000"
  };

  /** @constructs */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Get network data from API
    const networkData = createApiNetworkData({
      includeOpenAI: true,
      includeWeather: true,
      includeNews: true,
      includeUser: true
    });
    
    // Process nodes with position information
    const nodes: NodeWithPosition[] = networkData.nodes.map(node => {
      const typeConfig = nodeTypeConfig[node.type] || { color: "#FFFFFF", baseSize: 5 };
      const statusColor = statusColors[node.status] || "#FFFFFF";
      
      return {
        ...node,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        radius: typeConfig.baseSize * (node.size / 50),
        displayColor: node.status === 'active' ? typeConfig.color : statusColor
      };
    });
    
    // Build lookup for quick node access by ID
    const nodeMap = new Map<string, NodeWithPosition>();
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });
    
    // Process connections with references to actual nodes
    const connections: ConnectionWithNodes[] = networkData.connections
      .map(conn => {
        const sourceNode = nodeMap.get(conn.source);
        const targetNode = nodeMap.get(conn.target);
        
        if (!sourceNode || !targetNode) return null;
        
        const statusColor = statusColors[conn.status] || "rgba(255,255,255,0.3)";
        const baseColor = sourceNode.displayColor;
        const rgb = baseColor.match(/\w\w/g)?.map(c => parseInt(c, 16)).join(",") || "255,255,255";
        
        return {
          ...conn,
          sourceNode,
          targetNode,
          displayColor: conn.status === 'active' ? `rgba(${rgb},${conn.strength * 0.5})` : statusColor,
          width: Math.max(1, conn.dataFlow / 25)
        };
      })
      .filter((conn): conn is ConnectionWithNodes => conn !== null);

    // Mouse interaction
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let isDragging = false;
    let draggedNode: NodeWithPosition | null = null;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      
      // Handle hover detection
      let hovered: NodeWithPosition | null = null;
      for (const node of nodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < node.radius + 2) {
          hovered = node;
          break;
        }
      }
      setHoveredNode(hovered);
      
      // Handle dragging
      if (isDragging && draggedNode) {
        draggedNode.x = mouseX;
        draggedNode.y = mouseY;
        draggedNode.vx = 0;
        draggedNode.vy = 0;
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      // Check if mouse is over a node
      for (const node of nodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < node.radius + 2) {
          isDragging = true;
          draggedNode = node;
          setSelectedNode(node);
          break;
        }
      }
    };
    
    const handleMouseUp = () => {
      isDragging = false;
      draggedNode = null;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    function animate() {
      if (!canvas || !ctx) return;
      ctx.fillStyle = "rgba(13, 13, 13, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update node positions (skip for dragged node)
      nodes.forEach((node) => {
        if (isDragging && node === draggedNode) return;
        
        // Repel from mouse if not hovering or dragging
        if (!isDragging && (!hoveredNode || hoveredNode !== node)) {
          const dxMouse = node.x - mouseX;
          const dyMouse = node.y - mouseY;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < 100) {
            const force = (100 - distMouse) / 100;
            const angle = Math.atan2(dyMouse, dxMouse);
            node.vx += Math.cos(angle) * force * 0.3;
            node.vy += Math.sin(angle) * force * 0.3;
          }
        }

        // Apply forces among nodes
        nodes.forEach((other) => {
          if (other === node) return;

          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Base repulsion for all nodes
          if (distance < 150) {
            const force = (150 - distance) / 150;
            const angle = Math.atan2(dy, dx);
            
            // Check if nodes are connected
            const isConnected = connections.some(
              conn => 
                (conn.sourceNode === node && conn.targetNode === other) || 
                (conn.sourceNode === other && conn.targetNode === node)
            );
            
            if (isConnected) {
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

        // Apply velocity
        node.x += node.vx;
        node.y += node.vy;

        // Damping
        node.vx *= 0.94;
        node.vy *= 0.94;

        // Boundary checking
        if (node.x < node.radius) {
          node.x = node.radius;
          node.vx *= -1;
        }
        if (node.x > canvas.width - node.radius) {
          node.x = canvas.width - node.radius;
          node.vx *= -1;
        }
        if (node.y < node.radius) {
          node.y = node.radius;
          node.vy *= -1;
        }
        if (node.y > canvas.height - node.radius) {
          node.y = canvas.height - node.radius;
          node.vy *= -1;
        }
      });

      // Draw connections
      connections.forEach((conn) => {
        const { sourceNode, targetNode, displayColor, width, dataFlow } = conn;
        
        // Calculate connection midpoint
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        
        // Draw main connection line
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = displayColor;
        ctx.lineWidth = width;
        ctx.stroke();
        
        // Draw data flow indicators if active
        if (conn.status === 'active' && dataFlow > 0) {
          // Calculate angle
          const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
          
          // Draw small circle on the line to indicate data flow
          const flowPosition = Math.sin(Date.now() / 500) * 0.5 + 0.5; // Oscillate between 0 and 1
          const posX = sourceNode.x + (targetNode.x - sourceNode.x) * flowPosition;
          const posY = sourceNode.y + (targetNode.y - sourceNode.y) * flowPosition;
          
          ctx.beginPath();
          ctx.arc(posX, posY, width + 1, 0, Math.PI * 2);
          ctx.fillStyle = displayColor.replace('rgba', 'rgb').replace(/,[^,]*\)/, ')');
          ctx.fill();
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        // Determine if node is highlighted
        const isHighlighted = node === selectedNode || node === hoveredNode;
        const isSelected = node === selectedNode;
        
        // Draw glow for highlighted nodes
        if (isHighlighted) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${isSelected ? 0.2 : 0.1})`;
          ctx.fill();
        }
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.displayColor;
        ctx.fill();
        
        // Draw node border
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isHighlighted ? '#FFFFFF' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
        
        // Draw node label if highlighted
        if (isHighlighted) {
          ctx.font = 'bold 12px Arial';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(node.name, node.x, node.y - node.radius - 8);
        }
      });

      animationIdRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-matrix-tertiary">
            API Network Analysis
          </h2>
          <p className="text-sm text-foreground/70">
            Interactive visualisation of AI service connections
          </p>
        </div>
        
        {/* Node details panel */}
        {selectedNode && (
          <div className="text-sm bg-background/50 p-3 rounded-md border border-border">
            <h3 className="font-bold text-matrix-primary mb-1">{selectedNode.name}</h3>
            <p className="text-xs text-foreground/70 mb-2">Type: {selectedNode.type}</p>
            {selectedNode.details && (
              <div className="space-y-1">
                {Object.entries(selectedNode.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="text-foreground/50">{key}:</span>
                    <span className="text-foreground/80">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[600px] rounded-lg"
          style={{ background: "#0d0d0d" }}
        />
        <div className="absolute bottom-4 left-4 text-xs text-foreground/50 bg-background/30 backdrop-blur-sm p-2 rounded">
          <div className="mb-1">Node Types:</div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(nodeTypeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }}></div>
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
