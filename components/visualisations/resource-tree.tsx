/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Hierarchical resource tree visualisation using D3 treemap with real-time usage indicators
 */

"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface TreeNode {
  name: string;
  value: number;
  children?: TreeNode[];
  usage?: number;
  capacity?: number;
  status?: 'healthy' | 'warning' | 'critical';
}

const generateTreeData = (): TreeNode => ({
  name: "AI Resources",
  value: 100,
  children: [
    {
      name: "Compute",
      value: 40,
      children: [
        { 
          name: "GPU Cluster A",
          value: 15,
          usage: 85,
          capacity: 100,
          status: 'warning'
        },
        { 
          name: "GPU Cluster B",
          value: 12,
          usage: 65,
          capacity: 100,
          status: 'healthy'
        },
        { 
          name: "CPU Pool",
          value: 8,
          usage: 92,
          capacity: 100,
          status: 'critical'
        },
        { 
          name: "Memory Pool",
          value: 5,
          usage: 45,
          capacity: 100,
          status: 'healthy'
        }
      ]
    },
    {
      name: "Storage",
      value: 30,
      children: [
        { 
          name: "Model Cache",
          value: 12,
          usage: 78,
          capacity: 100,
          status: 'warning'
        },
        { 
          name: "Training Data",
          value: 10,
          usage: 55,
          capacity: 100,
          status: 'healthy'
        },
        { 
          name: "Results",
          value: 8,
          usage: 32,
          capacity: 100,
          status: 'healthy'
        }
      ]
    },
    {
      name: "Network",
      value: 30,
      children: [
        { 
          name: "Inference API",
          value: 15,
          usage: 88,
          capacity: 100,
          status: 'critical'
        },
        { 
          name: "Training Pipeline",
          value: 10,
          usage: 72,
          capacity: 100,
          status: 'warning'
        },
        { 
          name: "Monitoring",
          value: 5,
          usage: 25,
          capacity: 100,
          status: 'healthy'
        }
      ]
    }
  ]
});

const getStatusColor = (status: string, opacity: number = 1) => {
  switch (status) {
    case 'healthy':
      return `rgba(0, 255, 0, ${opacity})`;
    case 'warning':
      return `rgba(255, 255, 0, ${opacity})`;
    case 'critical':
      return `rgba(255, 0, 0, ${opacity})`;
    default:
      return `rgba(0, 255, 0, ${opacity})`;
  }
};

/**
 * @constructor
 */
export default function ResourceTree() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    node: TreeNode;
  } | null>(null);

  /** @constructs */
  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const defs = svg.append("defs");
    ['healthy', 'warning', 'critical'].forEach(status => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${status}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", getStatusColor(status, 0.8));

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", getStatusColor(status, 0.3));
    });
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");

    const data = generateTreeData();

    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemap = d3.treemap<TreeNode>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .padding(4)
      .round(true);

    treemap(root);

    const cell = g.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${(d as d3.HierarchyRectangularNode<TreeNode>).x0},${(d as d3.HierarchyRectangularNode<TreeNode>).y0})`);
    cell.append("rect")
      .attr("width", d => (d as d3.HierarchyRectangularNode<TreeNode>).x1 - (d as d3.HierarchyRectangularNode<TreeNode>).x0)
      .attr("height", d => (d as d3.HierarchyRectangularNode<TreeNode>).y1 - (d as d3.HierarchyRectangularNode<TreeNode>).y0)
      .attr("fill", d => `url(#gradient-${d.data.status || 'healthy'})`)
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .attr("rx", 4)
      .attr("ry", 4)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 50)
      .attr("opacity", 1);
    cell.append("rect")
      .attr("x", 4)
      .attr("y", d => ((d as d3.HierarchyRectangularNode<TreeNode>).y1 - (d as d3.HierarchyRectangularNode<TreeNode>).y0) - 8)
      .attr("width", d => ((d as d3.HierarchyRectangularNode<TreeNode>).x1 - (d as d3.HierarchyRectangularNode<TreeNode>).x0) - 8)
      .attr("height", 4)
      .attr("fill", "#1a1a1a")
      .attr("rx", 2)
      .attr("ry", 2);

    cell.append("rect")
      .attr("x", 4)
      .attr("y", d => ((d as d3.HierarchyRectangularNode<TreeNode>).y1 - (d as d3.HierarchyRectangularNode<TreeNode>).y0) - 8)
      .attr("width", d => (((d as d3.HierarchyRectangularNode<TreeNode>).x1 - (d as d3.HierarchyRectangularNode<TreeNode>).x0) - 8) * (d.data.usage || 0) / 100)
      .attr("height", 4)
      .attr("fill", d => getStatusColor(d.data.status || 'healthy'))
      .attr("rx", 2)
      .attr("ry", 2)
      .style("filter", "url(#glow)");
    const addText = (selection: d3.Selection<any, any, any, any>) => {
      selection
        .append("text")
        .attr("x", 4)
        .attr("y", 14)
        .attr("fill", "#fff")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(d => d.data.name);

      selection
        .append("text")
        .attr("x", 4)
        .attr("y", 26)
        .attr("fill", "rgba(255, 255, 255, 0.7)")
        .attr("font-size", "9px")
        .text(d => `${d.data.usage}% used`);
    };

    addText(cell);
    cell
      .on("mouseover", function(event, d) {
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        setTooltipData({
          x: event.pageX,
          y: event.pageY,
          node: d.data
        });
      })
      .on("mouseout", function() {
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .attr("stroke", "#000")
          .attr("stroke-width", 1);

        setTooltipData(null);
      })
      .on("click", (_, d) => {
        setSelectedNode(d.data);
      });
    const interval = setInterval(() => {
      cell.each(function(d) {
        const usage = d.data.usage || 0;
        const newUsage = Math.max(0, Math.min(100, usage + (Math.random() - 0.5) * 10));
        d.data.usage = newUsage;
        if (newUsage > 90) d.data.status = 'critical';
        else if (newUsage > 70) d.data.status = 'warning';
        else d.data.status = 'healthy';
        d3.select(this)
          .select("rect:nth-child(3)")
          .transition()
          .duration(1000)
          .attr("width", (((d as d3.HierarchyRectangularNode<TreeNode>).x1 - (d as d3.HierarchyRectangularNode<TreeNode>).x0) - 8) * newUsage / 100)
          .attr("fill", getStatusColor(d.data.status));
        d3.select(this)
          .select("text:nth-child(5)")
          .text(`${Math.round(newUsage)}% used`);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-[400px] w-full"
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: '#0d0d0d' }}
      />
      
      {tooltipData && (
        <div
          className="absolute pointer-events-none bg-background/90 backdrop-blur-sm border border-matrix-primary/20 p-3 rounded-lg shadow-lg"
          style={{
            left: tooltipData.x + 10,
            top: tooltipData.y - 100,
            transform: 'translateX(-50%)',
          }}
        >
          <h3 className="text-sm font-bold text-matrix-primary mb-1">
            {tooltipData.node.name}
          </h3>
          <div className="space-y-1 text-xs">
            <p className="text-foreground/70">
              Usage: {tooltipData.node.usage}%
            </p>
            <p className="text-foreground/70">
              Status: {tooltipData.node.status}
            </p>
            <p className="text-foreground/70">
              Capacity: {tooltipData.node.capacity} units
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}