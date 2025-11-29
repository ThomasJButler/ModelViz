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
    description: 'Get your AI analytics dashboard up and running in minutes.',
    content: `
# Getting Started with ModelViz

ModelViz lets you test and compare AI models from different providers. No account needed, no payments required - just bring your API keys.

## Quick Start

1. **Add your API keys** - Go to Settings and paste your keys
2. **Test models** - Use the Playground to test different AI models
3. **View analytics** - See your usage stats on the Dashboard

## Supported Providers

| Provider | Working Models |
|----------|---------------|
| OpenAI | GPT-3.5 Turbo, GPT-4o, GPT-4o Mini |
| Anthropic | Claude 4.5 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku |
| Google | Gemini 2.0 Flash |
| Perplexity | Sonar, Sonar Pro, Sonar Pro Reasoning |

## Security First

Security is at the heart of ModelViz:

- **No account required** - Start using immediately with zero signup
- **No payments** - We don't collect payment info; you use your own API keys
- **100% client-side** - All data stored locally in your browser
- **Direct API calls** - Requests go straight to providers, not through us
- **No tracking** - We don't collect analytics or usage data
- **Easy removal** - Clear browser data or remove keys in Settings anytime
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
const client = new ModelViz({
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
    title: 'API Key Setup',
    description: 'How to get API keys from each provider.',
    content: `
# API Key Setup Guide

Your API keys are stored securely in your browser's local storage. They are never sent to any server except the AI provider you're querying.

## OpenAI

1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Go to **API Keys** in the left sidebar
4. Click **Create new secret key**
5. Copy the key and add it in ModelViz Settings

## Anthropic

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Go to **API Keys** section
4. Click **Create Key**
5. Copy the key and add it in ModelViz Settings

## Google (Gemini)

1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API key**
4. Create or select a project
5. Copy the key and add it in ModelViz Settings

## Perplexity

1. Visit [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
2. Sign in or create an account
3. Generate a new API key
4. Copy the key and add it in ModelViz Settings

## Security Tips

- **Keys stored locally** - Your keys never leave your browser
- **Set usage limits** - Use provider dashboards to control costs
- **Easy removal** - Clear keys anytime in Settings or clear browser data
- **No server storage** - We have no backend; your data stays with you
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