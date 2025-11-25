/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Usage and billing page displaying token consumption, costs, and usage statistics across AI providers
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Box, 
  BarChart, 
  PieChart, 
  Calendar, 
  Download, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Brain,
  Sparkles,
  Code,
  Zap,
  Globe
} from "lucide-react";

// Provider icon map
const providerIcons: Record<string, any> = {
  OpenAI: Brain,
  Anthropic: Sparkles,
  Perplexity: Zap,
  News: Globe
};

// Provider color map
const providerColors: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#b083f9",
  Perplexity: "#5436db",
  News: "#ff6e4f"
};

interface UsageData {
  provider: string;
  tokens: number;
  cost: number;
  requests: number;
  models: {
    name: string;
    tokens: number;
    cost: number;
    requests: number;
  }[];
}

interface DailyUsage {
  date: string;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, {
    tokens: number;
    cost: number;
  }>;
}

/**
 * @constructor
 */
export default function UsagePage() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});

  const usageData: UsageData[] = [
    {
      provider: "OpenAI",
      tokens: 1250000,
      cost: 18.75,
      requests: 427,
      models: [
        { name: "GPT-4", tokens: 750000, cost: 15.00, requests: 152 },
        { name: "GPT-3.5 Turbo", tokens: 500000, cost: 3.75, requests: 275 }
      ]
    },
    {
      provider: "Anthropic",
      tokens: 2300000,
      cost: 32.20,
      requests: 389,
      models: [
        { name: "Claude 3 Opus", tokens: 1200000, cost: 24.00, requests: 112 },
        { name: "Claude 3 Sonnet", tokens: 800000, cost: 6.40, requests: 180 },
        { name: "Claude 3 Haiku", tokens: 300000, cost: 1.80, requests: 97 }
      ]
    },
    {
      provider: "Perplexity",
      tokens: 420000,
      cost: 4.20,
      requests: 85,
      models: [
        { name: "Perplexity Sonar", tokens: 420000, cost: 4.20, requests: 85 }
      ]
    }
  ];

  const dailyUsage: DailyUsage[] = [
    {
      date: "Mar 23",
      totalTokens: 120000,
      totalCost: 1.85,
      byProvider: {
        "OpenAI": { tokens: 45000, cost: 0.75 },
        "Anthropic": { tokens: 60000, cost: 0.84 },
        "Perplexity": { tokens: 15000, cost: 0.26 }
      }
    },
    {
      date: "Mar 24",
      totalTokens: 180000,
      totalCost: 2.52,
      byProvider: {
        "OpenAI": { tokens: 60000, cost: 1.00 },
        "Anthropic": { tokens: 90000, cost: 1.26 },
        "Perplexity": { tokens: 30000, cost: 0.26 }
      }
    },
    {
      date: "Mar 25",
      totalTokens: 210000,
      totalCost: 2.94,
      byProvider: {
        "OpenAI": { tokens: 70000, cost: 1.17 },
        "Anthropic": { tokens: 100000, cost: 1.40 },
        "Perplexity": { tokens: 40000, cost: 0.37 }
      }
    },
    {
      date: "Mar 26",
      totalTokens: 150000,
      totalCost: 2.10,
      byProvider: {
        "OpenAI": { tokens: 50000, cost: 0.83 },
        "Anthropic": { tokens: 70000, cost: 0.98 },
        "Perplexity": { tokens: 30000, cost: 0.29 }
      }
    },
    {
      date: "Mar 27",
      totalTokens: 240000,
      totalCost: 3.36,
      byProvider: {
        "OpenAI": { tokens: 80000, cost: 1.33 },
        "Anthropic": { tokens: 110000, cost: 1.54 },
        "Perplexity": { tokens: 50000, cost: 0.49 }
      }
    },
    {
      date: "Mar 28",
      totalTokens: 280000,
      totalCost: 3.92,
      byProvider: {
        "OpenAI": { tokens: 95000, cost: 1.58 },
        "Anthropic": { tokens: 135000, cost: 1.89 },
        "Perplexity": { tokens: 50000, cost: 0.45 }
      }
    },
    {
      date: "Mar 29",
      totalTokens: 175000,
      totalCost: 2.45,
      byProvider: {
        "OpenAI": { tokens: 55000, cost: 0.92 },
        "Anthropic": { tokens: 85000, cost: 1.19 },
        "Perplexity": { tokens: 35000, cost: 0.34 }
      }
    }
  ];

  const totalTokens = usageData.reduce((sum, provider) => sum + provider.tokens, 0);
  const totalCost = usageData.reduce((sum, provider) => sum + provider.cost, 0);
  const totalRequests = usageData.reduce((sum, provider) => sum + provider.requests, 0);

  const toggleProvider = (provider: string) => {
    setExpandedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-matrix-primary" />
            <h2 className="text-2xl font-bold">Usage & Billing</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <div className="flex overflow-hidden rounded-md border border-foreground/20">
              {(["7d", "30d", "90d", "all"] as const).map((period) => (
                <button 
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1.5 text-sm ${
                    timeframe === period 
                      ? "bg-matrix-primary text-background" 
                      : "bg-background/30 text-foreground/70 hover:bg-foreground/10"
                  }`}
                >
                  {period === "all" ? "All Time" : period}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-foreground/20 bg-background/30 text-foreground/70 hover:bg-foreground/10">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
            <p className="text-sm text-foreground/50 mb-1">Total Tokens</p>
            <p className="text-3xl font-bold text-foreground/90">{formatNumber(totalTokens)}</p>
            <p className="text-xs text-foreground/50 mt-1">Average: {formatNumber(Math.round(totalTokens / 30))} per day</p>
          </div>
          
          <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
            <p className="text-sm text-foreground/50 mb-1">Total Cost</p>
            <p className="text-3xl font-bold text-foreground/90">{formatCurrency(totalCost)}</p>
            <p className="text-xs text-foreground/50 mt-1">Average: {formatCurrency(totalCost / 30)} per day</p>
          </div>
          
          <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
            <p className="text-sm text-foreground/50 mb-1">Total Requests</p>
            <p className="text-3xl font-bold text-foreground/90">{formatNumber(totalRequests)}</p>
            <p className="text-xs text-foreground/50 mt-1">Average: {formatNumber(Math.round(totalRequests / 30))} per day</p>
          </div>
        </div>
        
        {/* Usage chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Daily Usage</h3>
          <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50 h-64 flex items-center justify-center">
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-end">
                {dailyUsage.map((day, index) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div className="relative w-16 max-w-[80%]" style={{ height: `${Math.min(day.totalTokens / 3000, 100)}%` }}>
                      {Object.entries(day.byProvider).map(([provider, data], idx) => {
                        const height = (data.tokens / day.totalTokens) * 100;
                        return (
                          <div
                            key={provider}
                            className="absolute w-full"
                            style={{
                              height: `${height}%`,
                              bottom: `${Object.entries(day.byProvider)
                                .slice(0, idx)
                                .reduce((sum, [_, d]) => sum + (d.tokens / day.totalTokens) * 100, 0)}%`,
                              backgroundColor: providerColors[provider] || '#aaa',
                              opacity: 0.8
                            }}
                            title={`${provider}: ${formatNumber(data.tokens)} tokens ($${data.cost.toFixed(2)})`}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs text-foreground/70">{day.date}</div>
                    <div className="text-xs text-foreground/50">${day.totalCost.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Provider Breakdown</h3>
          <div className="space-y-4">
            {usageData.map((provider) => {
              const isExpanded = expandedProviders[provider.provider] || false;
              const percentageTokens = (provider.tokens / totalTokens) * 100;
              const percentageCost = (provider.cost / totalCost) * 100;
              
              const ProviderIcon = providerIcons[provider.provider] || Box;
              
              return (
                <div 
                  key={provider.provider}
                  className="border border-matrix-primary/20 rounded-lg overflow-hidden bg-background/50"
                >
                  <button
                    onClick={() => toggleProvider(provider.provider)}
                    className="w-full p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md" style={{ backgroundColor: `${providerColors[provider.provider]}20` }}>
                        <ProviderIcon className="w-5 h-5" style={{ color: providerColors[provider.provider] }} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold">{provider.provider}</h4>
                        <div className="flex items-center gap-6 mt-1">
                          <p className="text-sm text-foreground/50">
                            {formatNumber(provider.tokens)} tokens ({percentageTokens.toFixed(1)}%)
                          </p>
                          <p className="text-sm text-foreground/50">
                            {formatCurrency(provider.cost)} ({percentageCost.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-foreground/50" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-foreground/50" />
                      )}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="pt-2 pb-3 border-t border-foreground/10">
                        <h5 className="text-sm font-medium mb-2">Models</h5>
                        <div className="space-y-3">
                          {provider.models.map((model) => {
                            const modelPercentageTokens = (model.tokens / provider.tokens) * 100;
                            const modelPercentageCost = (model.cost / provider.cost) * 100;
                            
                            return (
                              <div key={model.name} className="flex items-center">
                                <div className="w-1/3">
                                  <p className="text-sm">{model.name}</p>
                                </div>
                                <div className="w-1/3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full rounded-full"
                                        style={{ 
                                          width: `${modelPercentageTokens}%`,
                                          backgroundColor: providerColors[provider.provider] 
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-foreground/50 w-12">
                                      {modelPercentageTokens.toFixed(1)}%
                                    </p>
                                  </div>
                                  <p className="text-xs text-foreground/50 mt-1">
                                    {formatNumber(model.tokens)} tokens
                                  </p>
                                </div>
                                <div className="w-1/3">
                                  <p className="text-sm">{formatCurrency(model.cost)}</p>
                                  <p className="text-xs text-foreground/50">
                                    {model.requests} requests
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
