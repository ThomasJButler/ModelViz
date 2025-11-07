# ModelViz

Interactive tool for comparing OpenAI, Anthropic, DeepSeek, and Perplexity models side by side with real-time performance metrics and visualisations.

## What It Does

Portfolio project demonstrating multi-AI model comparison. Test different models with the same prompt, compare response times, token usage, and export results. Includes 3D network visualisations and performance analytics (demo data)

<img width="1311" height="871" alt="image" src="https://github.com/user-attachments/assets/1a5e773d-93a3-4fe1-8941-1d524230f5f5" />

## Installation

```bash
git clone https://github.com/ThomasJButler/modelviz.git
cd modelviz
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

API keys are optional - demo mode works without them:

```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
PERPLEXITY_API_KEY=your_key_here
```

See [.env.example](.env.example) for feature flags and rate limiting configuration.

## Tech Stack

**Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
**Visualisations**: Three.js, D3.js, Recharts
**UI Components**: Radix UI, shadcn/ui
**Code Editor**: Monaco Editor

## Key Features

- Playground for testing AI models with JSON, text, or code input
- Side-by-side model comparison with metrics
- Model recommender based on use case
- Custom model builder
- 12+ visualisation types (3D graphs, heatmaps, network analysis)
- Performance monitoring and analytics

## Deployment

Optimised for Vercel. Bundle splitting configured for framework, UI, visualisations, and editor chunks. See [next.config.js](next.config.js) for webpack configuration.

## Licence

MIT - see [LICENSE](LICENSE)

## Author

Thomas Butler
[thomasjbutler.me](https://thomasjbutler.me) | [GitHub](https://github.com/ThomasJButler)
