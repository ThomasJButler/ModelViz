/**
 * @file provider-comparison.tsx
 * @description Provider comparison matrix with interactive radar chart and feature comparison
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  GitCompare,
  Trophy,
  Zap,
  DollarSign,
  Shield,
  Brain,
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  Star
} from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface ProviderScore {
  provider: string;
  speed: number;
  cost: number;
  reliability: number;
  quality: number;
  features: number;
  overall: number;
}

interface Feature {
  name: string;
  OpenAI: boolean | 'partial';
  Anthropic: boolean | 'partial';
  Perplexity: boolean | 'partial';
  Google: boolean | 'partial';
}

export function ProviderComparison() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['OpenAI', 'Anthropic', 'Perplexity', 'Google']);
  const [scores, setScores] = useState<ProviderScore[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedProvider, setRecommendedProvider] = useState<string>('');

  const providerColors = {
    OpenAI: '#10B981',
    Anthropic: '#8B5CF6',
    Perplexity: '#06B6D4',
    Google: '#3B82F6'
  };

  const features: Feature[] = [
    { name: 'Function Calling', OpenAI: true, Anthropic: true, Perplexity: false, Google: true },
    { name: 'Vision/Image Input', OpenAI: true, Anthropic: true, Perplexity: true, Google: true },
    { name: 'Web Search', OpenAI: false, Anthropic: false, Perplexity: true, Google: 'partial' },
    { name: 'Real-time Data', OpenAI: false, Anthropic: false, Perplexity: true, Google: true },
    { name: 'Code Generation', OpenAI: true, Anthropic: true, Perplexity: 'partial', Google: true },
    { name: 'Long Context', OpenAI: 'partial', Anthropic: true, Perplexity: 'partial', Google: true },
    { name: 'Streaming', OpenAI: true, Anthropic: true, Perplexity: true, Google: true },
    { name: 'JSON Mode', OpenAI: true, Anthropic: 'partial', Perplexity: false, Google: true },
    { name: 'Multi-modal', OpenAI: true, Anthropic: true, Perplexity: 'partial', Google: true },
    { name: 'Fine-tuning', OpenAI: true, Anthropic: false, Perplexity: false, Google: false }
  ];

  useEffect(() => {
    const loadComparison = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');

      if (Object.keys(aggregated.byProvider).length > 0) {
        // Calculate scores from real data
        const providerScores: ProviderScore[] = Object.entries(aggregated.byProvider).map(([provider, stats]) => {
          // Speed score (inversely proportional to latency)
          const speedScore = Math.max(0, Math.min(100, 100 - (stats.avgLatency / 20)));

          // Cost score (inversely proportional to cost per call)
          const costScore = Math.max(0, Math.min(100, 100 - (stats.avgCostPerCall * 1000)));

          // Reliability score (based on success rate)
          const reliabilityScore = stats.successRate * 100;

          // Quality score (estimated based on model type)
          const qualityScore = provider === 'Anthropic' ? 95 :
                              provider === 'OpenAI' ? 93 :
                              provider === 'Google' ? 88 :
                              provider === 'Perplexity' ? 85 : 80;

          // Features score (based on feature support)
          const providerFeatures = features.filter(f =>
            f[provider as keyof Feature] === true
          ).length;
          const featuresScore = (providerFeatures / features.length) * 100;

          // Overall score (weighted average)
          const overall = (speedScore * 0.2 + costScore * 0.2 + reliabilityScore * 0.3 +
                          qualityScore * 0.2 + featuresScore * 0.1);

          return {
            provider,
            speed: Math.round(speedScore),
            cost: Math.round(costScore),
            reliability: Math.round(reliabilityScore),
            quality: Math.round(qualityScore),
            features: Math.round(featuresScore),
            overall: Math.round(overall)
          };
        });

        setScores(providerScores);
      } else {
        // Demo scores
        const demoScores: ProviderScore[] = [
          {
            provider: 'OpenAI',
            speed: 85,
            cost: 65,
            reliability: 95,
            quality: 93,
            features: 80,
            overall: 84
          },
          {
            provider: 'Anthropic',
            speed: 82,
            cost: 70,
            reliability: 98,
            quality: 95,
            features: 70,
            overall: 83
          },
          {
            provider: 'Perplexity',
            speed: 78,
            cost: 85,
            reliability: 92,
            quality: 85,
            features: 60,
            overall: 80
          },
          {
            provider: 'Google',
            speed: 88,
            cost: 80,
            reliability: 94,
            quality: 88,
            features: 75,
            overall: 85
          }
        ];
        setScores(demoScores);
      }

      setLoading(false);
    };

    loadComparison();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Prepare radar chart data
    const metrics = ['Speed', 'Cost', 'Reliability', 'Quality', 'Features'];
    const data = metrics.map(metric => {
      const point: any = { metric };
      selectedProviders.forEach(provider => {
        const score = scores.find(s => s.provider === provider);
        if (score) {
          point[provider] = score[metric.toLowerCase() as keyof ProviderScore];
        }
      });
      return point;
    });
    setRadarData(data);

    // Determine recommended provider
    const selectedScores = scores.filter(s => selectedProviders.includes(s.provider));
    if (selectedScores.length > 0) {
      const best = selectedScores.reduce((prev, current) =>
        prev.overall > current.overall ? prev : current
      );
      setRecommendedProvider(best.provider);
    }
  }, [selectedProviders, scores]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <GitCompare className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitCompare className="w-6 h-6 text-matrix-primary" />
          <div>
            <h3 className="text-xl font-semibold text-matrix-primary">Provider Comparison Matrix</h3>
            <p className="text-sm text-foreground/60">Compare AI providers across key metrics</p>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="flex gap-2">
          {['OpenAI', 'Anthropic', 'Perplexity', 'Google'].map(provider => (
            <motion.button
              key={provider}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (selectedProviders.includes(provider)) {
                  setSelectedProviders(prev => prev.filter(p => p !== provider));
                } else {
                  setSelectedProviders(prev => [...prev, provider]);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedProviders.includes(provider)
                  ? 'border-2'
                  : 'bg-background/50 text-foreground/50 border border-border'
              }`}
              style={{
                borderColor: selectedProviders.includes(provider)
                  ? providerColors[provider as keyof typeof providerColors]
                  : undefined,
                color: selectedProviders.includes(provider)
                  ? providerColors[provider as keyof typeof providerColors]
                  : undefined,
                backgroundColor: selectedProviders.includes(provider)
                  ? `${providerColors[provider as keyof typeof providerColors]}20`
                  : undefined
              }}
            >
              {provider}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
        >
          <h4 className="text-lg font-semibold text-matrix-primary mb-4">Performance Radar</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="metric" stroke="#666" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
              {selectedProviders.map(provider => (
                <Radar
                  key={provider}
                  name={provider}
                  dataKey={provider}
                  stroke={providerColors[provider as keyof typeof providerColors]}
                  fill={providerColors[provider as keyof typeof providerColors]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score Cards */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-matrix-primary">Provider Scores</h4>
          {scores
            .filter(s => selectedProviders.includes(s.provider))
            .sort((a, b) => b.overall - a.overall)
            .map((score, index) => (
              <motion.div
                key={score.provider}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-background/50 rounded-lg border border-border hover:border-matrix-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: providerColors[score.provider as keyof typeof providerColors] }}
                    />
                    <span className="font-semibold text-foreground">{score.provider}</span>
                    {score.provider === recommendedProvider && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 bg-matrix-primary/20 text-matrix-primary text-xs rounded-full
                                 border border-matrix-primary/30 flex items-center gap-1"
                      >
                        <Trophy className="w-3 h-3" />
                        Recommended
                      </motion.div>
                    )}
                  </div>
                  <div className="text-2xl font-bold" style={{
                    color: providerColors[score.provider as keyof typeof providerColors]
                  }}>
                    {score.overall}
                  </div>
                </div>

                {/* Metric Bars */}
                <div className="space-y-2">
                  {[
                    { name: 'Speed', value: score.speed, icon: Zap },
                    { name: 'Cost', value: score.cost, icon: DollarSign },
                    { name: 'Reliability', value: score.reliability, icon: Shield },
                    { name: 'Quality', value: score.quality, icon: Brain },
                    { name: 'Features', value: score.features, icon: Star }
                  ].map(metric => (
                    <div key={metric.name} className="flex items-center gap-3">
                      <metric.icon className="w-3 h-3 text-foreground/50" />
                      <span className="text-xs text-foreground/60 w-16">{metric.name}</span>
                      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: providerColors[score.provider as keyof typeof providerColors]
                          }}
                        />
                      </div>
                      <span className="text-xs text-foreground/70 w-8 text-right">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-black/50 rounded-xl border border-matrix-primary/20"
      >
        <h4 className="text-lg font-semibold text-matrix-primary mb-4">Feature Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-foreground/70">Feature</th>
                {selectedProviders.map(provider => (
                  <th key={provider} className="text-center py-2 px-3" style={{
                    color: providerColors[provider as keyof typeof providerColors]
                  }}>
                    {provider}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <motion.tr
                  key={feature.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-border/50 hover:bg-matrix-primary/5 transition-colors"
                >
                  <td className="py-2 px-3 text-foreground/80">{feature.name}</td>
                  {selectedProviders.map(provider => (
                    <td key={provider} className="text-center py-2 px-3">
                      {feature[provider as keyof Feature] === true ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      ) : feature[provider as keyof Feature] === 'partial' ? (
                        <MinusCircle className="w-4 h-4 text-yellow-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500/50 mx-auto" />
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}