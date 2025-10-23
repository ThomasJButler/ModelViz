/**
 * @file provider-selector.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description AI provider selection component for choosing between different services.
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Code, Zap, ArrowDown } from "lucide-react";
import { type ProviderGroupedModels } from "@/lib/playground/models";

interface ProviderSelectorProps {
  providers: ProviderGroupedModels[];
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
  isLoading?: boolean;
}

const providerIcons: Record<string, any> = {
  OpenAI: Brain,
  Anthropic: Sparkles,
  DeepSeek: Code,
  Perplexity: Zap,
  Demo: Brain
};

/**
 * @constructor
 */
export function ProviderSelector({ 
  providers, 
  selectedProvider, 
  onSelectProvider,
  isLoading = false
}: ProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProviderData, setSelectedProviderData] = useState<ProviderGroupedModels | null>(null);

  // Update selected provider data when providers or selected provider changes
  /** @constructs */
  useEffect(() => {
    const provider = providers.find(p => p.provider === selectedProvider);
    setSelectedProviderData(provider || null);
  }, [providers, selectedProvider]);

  // Get the appropriate icon for the selected provider
  const SelectedIcon = selectedProviderData 
    ? providerIcons[selectedProviderData.provider] || Brain
    : Brain;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 py-3 bg-background/70 backdrop-blur-sm rounded-lg border border-matrix-primary/20 hover:border-matrix-primary/40 hover:bg-background/90 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-matrix-primary/10">
            <SelectedIcon className="w-5 h-5 text-matrix-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold">{selectedProviderData?.provider || "Select Provider"}</p>
            <p className="text-xs text-foreground/50">{selectedProviderData?.models.length || 0} models available</p>
          </div>
        </div>
        <ArrowDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 mt-2 w-full rounded-lg border border-matrix-primary/20 bg-card/95 backdrop-blur-sm shadow-lg shadow-matrix-primary/5 overflow-hidden"
        >
          <ul className="py-2 max-h-60 overflow-y-auto">
            {providers.map((provider) => {
              const Icon = providerIcons[provider.provider] || Brain;
              return (
                <li key={provider.provider}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-matrix-primary/10 transition-colors ${
                      selectedProvider === provider.provider 
                        ? 'text-matrix-primary bg-matrix-primary/5'
                        : 'text-foreground'
                    }`}
                    onClick={() => {
                      onSelectProvider(provider.provider);
                      setIsOpen(false);
                    }}
                  >
                    <div className={`p-2 rounded-md ${selectedProvider === provider.provider ? 'bg-matrix-primary/20' : 'bg-foreground/5'}`}>
                      <Icon className={`w-4 h-4 ${selectedProvider === provider.provider ? 'text-matrix-primary' : 'text-foreground/70'}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{provider.provider}</p>
                      <p className="text-xs text-foreground/50">{provider.models.length} models</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

// A styled badge showing the provider name
/**
 * @constructor
 */
export function ProviderBadge({ provider }: { provider: string }) {
  const Icon = providerIcons[provider] || Brain;
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-matrix-primary/10 border border-matrix-primary/20">
      <Icon className="w-3 h-3 text-matrix-primary" />
      <span className="text-xs font-medium text-matrix-primary">{provider}</span>
    </div>
  );
}
