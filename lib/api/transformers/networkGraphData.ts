/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Network graph data transformer that converts API relationships into visualisable node-edge structures
 */
export interface NetworkNode {
  id: string;
  name: string;
  type: 'api' | 'model' | 'service' | 'user' | 'data';
  status: 'active' | 'inactive' | 'warning' | 'error';
  size: number;
  details?: Record<string, any>;
}

export interface NetworkConnection {
  source: string;
  target: string;
  strength: number;
  dataFlow: number;
  status: 'active' | 'inactive' | 'warning' | 'error';
  details?: Record<string, any>;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  timestamp: number;
}

/**
 * Creates network graph data representing API connections and data flow
 * @param options - Configuration for which APIs and nodes to include
 * @return Network graph with nodes and connections
 */
export function createApiNetworkData(options: {
  includeOpenAI?: boolean;
  includeWeather?: boolean;
  includeNews?: boolean;
  includeUser?: boolean;
}): NetworkGraphData {
  const nodes: NetworkNode[] = [];
  const connections: NetworkConnection[] = [];
  const timestamp = Date.now();
  
  // Always include the central AI Comparison node
  nodes.push({
    id: 'ai-comparison',
    name: 'AI Comparison',
    type: 'service',
    status: 'active',
    size: 100,
    details: {
      description: 'Central AI automation system',
      uptime: '99.9%'
    }
  });
  
  // Include user if specified
  if (options.includeUser) {
    nodes.push({
      id: 'user',
      name: 'User',
      type: 'user',
      status: 'active',
      size: 60,
      details: {
        lastActive: new Date().toISOString(),
        sessionDuration: '1h 23m'
      }
    });
    
    connections.push({
      source: 'user',
      target: 'ai-comparison',
      strength: 1,
      dataFlow: 75,
      status: 'active',
      details: {
        requests: 42,
        latency: '120ms'
      }
    });
  }
  
  // Include OpenAI if specified
  if (options.includeOpenAI) {
    nodes.push({
      id: 'openai',
      name: 'OpenAI',
      type: 'api',
      status: 'active',
      size: 80,
      details: {
        endpoint: 'api.openai.com',
        models: ['gpt-4', 'gpt-3.5-turbo']
      }
    });
    
    // Add common models
    const models = [
      { id: 'gpt4', name: 'GPT-4', size: 70 },
      { id: 'gpt35', name: 'GPT-3.5', size: 50 }
    ];
    
    models.forEach(model => {
      nodes.push({
        id: model.id,
        name: model.name,
        type: 'model',
        status: 'active',
        size: model.size,
        details: {
          provider: 'OpenAI',
          contextLength: model.id === 'gpt4' ? '128K' : '16K'
        }
      });
      
      connections.push({
        source: 'openai',
        target: model.id,
        strength: 0.8,
        dataFlow: model.id === 'gpt4' ? 60 : 85,
        status: 'active',
        details: {
          requests: model.id === 'gpt4' ? 12 : 30,
          latency: model.id === 'gpt4' ? '250ms' : '150ms'
        }
      });
    });
    
    connections.push({
      source: 'ai-comparison',
      target: 'openai',
      strength: 0.9,
      dataFlow: 80,
      status: 'active',
      details: {
        requests: 42,
        latency: '180ms'
      }
    });
  }
  
  // Include Weather API if specified
  if (options.includeWeather) {
    nodes.push({
      id: 'weather',
      name: 'Weather API',
      type: 'api',
      status: 'active',
      size: 60,
      details: {
        endpoint: 'api.open-meteo.com',
        dataTypes: ['forecast', 'historical', 'current']
      }
    });
    
    connections.push({
      source: 'ai-comparison',
      target: 'weather',
      strength: 0.7,
      dataFlow: 30,
      status: 'active',
      details: {
        requests: 15,
        latency: '210ms'
      }
    });
  }
  
  // Include News API if specified
  if (options.includeNews) {
    nodes.push({
      id: 'news',
      name: 'News API',
      type: 'api',
      status: 'active',
      size: 60,
      details: {
        endpoint: 'newsapi.org',
        dataTypes: ['headlines', 'everything', 'sources']
      }
    });
    
    connections.push({
      source: 'ai-comparison',
      target: 'news',
      strength: 0.6,
      dataFlow: 25,
      status: 'active',
      details: {
        requests: 8,
        latency: '320ms'
      }
    });
  }
  
  // Add a data storage node
  nodes.push({
    id: 'storage',
    name: 'Data Storage',
    type: 'data',
    status: 'active',
    size: 70,
    details: {
      type: 'Vector Database',
      items: 1247
    }
  });
  
  connections.push({
    source: 'ai-comparison',
    target: 'storage',
    strength: 0.8,
    dataFlow: 50,
    status: 'active',
    details: {
      operations: 'read/write',
      latency: '30ms'
    }
  });
  
  return {
    nodes,
    connections,
    timestamp
  };
}

/**
 * Generates random network graph data for testing and demonstrations
 * @param nodeCount - Number of nodes to generate
 * @param connectionDensity - Ratio of connections to possible connections (0-1)
 * @return Randomly generated network graph
 */
export function generateRandomNetworkData(
  nodeCount: number = 20,
  connectionDensity: number = 0.3
): NetworkGraphData {
  const nodes: NetworkNode[] = [];
  const connections: NetworkConnection[] = [];
  const timestamp = Date.now();
  
  const types: Array<'api' | 'model' | 'service' | 'user' | 'data'> = ['api', 'model', 'service', 'user', 'data'];
  const statuses: Array<'active' | 'inactive' | 'warning' | 'error'> = ['active', 'active', 'active', 'warning', 'error', 'inactive'];
  
  // Generate nodes
  for (let i = 0; i < nodeCount; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    nodes.push({
      id: `node-${i}`,
      name: `Node ${i}`,
      type,
      status,
      size: Math.floor(Math.random() * 60) + 20,
      details: {
        created: new Date().toISOString(),
        value: Math.random() * 100
      }
    });
  }
  
  // Generate connections
  for (let i = 0; i < nodeCount; i++) {
    const connectionCount = Math.floor(Math.random() * (nodeCount * connectionDensity));
    
    for (let j = 0; j < connectionCount; j++) {
      const targetIndex = Math.floor(Math.random() * nodeCount);
      
      if (targetIndex !== i) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        connections.push({
          source: `node-${i}`,
          target: `node-${targetIndex}`,
          strength: Math.random(),
          dataFlow: Math.random() * 100,
          status,
          details: {
            established: new Date().toISOString(),
            packets: Math.floor(Math.random() * 1000)
          }
        });
      }
    }
  }
  
  return {
    nodes,
    connections,
    timestamp
  };
}
