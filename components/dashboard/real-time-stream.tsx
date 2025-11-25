/**
 * @file real-time-stream.tsx
 * @description Real-time streaming panel showing live API activity with matrix-themed animations
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { formatDistanceToNow } from 'date-fns';

interface StreamItem {
  id: string;
  timestamp: Date;
  provider: string;
  model: string;
  status: 'success' | 'error' | 'pending';
  latency: number;
  cost: number;
  tokens: {
    input: number;
    output: number;
  };
  preview?: {
    request: string;
    response: string;
  };
}

export function RealTimeStream() {
  const [streamItems, setStreamItems] = useState<StreamItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);
  const [stats, setStats] = useState({
    requestsPerMinute: 0,
    avgLatency: 0,
    successRate: 0
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Provider colors
  const providerColors = {
    OpenAI: '#10B981',
    Anthropic: '#8B5CF6',
    Perplexity: '#06B6D4',
    Google: '#3B82F6'
  };

  useEffect(() => {
    // Generate demo stream data
    const generateStreamItem = (): StreamItem => {
      const providers = ['OpenAI', 'Anthropic', 'Perplexity', 'Google'];
      const models = {
        OpenAI: ['gpt-4-turbo', 'gpt-3.5-turbo'],
        Anthropic: ['claude-3-opus', 'claude-3-sonnet'],
        Perplexity: ['sonar-pro', 'sonar'],
        Google: ['gemini-pro', 'gemini-flash']
      };

      const provider = providers[Math.floor(Math.random() * providers.length)];
      const modelList = models[provider as keyof typeof models];
      const model = modelList[Math.floor(Math.random() * modelList.length)];
      const status = Math.random() > 0.95 ? 'error' : 'success';

      return {
        id: `stream-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        provider,
        model,
        status,
        latency: Math.floor(100 + Math.random() * 2000),
        cost: Math.random() * 0.05,
        tokens: {
          input: Math.floor(100 + Math.random() * 500),
          output: Math.floor(100 + Math.random() * 1000)
        },
        preview: Math.random() > 0.7 ? {
          request: "Analyze the sentiment of this text...",
          response: "The sentiment analysis indicates positive..."
        } : undefined
      };
    };

    // Load real metrics if available
    const loadRealMetrics = async () => {
      const service = MetricsService.getInstance();
      const recentMetrics = await service.getRecentMetrics(20);

      if (recentMetrics.length > 0) {
        setHasRealData(true);
        const realStreamItems: StreamItem[] = recentMetrics.map(metric => ({
          id: `real-${metric.timestamp}-${Math.random()}`,
          timestamp: new Date(metric.timestamp),
          provider: metric.provider,
          model: metric.model,
          status: metric.status as 'success' | 'error',
          latency: metric.latency,
          cost: metric.estimatedCost,
          tokens: {
            input: metric.promptTokens,
            output: metric.completionTokens
          }
        }));

        setStreamItems(prev => [...realStreamItems, ...prev].slice(0, 50));

        // Calculate stats from real data
        const successCount = recentMetrics.filter(m => m.status === 'success').length;
        const avgLatency = recentMetrics.reduce((sum, m) => sum + m.latency, 0) / recentMetrics.length;

        setStats({
          requestsPerMinute: Math.round((recentMetrics.length / 5) * 60), // Estimate RPM
          avgLatency: Math.round(avgLatency),
          successRate: (successCount / recentMetrics.length) * 100
        });
      } else {
        setHasRealData(false);
      }
    };

    loadRealMetrics();

    // Simulate streaming data ONLY if no real data exists
    const interval = setInterval(() => {
      // Only generate demo data if streaming is enabled and no real data exists
      if (isStreaming && !hasRealData) {
        const newItem = generateStreamItem();
        setStreamItems(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items

        // Update stats with simulated data
        setStats(prev => ({
          requestsPerMinute: Math.round(15 + Math.random() * 10),
          avgLatency: Math.round(800 + Math.random() * 400),
          successRate: 95 + Math.random() * 4
        }));
      }
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds

    // Listen for real metrics updates
    const handleMetricsUpdate = () => loadRealMetrics();
    window.addEventListener('metrics-updated', handleMetricsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('metrics-updated', handleMetricsUpdate);
    };
  }, [isStreaming, hasRealData]);

  // Auto-scroll to latest
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [streamItems, autoScroll]);

  return (
    <div className="h-full flex flex-col bg-black/50 rounded-xl border border-matrix-primary/20">
      {/* Header */}
      <div className="p-4 border-b border-matrix-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-6 h-6 text-matrix-primary" />
              {isStreaming && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-matrix-primary rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-matrix-primary">Live Activity Stream</h3>
              <p className="text-xs text-foreground/60">Real-time API requests</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                autoScroll
                  ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary/30'
                  : 'bg-background/50 text-foreground/70 border border-border'
              }`}
            >
              Auto-scroll
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isStreaming
                  ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isStreaming ? (
                <>
                  <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />
                  Streaming
                </>
              ) : (
                'Paused'
              )}
            </motion.button>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-2 bg-matrix-primary/5 rounded-lg border border-matrix-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-matrix-primary" />
              <span className="text-xs text-foreground/60">Requests/min</span>
            </div>
            <p className="text-lg font-bold text-matrix-primary">{stats.requestsPerMinute}</p>
          </div>

          <div className="p-2 bg-matrix-secondary/5 rounded-lg border border-matrix-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-matrix-secondary" />
              <span className="text-xs text-foreground/60">Avg Latency</span>
            </div>
            <p className="text-lg font-bold text-matrix-secondary">{stats.avgLatency}ms</p>
          </div>

          <div className="p-2 bg-matrix-tertiary/5 rounded-lg border border-matrix-tertiary/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3 h-3 text-matrix-tertiary" />
              <span className="text-xs text-foreground/60">Success Rate</span>
            </div>
            <p className="text-lg font-bold text-matrix-tertiary">{stats.successRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Stream Items */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2"
        onScroll={() => {
          if (scrollRef.current) {
            setAutoScroll(scrollRef.current.scrollTop === 0);
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {streamItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: index * 0.02
              }}
              className="p-3 bg-background/50 rounded-lg border border-border hover:border-matrix-primary/30
                       transition-all hover:bg-matrix-primary/5 group"
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-1">
                  {item.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : item.status === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-medium text-sm"
                      style={{ color: providerColors[item.provider as keyof typeof providerColors] || '#00ff00' }}
                    >
                      {item.provider}
                    </span>
                    <ArrowRight className="w-3 h-3 text-foreground/30" />
                    <span className="text-sm text-foreground/70">{item.model}</span>
                    <span className="text-xs text-foreground/50 ml-auto">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-foreground/50" />
                      <span className="text-foreground/70">{item.latency}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-foreground/50">Tokens:</span>
                      <span className="text-foreground/70">
                        {item.tokens.input}/{item.tokens.output}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-foreground/50">$</span>
                      <span className="text-foreground/70">{item.cost.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Preview (shows on hover) */}
                  {item.preview && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2 pt-2 border-t border-border/50 text-xs space-y-1
                               opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="flex gap-2">
                        <span className="text-foreground/50">Request:</span>
                        <span className="text-foreground/70 truncate">{item.preview.request}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-foreground/50">Response:</span>
                        <span className="text-foreground/70 truncate">{item.preview.response}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {streamItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Activity className="w-12 h-12 text-foreground/20 mb-4" />
            <p className="text-foreground/50 mb-2">No activity yet</p>
            <p className="text-sm text-foreground/30">API requests will appear here in real-time</p>
          </div>
        )}
      </div>

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-matrix-primary to-transparent"
            style={{
              left: `${30 + i * 20}%`,
              height: '100%'
            }}
            animate={{
              y: ['-100%', '100%']
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
}