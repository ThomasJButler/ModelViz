/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description User profile overview page displaying account information and platform feature guides
 */
"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  ExternalLink,
  Key,
  FileCode,
  Zap,
  LineChart,
  BarChart3,
  Terminal
} from "lucide-react";

/**
 * @constructor
 */
export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <h2 className="text-2xl font-bold mb-4">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-matrix-primary" />
            <div>
              <p className="text-sm text-foreground/50">Username</p>
              <p className="font-medium">demo_user</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-matrix-primary" />
            <div>
              <p className="text-sm text-foreground/50">Email</p>
              <p className="font-medium">demo@example.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-matrix-primary" />
            <div>
              <p className="text-sm text-foreground/50">Joined</p>
              <p className="font-medium">March 30, 2024</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ExternalLink className="w-5 h-5 text-matrix-primary" />
            <div>
              <p className="text-sm text-foreground/50">Plan</p>
              <p className="font-medium">Pro (Annual)</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Getting Started</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-foreground/80">
            Welcome to AI Comparison Showcase! Configure your environment and explore powerful AI comparison tools:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-4 rounded-lg border border-matrix-primary/30 bg-matrix-primary/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-matrix-primary/20">
                  <Key className="w-5 h-5 text-matrix-primary" />
                </div>
                <h3 className="text-lg font-semibold">1. Set Up API Keys</h3>
              </div>
              <p className="text-sm text-foreground/70 mb-3">
                Configure your AI provider API keys in the{" "}
                <a href="/profile/api-settings" className="text-matrix-primary hover:underline">
                  API Settings
                </a>{" "}
                section. This enables all AI capabilities across the platform.
              </p>
              <a 
                href="/profile/api-settings" 
                className="inline-block px-3 py-1 text-sm bg-matrix-primary/10 border border-matrix-primary/30 rounded-md text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
              >
                Configure APIs →
              </a>
            </div>
            
            <div className="p-4 rounded-lg border border-matrix-primary/30 bg-matrix-primary/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-matrix-primary/20">
                  <FileCode className="w-5 h-5 text-matrix-primary" />
                </div>
                <h3 className="text-lg font-semibold">2. Create Models</h3>
              </div>
              <p className="text-sm text-foreground/70 mb-3">
                Build and customise your own AI models in the{" "}
                <a href="/models" className="text-matrix-primary hover:underline">
                  Models
                </a>{" "}
                section. Create specialized AI agents for different tasks.
              </p>
              <a 
                href="/models" 
                className="inline-block px-3 py-1 text-sm bg-matrix-primary/10 border border-matrix-primary/30 rounded-md text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
              >
                Explore Models →
              </a>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <div className="flex items-center mb-6">
          <Zap className="w-6 h-6 text-matrix-primary mr-2" />
          <h2 className="text-2xl font-bold">Platform Features</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg border border-matrix-primary/30 bg-matrix-primary/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md bg-matrix-primary/20">
                <LineChart className="w-5 h-5 text-matrix-primary" />
              </div>
              <h3 className="text-lg font-semibold">Dashboard</h3>
            </div>
            <p className="text-sm text-foreground/70 mb-3">
              Your central command center for monitoring AI system health, usage statistics, and key metrics at a glance. Get a comprehensive overview of your AI operations.
            </p>
            <a 
              href="/dashboard" 
              className="inline-block px-3 py-1 text-sm bg-matrix-primary/10 border border-matrix-primary/30 rounded-md text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
            >
              View Dashboard →
            </a>
          </div>
          
          <div className="p-4 rounded-lg border border-matrix-primary/30 bg-matrix-primary/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md bg-matrix-primary/20">
                <BarChart3 className="w-5 h-5 text-matrix-primary" />
              </div>
              <h3 className="text-lg font-semibold">Analytics</h3>
            </div>
            <p className="text-sm text-foreground/70 mb-3">
              Dive deep into performance data, cost analysis, and usage patterns across all your AI models and providers. Gain insights to optimise your AI strategy.
            </p>
            <a 
              href="/analytics" 
              className="inline-block px-3 py-1 text-sm bg-matrix-primary/10 border border-matrix-primary/30 rounded-md text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
            >
              Explore Analytics →
            </a>
          </div>
          
          <div className="p-4 rounded-lg border border-matrix-primary/30 bg-matrix-primary/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md bg-matrix-primary/20">
                <Terminal className="w-5 h-5 text-matrix-primary" />
              </div>
              <h3 className="text-lg font-semibold">Playground</h3>
            </div>
            <p className="text-sm text-foreground/70 mb-3">
              Experiment with different AI models, compare outputs, and fine-tune your prompts in a responsive environment. Test before deploying to production.
            </p>
            <a 
              href="/playground" 
              className="inline-block px-3 py-1 text-sm bg-matrix-primary/10 border border-matrix-primary/30 rounded-md text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
            >
              Open Playground →
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
