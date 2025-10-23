/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Mock data generators for visualisations and demo mode. Provides functions
 *              for generating time series, network graphs, neural networks, system metrics,
 *              and privacy-related data for dashboard components.
 */

type NodeItem = {
  id: string;
  group: number;
  value: number;
};

type LinkItem = {
  source: string;
  target: string;
  value: number;
};

type NeuralNode = {
  id: number;
  x: number;
  y: number;
  layer: number;
};

type NeuralEdge = {
  source: number;
  target: number;
  weight: number;
};

/**
 * Generates time series data with three value dimensions
 * @param {number} [points=24] - Number of data points to generate (default: 24 hours)
 * @return {Array<{timestamp: string, value1: number, value2: number, value3: number}>}
 */
export function generateTimeSeriesData(points = 24) {
  const data = [];
  const now = Date.now();
  const hour = 3600000;

  for (let i = 0; i < points; i++) {
    data.push({
      timestamp: new Date(now - (points - 1 - i) * hour).toISOString(),
      value1: Math.floor(Math.random() * 1000) + 500,
      value2: Math.floor(Math.random() * 800) + 300,
      value3: Math.floor(Math.random() * 600) + 200,
    });
  }
  return data;
}

/**
 * Generates randomised system resource metrics
 * @return {{cpu: number, memory: number, network: number, disk: number}}
 */
export function generateSystemMetrics() {
  return {
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    network: Math.random() * 100,
    disk: Math.random() * 100,
  };
}

/**
 * Generates network graph data with nodes and links
 * @param {number} [nodes=20] - Number of nodes to generate
 * @param {number} [density=0.3] - Connection density (0-1 range)
 * @return {{nodes: NodeItem[], links: LinkItem[]}}
 */
export function generateNetworkData(nodes = 20, density = 0.3) {
  const data = {
    nodes: [] as NodeItem[],
    links: [] as LinkItem[]
  };

  // Generate nodes with random groups and values
  for (let i = 0; i < nodes; i++) {
    data.nodes.push({
      id: `node-${i}`,
      group: Math.floor(Math.random() * 3),
      value: Math.random() * 100
    });
  }

  // Generate links based on density parameter
  for (let i = 0; i < nodes; i++) {
    const numConnections = Math.floor(Math.random() * (nodes * density));
    for (let j = 0; j < numConnections; j++) {
      const target = Math.floor(Math.random() * nodes);
      if (target !== i) {
        data.links.push({
          source: `node-${i}`,
          target: `node-${target}`,
          value: Math.random()
        });
      }
    }
  }

  return data;
}

/**
 * Generates mock privacy scanning data showing sensitive data detection
 * @return {Array<{id: string, type: string, value: string, reason?: string}>}
 */
export function generatePrivacyData() {
  const sensitiveTypes = [
    'SSN', 'Credit Card', 'Email', 'Phone', 'Address',
    'Password', 'API Key', 'Token', 'Private Key'
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: `data-${i}`,
    type: Math.random() > 0.7 ? 'sensitive' : Math.random() > 0.5 ? 'warning' : 'clean',
    value: Math.random() > 0.7
      ? '********'
      : `Sample data point ${i}`,
    reason: Math.random() > 0.7
      ? `${sensitiveTypes[Math.floor(Math.random() * sensitiveTypes.length)]} detected`
      : undefined
  }));
}

/**
 * Generates neural network structure with layers and connections
 * @return {{nodes: NeuralNode[], connections: NeuralEdge[]}}
 */
export function generateNeuralNetworkData() {
  const layers = [4, 6, 6, 3];
  const data = {
    nodes: [] as NeuralNode[],
    connections: [] as NeuralEdge[]
  };

  let nodeId = 0;
  layers.forEach((size, layerIndex) => {
    const layerX = (layerIndex + 1) * (1 / (layers.length + 1));

    for (let i = 0; i < size; i++) {
      const layerY = (i + 1) * (1 / (size + 1));
      data.nodes.push({
        id: nodeId,
        x: layerX,
        y: layerY,
        layer: layerIndex
      });

      // Connect to all nodes in previous layer (fully connected network)
      if (layerIndex > 0) {
        const prevLayerSize = layers[layerIndex - 1];
        for (let j = nodeId - prevLayerSize; j < nodeId; j++) {
          if (j >= 0) {
            data.connections.push({
              source: j,
              target: nodeId,
              weight: Math.random()
            });
          }
        }
      }
      nodeId++;
    }
  });

  return data;
}

/**
 * Generates data flow performance metrics
 * @return {{throughput: number, latency: number, errorRate: number, successRate: number}}
 */
export function generateDataFlowMetrics() {
  return {
    throughput: Math.floor(Math.random() * 1000) + 500,
    latency: Math.floor(Math.random() * 100) + 10,
    errorRate: Math.random() * 2,
    successRate: 98 + Math.random() * 2
  };
}
