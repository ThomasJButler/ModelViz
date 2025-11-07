/**
 * @file docs-content.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Documentation content renderer with markdown support and syntax highlighting.
 */

"use client";

import { motion } from 'framer-motion';
import { marked } from 'marked';

// Configure marked to use custom renderer
const renderer = new marked.Renderer();

// Customize code block rendering with copy button
renderer.code = (code, language) => {
  return `
    <div class="relative group">
      <button class="absolute right-2 top-2 px-2 py-1 text-xs rounded-md bg-matrix-primary/10 text-matrix-primary opacity-0 group-hover:opacity-100 transition-opacity" onclick="navigator.clipboard.writeText(\`${code}\`)">
        Copy
      </button>
      <pre><code class="language-${language}">${code}</code></pre>
    </div>
  `;
};

// Customize heading rendering with anchor links
renderer.heading = (text, level) => {
  const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `
    <h${level} id="${slug}" class="group relative">
      <a href="#${slug}" class="absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm">
        #
      </a>
      ${text}
    </h${level}>
  `;
};

// Configure marked options
marked.setOptions({
  renderer,
  gfm: true,
  breaks: true
});

const content = {
  'getting-started': {
    title: 'Getting Started',
    description: 'Learn how to integrate powerful AI models into your applications.',
    content: `
# Quick Start Guide

ModelViz provides state-of-the-art AI models through a simple, developer-friendly API. Get started in minutes with our comprehensive SDK.

## Installation

\`\`\`bash
npm install @ai-comparison/sdk
\`\`\`

## Basic Usage

\`\`\`typescript
import { AIComparison } from '@ai-comparison/sdk';

// Initialize the client
const client = new AIComparison({
  apiKey: process.env.AI_COMPARISON_API_KEY
});

// Use GPT-4 for text generation
const completion = await client.complete({
  model: 'gpt-4',
  prompt: 'Explain quantum computing',
  maxTokens: 500
});

// Generate images with DALL·E 3
const image = await client.generateImage({
  model: 'dall-e-3',
  prompt: 'A futuristic cityscape at sunset',
  size: '1024x1024'
});

// Transcribe audio with Whisper
const transcription = await client.transcribe({
  model: 'whisper-v3',
  file: audioFile,
  language: 'en'
});
\`\`\`

## Key Features

- **Unified API**: Access multiple AI models through a single, consistent interface
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Real-time Capabilities**: WebSocket support for streaming responses
- **Automatic Retries**: Built-in error handling and request retries
- **Rate Limiting**: Smart request throttling to prevent API limits
    `
  },
  'api-reference': {
    title: 'API Reference',
    description: 'Complete documentation of our API endpoints and parameters.',
    content: `
# API Reference

## Authentication

All API requests require authentication using your API key. Include it in the Authorization header:

\`\`\`typescript
const client = new AIComparison({
  apiKey: 'your-api-key'
});
\`\`\`

## Models

### Language Models

#### GPT-4 Turbo
- **Endpoint**: \`/v1/completions\`
- **Context Length**: 128,000 tokens
- **Use Cases**: Text generation, analysis, coding
- **Parameters**:
  - \`model\`: 'gpt-4'
  - \`prompt\`: string
  - \`maxTokens\`: number
  - \`temperature\`: number (0-1)

#### Claude 3
- **Endpoint**: \`/v1/chat\`
- **Context Length**: 200,000 tokens
- **Use Cases**: Long-form content, research
- **Parameters**:
  - \`model\`: 'claude-3'
  - \`messages\`: Message[]
  - \`temperature\`: number (0-1)

### Vision Models

#### DALL·E 3
- **Endpoint**: \`/v1/images\`
- **Capabilities**: Image generation, editing
- **Parameters**:
  - \`model\`: 'dall-e-3'
  - \`prompt\`: string
  - \`size\`: '1024x1024' | '1792x1024' | '1024x1792'
  - \`quality\`: 'standard' | 'hd'

### Audio Models

#### Whisper V3
- **Endpoint**: \`/v1/audio\`
- **Capabilities**: Transcription, translation
- **Parameters**:
  - \`model\`: 'whisper-v3'
  - \`file\`: File | Blob
  - \`language\`: string
  - \`task\`: 'transcribe' | 'translate'
    `
  },
  'models': {
    title: 'Models',
    description: 'Explore the various AI models available in ModelViz.',
    content: `
# Models Overview

## Language Models

### GPT-4 Turbo
- **Endpoint**: \`/v1/completions\`
- **Context Length**: 128,000 tokens
- **Use Cases**: Text generation, analysis, coding
- **Parameters**:
  - \`model\`: 'gpt-4'
  - \`prompt\`: string
  - \`maxTokens\`: number
  - \`temperature\`: number (0-1)

### Claude 3
- **Endpoint**: \`/v1/chat\`
- **Context Length**: 200,000 tokens
- **Use Cases**: Long-form content, research
- **Parameters**:
  - \`model\`: 'claude-3'
  - \`messages\`: Message[]
  - \`temperature\`: number (0-1)

## Vision Models

### DALL·E 3
- **Endpoint**: \`/v1/images\`
- **Capabilities**: Image generation, editing
- **Parameters**:
  - \`model\`: 'dall-e-3'
  - \`prompt\`: string
  - \`size\`: '1024x1024' | '1792x1024' | '1024x1792'
  - \`quality\`: 'standard' | 'hd'

## Audio Models

### Whisper V3
- **Endpoint**: \`/v1/audio\`
- **Capabilities**: Transcription, translation
- **Parameters**:
  - \`model\`: 'whisper-v3'
  - \`file\`: File | Blob
  - \`language\`: string
  - \`task\`: 'transcribe' | 'translate'
    `
  },
  'guides': {
    title: 'Guides',
    description: 'Advanced usage, troubleshooting, and best practices.',
    content: `
# Guides

## Best Practices
Learn to fine-tune requests, handle streaming responses, and more.

## Error Handling
Tips for common integration issues and performance optimizations.

## Advanced Topics
Deep dive into advanced features and capabilities.

## Security
Best practices for securing your API keys and data.
    `
  }
};

interface DocsContentProps {
  selectedSection: string;
}

/**
 * @constructor
 */
export function DocsContent({ selectedSection }: DocsContentProps) {
  const section = content[selectedSection as keyof typeof content];

  return (
    <motion.div
      key={selectedSection}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-3"
    >
      <div className="prose prose-invert max-w-none">
        <div className="p-4 sm:p-6 lg:p-8 rounded-lg border border-border bg-card">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
            {section.title}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-foreground/70 mb-8">
            {section.description}
          </p>
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ 
              __html: marked(section.content) 
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}