# AI Comparison Showcase

Interactive tool for comparing OpenAI, Anthropic, DeepSeek, and Perplexity models side by side with real-time performance metrics and visualisations.

## What It Does

Portfolio project demonstrating multi-AI model comparison. Test different models with the same prompt, compare response times, token usage, and export results. Includes 3D network visualisations and performance analytics.

<img width="1329" height="743" alt="image" src="https://github.com/user-attachments/assets/f7c38e8f-5a41-40a7-809a-65745dfc6bc0" />

## Installation

```bash
git clone https://github.com/ThomasJButler/ai-comparison-showcase.git
cd ai-comparison-showcase
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

## Project Structure

```
app/              # Next.js pages (playground, models, analytics, dashboard)
components/       # React components and visualisations
lib/              # API clients, caching, analytics, performance monitoring
hooks/            # Custom React hooks for animations and interactions
```

See [CLAUDE.md](CLAUDE.md) for architecture details and development guidance.

## Testing

```bash
npm test                # Run test suite
npm run test:coverage   # Coverage report
npm run test:watch      # Watch mode
```

Coverage thresholds: 80% for branches, functions, lines, statements.

## Building

```bash
npm run build           # Production build
npm start               # Start production server
npm run analyze         # Analyse bundle size
```

## Deployment

Optimised for Vercel. Bundle splitting configured for framework, UI, visualisations, and editor chunks. See [next.config.js](next.config.js) for webpack configuration.

## Common Issues

- **Bundle size**: Visualisation components are dynamically imported - use `npm run analyze` to check
- **API rate limits**: Demo mode activates when API keys missing
- **TypeScript errors**: Run `npm run build` to check types

## Licence

MIT - see [LICENSE](LICENSE)

## Author

Thomas Butler
[thomasjbutler.me](https://thomasjbutler.me) | [GitHub](https://github.com/ThomasJButler)
