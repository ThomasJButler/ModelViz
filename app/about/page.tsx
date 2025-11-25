/**
 * @author Tom Butler
 * @date 2025-01-24
 * @description About page showcasing ModelViz features and capabilities
 */
"use client";

import { motion } from 'framer-motion';
import { Brain, Cpu, Network, Sparkles, ArrowRight, Code, LineChart } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Brain,
    title: "Advanced AI Models",
    description: "State-of-the-art neural networks trained on massive datasets for unparalleled performance"
  },
  {
    icon: Network,
    title: "Network Analysis",
    description: "Dynamic graph visualisation and relationship mapping for complex systems"
  },
  {
    icon: LineChart,
    title: "Real-time Analytics",
    description: "Live metrics and performance monitoring with instant insights"
  },
  {
    icon: Code,
    title: "Developer Tools",
    description: "Comprehensive APIs and SDKs for seamless AI integration"
  }
];

const capabilities = [
  {
    title: "Natural Language",
    description: "Advanced language models for human-like text generation and understanding",
    stats: "99.8% accuracy",
    icon: Brain,
    color: "text-matrix-primary"
  },
  {
    title: "Computer Vision",
    description: "State-of-the-art image recognition and generation capabilities",
    stats: "Real-time processing",
    icon: Cpu,
    color: "text-matrix-secondary"
  },
  {
    title: "Neural Networks",
    description: "Deep learning models that evolve and improve over time",
    stats: "Continuous learning",
    icon: Network,
    color: "text-matrix-tertiary"
  }
];

/**
 * @constructor
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          {/* Animated particles background */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
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

        <div className="relative max-w-7xl mx-auto text-center">
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
                  <Brain className="w-24 h-24 text-matrix-primary relative filter drop-shadow-[0_0_20px_rgba(0,255,0,0.5)]" />
                </motion.div>
              </div>
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text">
              The Future of AI
              <br />
              Is Now
            </h1>

            <p className="text-xl sm:text-2xl mb-8 text-foreground/80 max-w-3xl mx-auto">
              Experience the next generation of artificial intelligence with our cutting-edge platform
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
                    Launch Platform
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
                  href="/docs"
                  className="relative inline-flex items-center px-8 py-3 rounded-lg border-2 border-matrix-primary bg-transparent text-matrix-primary font-semibold overflow-hidden group transition-all hover:text-background"
                >
                  <span className="absolute inset-0 bg-matrix-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="relative">Documentation</span>
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
              Powerful Features
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI capabilities with intuitive tools
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-matrix-primary/0 via-matrix-primary/5 to-matrix-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon with animation */}
                <motion.div
                  className="relative z-10 mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-10 h-10 text-matrix-primary group-hover:text-matrix-secondary transition-colors duration-300 group-hover:filter group-hover:drop-shadow-[0_0_15px_rgba(0,255,0,0.5)]" />
                </motion.div>

                <h3 className="relative z-10 text-lg font-semibold mb-2 group-hover:text-matrix-primary transition-colors duration-300">{feature.title}</h3>
                <p className="relative z-10 text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors duration-300">{feature.description}</p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-matrix-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
              AI Capabilities
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Harness the power of advanced artificial intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-8 rounded-lg border border-border bg-background hover:border-matrix-primary/50 transition-all"
              >
                <capability.icon className={`w-12 h-12 ${capability.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{capability.title}</h3>
                <p className="text-foreground/70 mb-4">{capability.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-matrix-primary/10 text-matrix-primary text-sm">
                  <Sparkles className="w-4 h-4" />
                  {capability.stats}
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-4xl font-bold bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
              Ready to Transform Your AI Workflow?
            </h2>
            <p className="text-xl text-foreground/70">
              Join thousands of developers and teams already using ModelViz
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-matrix-primary text-background font-semibold text-lg hover:bg-matrix-secondary transition-colors"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
