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
    description: 'Get your AI analytics dashboard up and running in 4 simple steps.',
    content: `
# How to Use ModelViz

ModelViz visualizes your AI API usage in real-time. Follow these simple steps to get started:

## Step 1: Add Your API Keys

Go to **Settings** and add your API keys for the providers you use:
- **OpenAI** - GPT-4, GPT-3.5, DALL-E
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Haiku
- **Google** - Gemini 2.0 Flash, Gemini 1.5 Pro
- **Perplexity** - Sonar models

Your keys are stored securely in your browser's local storage and never sent to any external server.

## Step 2: Refresh the Page

After adding your API keys, refresh the page to ensure everything is loaded correctly.

## Step 3: Test on the Playground

Head to the **Playground** and make some API calls:
1. Select a provider and model
2. Enter a prompt
3. Click "Generate" to make an API call

Each call will be tracked and recorded for your analytics.

## Step 4: View Analytics on Dashboard

Your usage statistics will automatically populate on the **Dashboard**:
- **Total API calls** - Track your overall usage
- **Cost tracking** - Monitor spending across providers
- **Response times** - Analyze latency and performance
- **Provider distribution** - See which APIs you use most

The more you use the Playground, the more data you'll see in your analytics!

## Tips

- Use the real-time stream to watch API calls as they happen
- Compare provider performance in the comparison view
- Export your data for external analysis
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