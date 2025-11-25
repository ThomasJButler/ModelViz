/**
 * @author Tom Butler
 * @date 2025-11-24
 * @description 3D network graph visualization for API connections
 */

"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { MetricsService } from '@/lib/services/MetricsService';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface Node {
  id: string;
  name: string;
  val: number;
  color: string;
  type: 'provider' | 'model';
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export function NetworkGraph3D() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        const service = MetricsService.getInstance();
        const aggregated = await service.getAggregatedMetrics('week');

        const nodes: Node[] = [];
        const links: Link[] = [];

        // Add provider nodes
        Object.entries(aggregated.byProvider).forEach(([provider, stats]) => {
          nodes.push({
            id: provider,
            name: provider,
            val: stats.totalCalls,
            color: getProviderColor(provider),
            type: 'provider'
          });
        });

        // Add model nodes and links
        Object.entries(aggregated.byModel).forEach(([modelKey, stats]) => {
          const [provider, model] = modelKey.split(':');
          const modelId = `${provider}:${model}`;

          nodes.push({
            id: modelId,
            name: model,
            val: stats.totalCalls / 2,
            color: '#00ffff',
            type: 'model'
          });

          links.push({
            source: provider,
            target: modelId,
            value: stats.totalCalls
          });
        });

        setGraphData({ nodes, links });
        setLoading(false);
      } catch (error) {
        console.error('Failed to load graph data:', error);
        setLoading(false);
      }
    };

    loadGraphData();

    const handleUpdate = () => loadGraphData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      'OpenAI': '#00ff00',
      'Anthropic': '#ff00ff',
      'DeepSeek': '#00ffff',
      'Google': '#ffff00'
    };
    return colors[provider] || '#ffffff';
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-matrix-primary animate-pulse">
          Loading 3D Network Graph...
        </div>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-foreground/60">
          No API data available yet. Start making API calls to see the network visualization.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/50 border border-matrix-primary/20">
      <ForceGraph3D
        graphData={graphData}
        nodeLabel="name"
        nodeVal="val"
        nodeColor="color"
        nodeOpacity={0.9}
        linkColor={() => 'rgba(0, 255, 0, 0.3)'}
        linkWidth={link => Math.sqrt((link as any).value) / 2}
        linkOpacity={0.6}
        backgroundColor="rgba(0, 0, 0, 0)"
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        nodeThreeObject={(node: any) => {
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: new THREE.CanvasTexture(
                generateNodeCanvas(node.name, node.color)
              ),
              transparent: true
            })
          );
          sprite.scale.set(12, 6, 1);
          return sprite;
        }}
      />
    </div>
  );
}

function generateNodeCanvas(label: string, color: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  canvas.width = 256;
  canvas.height = 128;

  // Draw background
  ctx.fillStyle = color;
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw label
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);

  return canvas;
}
