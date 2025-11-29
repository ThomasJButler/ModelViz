# ModelViz

Interactive analytics platform for comparing AI models across multiple providers with real-time performance metrics, cost analysis, and 3D visualizations.

## What It Does

Compare OpenAI, Anthropic, Google (Gemini), and Perplexity models side by side. Test prompts across multiple models simultaneously, track usage metrics, analyze costs, and visualize API performance with an immersive cyberpunk-themed interface.

<img width="1164" height="771" alt="image" src="https://github.com/user-attachments/assets/8450977e-f3b3-4087-8300-3846541f272e" />

## Installation

```bash
git clone https://github.com/ThomasJButler/modelviz.git
cd modelviz
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Key Configuration

API keys are configured in the Settings page (stored securely in browser localStorage):

| Provider | Key Format | Models |
|----------|-----------|--------|
| OpenAI | `sk-...` | GPT-4o, GPT-4 Turbo, GPT-3.5, o1 |
| Anthropic | `sk-ant-...` | Claude 3.5 Sonnet, Claude 3 Opus/Haiku |
| Google | `AIza...` | Gemini 2.0 Flash, Gemini 1.5 Pro/Flash |
| Perplexity | `pplx-...` | Sonar models |

Demo mode available without API keys for testing the interface.

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router, Turbopack), React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS, Framer Motion 12 |
| **3D Graphics** | @react-three/fiber, @react-three/drei |
| **Charts** | Recharts |
| **UI** | Radix UI, shadcn/ui |
| **Editor** | Monaco Editor |
| **Storage** | LocalStorage, IndexedDB (90-day retention) |

## Key Pages

| Page | Description |
|------|-------------|
| **Playground** | Test AI models with text, JSON, or code input |
| **Compare** | Side-by-side model comparison with metrics |
| **Dashboard** | 10 analytics views (real-time, cost, performance, 3D network) |
| **Settings** | API key management with import/export |

## Project Structure

```text
ModelViz/
├── app/                    # Next.js app router pages
│   ├── playground/        # AI playground with 3D visualizations
│   ├── compare/           # Model comparison tool
│   ├── dashboard/         # Analytics dashboard
│   └── settings/          # API configuration
├── components/            # React components
│   ├── 3d/               # 3D visualization components
│   ├── effects/          # Cyberpunk visual effects
│   └── ui/               # UI primitives
├── lib/                   # Core business logic
│   ├── api/              # API clients (OpenAI, Anthropic, Google, Perplexity)
│   ├── services/         # MetricsService, ComparisonService
│   └── utils/            # Cost calculator, utilities
└── __tests__/            # Test files
```

## Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type check
npm run lint
```

## Deployment

Optimized for Vercel deployment. Includes:

- Turbopack for fast development
- Bundle splitting for optimal loading
- Edge-compatible API routes

## License

MIT - see [LICENSE](LICENSE)

## Author

Thomas Butler
[thomasjbutler.me](https://thomasjbutler.me) | [GitHub](https://github.com/ThomasJButler)
