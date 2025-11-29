/**
 * @author Tom Butler
 * @date 2025-01-24
 * @description About page showcasing ModelViz - AI API Analytics Platform
 */
"use client";

import { motion } from 'framer-motion';
import { Activity, BarChart3, DollarSign, Zap, ArrowRight, Settings, Play, LineChart, Shield, Database, Github } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Activity,
    title: "Multi-Provider Tracking",
    description: "Monitor OpenAI, Anthropic, Google, and Perplexity APIs in one unified dashboard"
  },
  {
    icon: LineChart,
    title: "Real-time Analytics",
    description: "Live metrics on token usage, latency, costs, and error rates as they happen"
  },
  {
    icon: DollarSign,
    title: "Cost Optimization",
    description: "Detailed spending analysis and provider comparison to maximize your AI budget"
  },
  {
    icon: Zap,
    title: "Performance Monitoring",
    description: "Track API health, success rates, and model performance across providers"
  }
];

const howItWorks = [
  {
    step: 1,
    icon: Settings,
    title: "Add Your API Keys",
    description: "Securely configure your API keys for OpenAI, Anthropic, Google, and Perplexity in Settings"
  },
  {
    step: 2,
    icon: Play,
    title: "Test in Playground",
    description: "Compare models side-by-side, test prompts, and see real-time response metrics"
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Analyze on Dashboard",
    description: "View comprehensive analytics, track costs, and optimize your AI API usage"
  }
];

const techStack = [
  { name: "Next.js 16", description: "Latest React framework with App Router" },
  { name: "React 19", description: "Modern React with concurrent features" },
  { name: "TypeScript", description: "Full type safety throughout" },
  { name: "React Three Fiber", description: "3D visualizations and effects" },
  { name: "Tailwind CSS", description: "Utility-first styling" },
  { name: "Framer Motion", description: "Smooth animations" }
];

/**
 * @constructor
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          {/* Animated particles background */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-matrix-primary/30 rounded-full"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                }}
                animate={{
                  y: [null, "-100px"],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 blur-3xl bg-matrix-primary/20 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <BarChart3 className="w-20 h-20 text-matrix-primary relative filter drop-shadow-[0_0_20px_rgba(0,255,0,0.5)]" />
                </motion.div>
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text">
              Your AI API
              <br />
              Analytics Hub
            </h1>

            <p className="text-lg sm:text-xl mb-8 text-foreground/80 max-w-3xl mx-auto">
              Track usage, compare providers, and optimize costs across OpenAI, Anthropic, Google, and Perplexity - all in one beautiful dashboard
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard"
                  className="relative inline-flex items-center px-8 py-3 rounded-lg bg-matrix-primary text-background font-semibold overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-primary bg-[length:200%_100%] animate-shimmer" />
                  <span className="relative flex items-center">
                    View Dashboard
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.div>
                  </span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/playground"
                  className="relative inline-flex items-center px-8 py-3 rounded-lg border-2 border-matrix-primary bg-transparent text-matrix-primary font-semibold overflow-hidden group transition-all hover:text-background"
                >
                  <span className="absolute inset-0 bg-matrix-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="relative flex items-center">
                    <Play className="mr-2 w-5 h-5" />
                    Try Playground
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
              Powerful Analytics Features
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Everything you need to monitor and optimize your AI API usage
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group relative p-6 rounded-lg border border-border bg-card hover:border-matrix-primary/50 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-matrix-primary/0 via-matrix-primary/5 to-matrix-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div
                  className="relative z-10 mb-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-10 h-10 text-matrix-primary group-hover:text-matrix-secondary transition-colors duration-300 group-hover:filter group-hover:drop-shadow-[0_0_15px_rgba(0,255,0,0.5)]" />
                </motion.div>

                <h3 className="relative z-10 text-lg font-semibold mb-2 group-hover:text-matrix-primary transition-colors duration-300">{feature.title}</h3>
                <p className="relative z-10 text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors duration-300">{feature.description}</p>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-matrix-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
              How It Works
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative p-8 rounded-lg border border-border bg-background hover:border-matrix-primary/50 transition-all text-center"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-matrix-primary text-background font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <item.icon className="w-12 h-12 text-matrix-primary mx-auto mb-4 mt-2" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-foreground/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Tech Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Privacy First */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-matrix-primary" />
                <h3 className="text-2xl font-bold">Privacy First</h3>
              </div>
              <div className="space-y-4 text-foreground/70">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-matrix-secondary mt-0.5 flex-shrink-0" />
                  <p><strong className="text-foreground">Local-first storage</strong> - All data stays in your browser. No backend servers storing your information.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-matrix-secondary mt-0.5 flex-shrink-0" />
                  <p><strong className="text-foreground">API keys stay secure</strong> - Keys are stored locally and sent directly to providers. Never passes through our servers.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Github className="w-5 h-5 text-matrix-secondary mt-0.5 flex-shrink-0" />
                  <p><strong className="text-foreground">Open source</strong> - Inspect the code yourself. Full transparency in how your data is handled.</p>
                </div>
              </div>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-8 h-8 text-matrix-primary" />
                <h3 className="text-2xl font-bold">Built With Modern Tech</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {techStack.map((tech) => (
                  <div key={tech.name} className="p-3 rounded-lg bg-background border border-border">
                    <p className="font-semibold text-matrix-primary">{tech.name}</p>
                    <p className="text-xs text-foreground/60">{tech.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
              Ready to Optimize Your AI Stack?
            </h2>
            <p className="text-lg text-foreground/70">
              Start monitoring your API usage and costs today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/settings"
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-matrix-primary text-background font-semibold text-lg hover:bg-matrix-secondary transition-colors"
                >
                  <Settings className="mr-2 w-5 h-5" />
                  Configure API Keys
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="https://github.com/ThomasJButler/ModelViz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 rounded-lg border-2 border-matrix-primary text-matrix-primary font-semibold text-lg hover:bg-matrix-primary/10 transition-colors"
                >
                  <Github className="mr-2 w-5 h-5" />
                  View on GitHub
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
