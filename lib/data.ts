/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Mock data generators for AI comparison visualisations and demo mode. Provides functions
 *              for generating model response times, API provider networks, neural networks, AI performance metrics,
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
 * Generates AI model response time series data for GPT-4, Claude, DeepSeek, and Perplexity
 * @param {number} [points=24] - Number of data points to generate (default: 24 hours)
 * @return {Array<{timestamp: string, gpt4: number, claude: number, deepseek: number, perplexity: number}>}
 */
export function generateTimeSeriesData(points = 24) {
  const data = [];
  const now = Date.now();
  const hour = 3600000;

  for (let i = 0; i < points; i++) {
    data.push({
      timestamp: new Date(now - (points - 1 - i) * hour).toISOString(),
      gpt4: Math.floor(Math.random() * 800) + 600,      // GPT-4: 600-1400ms
      claude: Math.floor(Math.random() * 700) + 500,    // Claude: 500-1200ms
      deepseek: Math.floor(Math.random() * 600) + 400,  // DeepSeek: 400-1000ms
      perplexity: Math.floor(Math.random() * 900) + 700, // Perplexity: 700-1600ms
    });
  }
  return data;
}

/**
 * Generates randomised AI performance metrics for real-time monitoring
 * @return {{tokenUsageRate: number, requestsPerMin: number, costPerHour: number, successRate: number}}
 */
export function generateSystemMetrics() {
  return {
    tokenUsageRate: Math.floor(Math.random() * 5000) + 3000,  // 3000-8000 tokens/min
    requestsPerMin: Math.floor(Math.random() * 150) + 50,     // 50-200 requests/min
    costPerHour: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),  // £0.50-£2.50/hour
    successRate: parseFloat((98 + Math.random() * 1.8).toFixed(1)), // 98.0-99.8% success
  };
}

/**
 * Generates AI provider network graph with API endpoints and connections
 * @param {number} [endpoints=20] - Number of API endpoints to generate
 * @param {number} [density=0.3] - Connection density (0-1 range)
 * @return {{nodes: NodeItem[], links: LinkItem[]}}
 */
export function generateNetworkData(endpoints = 20, density = 0.3) {
  const data = {
    nodes: [] as NodeItem[],
    links: [] as LinkItem[]
  };

  const providers = ['OpenAI', 'Anthropic', 'DeepSeek', 'Perplexity'];

  // Core provider nodes (group 0)
  providers.forEach((provider, i) => {
    data.nodes.push({
      id: provider,
      group: 0,
      value: Math.floor(Math.random() * 50) + 50 // Higher value for core nodes
    });
  });

  // Generate endpoint nodes connected to providers
  for (let i = 0; i < endpoints; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const endpointId = `${provider}-endpoint-${i}`;

    data.nodes.push({
      id: endpointId,
      group: providers.indexOf(provider) + 1, // Groups 1-4 for different providers
      value: Math.floor(Math.random() * 30) + 10
    });

    // Connect endpoint to its provider
    data.links.push({
      source: provider,
      target: endpointId,
      value: Math.random() * 0.8 + 0.2 // Strong connection to provider
    });

    // Generate cross-endpoint connections based on density
    if (Math.random() < density && i > 0) {
      const targetEndpoint = Math.floor(Math.random() * i);
      const targetProvider = providers[Math.floor(Math.random() * providers.length)];
      data.links.push({
        source: endpointId,
        target: `${targetProvider}-endpoint-${targetEndpoint}`,
        value: Math.random() * 0.5
      });
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
