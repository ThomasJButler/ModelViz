/**
 * @file playground-guide.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Interactive playground guide with tutorials and feature demonstrations.
 */

"use client";

import { motion } from 'framer-motion';
import { X, Brain, Code, Activity, Shield, Sparkles, Zap } from 'lucide-react';

interface PlaygroundGuideProps {
  onClose: () => void;
}

/**
 * @constructor
 */
export function PlaygroundGuide({ onClose }: PlaygroundGuideProps) {
  const sections = [
    {
      title: "Getting Started",
      icon: Brain,
      content: [
        "Select an AI model from the dropdown menu",
        "Choose your input format (JSON, Text, or Code)",
        "Enter your input in the editor",
        "Click 'Run' to process your input"
      ]
    },
    {
      title: "Code Playground",
      icon: Code,
      content: [
        "Test different AI models with your inputs",
        "Experiment with various input formats",
        "View detailed model responses",
        "Compare performance across models"
      ]
    },
    {
      title: "Disaster Simulation",
      icon: Zap,
      content: [
        "Simulate real-world scenarios",
        "Test system resilience",
        "Observe performance under stress",
        "Practice incident response"
      ]
    },
    {
      title: "Performance Metrics",
      icon: Activity,
      content: [
        "Monitor real-time metrics",
        "Track system performance",
        "Analyze response times",
        "Identify bottlenecks"
      ]
    },
    {
      title: "Game Elements",
      icon: Sparkles,
      content: [
        "Earn points for successful operations",
        "Unlock achievements",
        "Complete challenges",
        "Compete on the leaderboard"
      ]
    },
    {
      title: "Best Practices",
      icon: Shield,
      content: [
        "Start with simple scenarios",
        "Gradually increase complexity",
        "Monitor system metrics",
        "Document your findings"
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg border border-border bg-card p-8"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg hover:bg-matrix-primary/10 text-foreground/70 hover:text-matrix-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text mb-2">
            Playground Guide
          </h2>
          <p className="text-foreground/70">
            Learn how to use the AI playground effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg border border-border bg-background/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-matrix-primary/10">
                    <Icon className="w-5 h-5 text-matrix-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.content.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + i * 0.1 }}
                      className="flex items-center gap-2 text-foreground/70"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-matrix-primary" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-lg border border-matrix-primary/20 bg-matrix-primary/5">
          <h4 className="text-lg font-semibold mb-2 text-matrix-primary">Pro Tips</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-foreground/70">
              <Sparkles className="w-4 h-4 text-matrix-primary" />
              Use the disaster simulator to test your model&apos;s resilience
            </li>
            <li className="flex items-center gap-2 text-foreground/70">
              <Sparkles className="w-4 h-4 text-matrix-secondary" />
              Monitor performance metrics to optimise your setup
            </li>
            <li className="flex items-center gap-2 text-foreground/70">
              <Sparkles className="w-4 h-4 text-matrix-tertiary" />
              Earn achievements by handling complex scenarios successfully
            </li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}