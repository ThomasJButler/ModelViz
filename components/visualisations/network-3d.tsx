/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description 3D force-directed network graph visualisation with interactive camera controls
 */

"use client";

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ForceGraph3D from 'react-force-graph-3d';
import { generateNetworkData } from '@/lib/data';
import SpriteText from 'three-spritetext';

/**
 * @constructor
 */
export default function Network3D() {
  const fgRef = useRef(undefined);

  const data = generateNetworkData(50, 0.2);

  const handleNodeClick = useCallback((node: { x?: number; y?: number; z?: number }) => {
    if (!node.x || !node.y || !node.z) return;
    // Aim at node from outside
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    if (fgRef.current) {
      const fg = fgRef.current as any;
      fg.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[600px] w-full"
    >
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        nodeLabel="id"
        nodeColor={node => {
          switch(node.group) {
            case 0: return '#00ff00';
            case 1: return '#00ffff';
            default: return '#ff00ff';
          }
        }}
        nodeThreeObject={(node: { id?: string | number }) => {
          const sprite = new SpriteText((node.id ?? 'unknown').toString());
          sprite.color = '#ffffff';
          sprite.textHeight = 2;
          return sprite;
        }}
        linkColor={() => '#00ff00'}
        linkOpacity={0.3}
        linkWidth={1}
        onNodeClick={handleNodeClick}
        backgroundColor="#0d0d0d"
      />
    </motion.div>
  );
}