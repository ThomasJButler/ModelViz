/**
 * @file request-timeline.tsx
 * @description Interactive timeline visualization of API requests
 */

"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Filter, Zap, DollarSign, Hash, ChevronDown, X } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { format, subHours, subDays, isAfter } from 'date-fns';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  provider: string;
  model: string;
  latency: number;
  tokens: number;
  cost: number;
  success: boolean;
  error?: string;
}

type TimeRange = '1h' | '6h' | '24h' | '7d';

const providerColors: Record<string, string> = {
  OpenAI: '#10B981',
  Anthropic: '#8B5CF6',
  Perplexity: '#06B6D4',
  Google: '#3B82F6',
  Mistral: '#00ff88',
  Cohere: '#8800ff'
};

export function RequestTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [filterProvider, setFilterProvider] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const recentMetrics = await service.getRecentMetrics(1000);

      if (recentMetrics.length > 0) {
        const timelineEvents: TimelineEvent[] = recentMetrics.map((metric, index) => ({
          id: `event-${index}-${metric.timestamp}`,
          timestamp: new Date(metric.timestamp),
          provider: metric.provider,
          model: metric.model,
          latency: metric.latency,
          tokens: (metric.promptTokens || 0) + (metric.completionTokens || 0),
          cost: metric.estimatedCost || 0,
          success: metric.status === 'success',
          error: metric.errorMessage
        }));

        setEvents(timelineEvents);
      } else {
        // Demo data
        const now = new Date();
        const demoEvents: TimelineEvent[] = [];
        const providers = ['OpenAI', 'Anthropic', 'Google', 'Perplexity'];
        const models = {
          OpenAI: ['gpt-4-turbo', 'gpt-3.5-turbo'],
          Anthropic: ['claude-3-sonnet', 'claude-3-haiku'],
          Google: ['gemini-pro', 'gemini-flash'],
          Perplexity: ['sonar-pro', 'sonar']
        };

        for (let i = 0; i < 50; i++) {
          const provider = providers[Math.floor(Math.random() * providers.length)];
          const providerModels = models[provider as keyof typeof models];
          const model = providerModels[Math.floor(Math.random() * providerModels.length)];

          demoEvents.push({
            id: `demo-${i}`,
            timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
            provider,
            model,
            latency: 100 + Math.random() * 2000,
            tokens: Math.floor(100 + Math.random() * 2000),
            cost: 0.001 + Math.random() * 0.05,
            success: Math.random() > 0.05,
            error: Math.random() > 0.95 ? 'Rate limit exceeded' : undefined
          });
        }

        demoEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setEvents(demoEvents);
      }

      setLoading(false);
    };

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  // Filter events based on time range and provider
  const filteredEvents = useMemo(() => {
    const now = new Date();
    let cutoff: Date;

    switch (timeRange) {
      case '1h': cutoff = subHours(now, 1); break;
      case '6h': cutoff = subHours(now, 6); break;
      case '24h': cutoff = subHours(now, 24); break;
      case '7d': cutoff = subDays(now, 7); break;
    }

    return events.filter(event => {
      const afterCutoff = isAfter(event.timestamp, cutoff);
      const matchesProvider = !filterProvider || event.provider === filterProvider;
      return afterCutoff && matchesProvider;
    });
  }, [events, timeRange, filterProvider]);

  // Get unique providers for filter
  const providers = useMemo(() => {
    return Array.from(new Set(events.map(e => e.provider)));
  }, [events]);

  // Calculate timeline bounds
  const { minTime, maxTime, timeLabels } = useMemo(() => {
    if (filteredEvents.length === 0) {
      const now = new Date();
      return { minTime: now, maxTime: now, timeLabels: [] };
    }

    const times = filteredEvents.map(e => e.timestamp.getTime());
    const min = new Date(Math.min(...times));
    const max = new Date(Math.max(...times));

    // Generate time labels
    const labels: { time: Date; label: string }[] = [];
    const range = max.getTime() - min.getTime();
    const labelCount = 5;

    for (let i = 0; i <= labelCount; i++) {
      const time = new Date(min.getTime() + (range * i / labelCount));
      labels.push({
        time,
        label: timeRange === '7d'
          ? format(time, 'MMM dd')
          : format(time, 'HH:mm')
      });
    }

    return { minTime: min, maxTime: max, timeLabels: labels };
  }, [filteredEvents, timeRange]);

  // Calculate position for an event on the timeline
  const getEventPosition = (timestamp: Date): number => {
    const range = maxTime.getTime() - minTime.getTime();
    if (range === 0) return 50;
    return ((timestamp.getTime() - minTime.getTime()) / range) * 100;
  };

  // Calculate dot size based on tokens (normalized)
  const getDotSize = (tokens: number): number => {
    const minSize = 8;
    const maxSize = 24;
    const maxTokens = Math.max(...filteredEvents.map(e => e.tokens), 1);
    return minSize + ((tokens / maxTokens) * (maxSize - minSize));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-matrix-primary flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Request Timeline
        </h3>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex gap-1 p-1 bg-background/50 rounded-lg border border-matrix-primary/20">
            {timeRanges.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  timeRange === value
                    ? 'bg-matrix-primary/20 text-matrix-primary'
                    : 'text-foreground/60 hover:text-matrix-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-all ${
              filterProvider
                ? 'bg-matrix-primary/20 border-matrix-primary text-matrix-primary'
                : 'border-matrix-primary/20 text-foreground/60 hover:text-matrix-primary'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 p-3 bg-background/50 rounded-lg border border-matrix-primary/20"
          >
            <span className="text-xs text-foreground/60">Filter by provider:</span>
            <button
              onClick={() => setFilterProvider(null)}
              className={`px-2 py-1 rounded text-xs transition-all ${
                !filterProvider
                  ? 'bg-matrix-primary/20 text-matrix-primary'
                  : 'text-foreground/60 hover:text-matrix-primary'
              }`}
            >
              All
            </button>
            {providers.map(provider => (
              <button
                key={provider}
                onClick={() => setFilterProvider(provider)}
                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  filterProvider === provider
                    ? 'bg-matrix-primary/20 text-matrix-primary'
                    : 'text-foreground/60 hover:text-matrix-primary'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: providerColors[provider] || '#00ff00' }}
                />
                {provider}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="relative p-4 bg-background/30 rounded-lg border border-matrix-primary/20">
        {/* Time Labels */}
        <div className="flex justify-between text-xs text-foreground/50 mb-2">
          {timeLabels.map((label, i) => (
            <span key={i}>{label.label}</span>
          ))}
        </div>

        {/* Timeline Line */}
        <div className="relative h-20 mb-2">
          {/* Base Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-matrix-primary/20" />

          {/* Event Dots */}
          {filteredEvents.map((event, index) => {
            const position = getEventPosition(event.timestamp);
            const size = getDotSize(event.tokens);

            return (
              <motion.button
                key={event.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                style={{
                  left: `${position}%`,
                  width: size,
                  height: size,
                  backgroundColor: event.success
                    ? providerColors[event.provider] || '#00ff00'
                    : '#ef4444'
                }}
                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full
                          cursor-pointer transition-all hover:ring-2 hover:ring-white/50 ${
                            selectedEvent?.id === event.id ? 'ring-2 ring-white z-10' : ''
                          }`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          {providers.slice(0, 4).map(provider => (
            <div key={provider} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: providerColors[provider] || '#00ff00' }}
              />
              <span className="text-foreground/60">{provider}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-foreground/60">Error</span>
          </div>
        </div>
      </div>

      {/* Selected Event Details */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg border border-matrix-primary/30 bg-background/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: providerColors[selectedEvent.provider] || '#00ff00' }}
                />
                <span className="font-semibold text-matrix-primary">{selectedEvent.model}</span>
                <span className="text-xs text-foreground/50">{selectedEvent.provider}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-foreground/50 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1 text-foreground/50 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">Time</span>
                </div>
                <p className="font-medium">{format(selectedEvent.timestamp, 'HH:mm:ss')}</p>
                <p className="text-xs text-foreground/50">{format(selectedEvent.timestamp, 'MMM dd')}</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-foreground/50 mb-1">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs">Latency</span>
                </div>
                <p className="font-medium">{Math.round(selectedEvent.latency)}ms</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-foreground/50 mb-1">
                  <Hash className="w-3 h-3" />
                  <span className="text-xs">Tokens</span>
                </div>
                <p className="font-medium">{selectedEvent.tokens.toLocaleString()}</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-foreground/50 mb-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-xs">Cost</span>
                </div>
                <p className="font-medium">${selectedEvent.cost.toFixed(4)}</p>
              </div>
            </div>

            {!selectedEvent.success && selectedEvent.error && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                Error: {selectedEvent.error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Requests</p>
          <p className="text-lg font-bold text-matrix-primary">{filteredEvents.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Success Rate</p>
          <p className="text-lg font-bold text-green-500">
            {filteredEvents.length > 0
              ? ((filteredEvents.filter(e => e.success).length / filteredEvents.length) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Avg Latency</p>
          <p className="text-lg font-bold text-matrix-secondary">
            {filteredEvents.length > 0
              ? Math.round(filteredEvents.reduce((sum, e) => sum + e.latency, 0) / filteredEvents.length)
              : 0}ms
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Total Cost</p>
          <p className="text-lg font-bold text-matrix-tertiary">
            ${filteredEvents.reduce((sum, e) => sum + e.cost, 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
