# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Comparison Showcase is a Next.js 14 portfolio application demonstrating multi-AI model comparison capabilities. It allows side-by-side testing of OpenAI, Anthropic, DeepSeek, and Perplexity models with real-time performance metrics and 3D visualizations.

## Development Commands

### Essential Commands
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ci          # Run tests in CI mode (coverage + limited workers)
npm run analyze          # Analyze bundle size with webpack analyzer
```

### Deployment Commands
```bash
npm run pre-deploy       # Pre-deployment checks (in scripts/)
npm run deploy           # Deploy to Vercel production
npm run deploy:preview   # Deploy preview to Vercel
npm run post-deploy      # Post-deployment verification (in scripts/)
```

## Architecture Overview

### Multi-Provider AI Integration Pattern

The core architecture uses a **singleton factory pattern** (`ApiService`) to abstract AI provider differences:

```
ApiService (Singleton Factory)
├── OpenAIClient
├── AnthropicClient
├── DeepSeekClient
└── PerplexityClient
```

**Key Integration Points:**
- [lib/api/index.ts](lib/api/index.ts) - `ApiService` singleton factory
- [lib/api/apiClient.ts](lib/api/apiClient.ts) - Base HTTP client with common error handling
- [lib/api/clients/](lib/api/clients/) - Provider-specific client implementations
- [lib/playground/api.ts](lib/playground/api.ts) - `generatePlaygroundResponse()` bridges UI requests to provider clients

**Data Flow:**
```
User Input (Playground)
→ generatePlaygroundResponse()
→ ApiService.getInstance().getClient(provider)
→ Provider Client Methods
→ Response + Metrics
```

### App Router Structure

- **[/app/playground](app/playground/)** - AI testing interface with Monaco editor and real-time streaming
- **[/app/models](app/models/)** - Model catalog with grid view, comparison, recommender, and custom builder
- **[/app/dashboard](app/dashboard/)** - Advanced visualizations dashboard (12+ viz types using D3/Three.js)
- **[/app/analytics](app/analytics/)** - Performance metrics and analytics overview
- **[/app/profile](app/profile/)** - User settings with sub-routes for API keys, usage, preferences

### Core Libraries

| Path | Purpose |
|------|---------|
| **[lib/api/](lib/api/)** | Multi-provider API integration framework |
| **[lib/playground/](lib/playground/)** | Model testing and comparison logic |
| **[lib/cache.ts](lib/cache.ts)** | Response caching with TTL (MemoryCache, LocalStorageCache, dedupRequest, BatchProcessor) |
| **[lib/analytics.ts](lib/analytics.ts)** | Event tracking (page views, feature usage, errors, performance) |
| **[lib/performance.ts](lib/performance.ts)** | Web vitals monitoring, resource timing, FPS tracking |
| **[lib/data.ts](lib/data.ts)** | Static model catalog and configuration data |

### Component Organization (136+ components)

Components follow consistent patterns:
- **Radix UI primitives** in [components/ui/](components/ui/) - styled with Tailwind
- **Framer Motion animations** throughout for page transitions and interactions
- **Dynamic imports** for heavy visualizations (Three.js, D3.js)
- **Custom hooks** in [hooks/](hooks/) for magnetic cursor, parallax, scroll reveal animations

### Testing Architecture

- **Jest + @swc/jest** for fast TypeScript transformation
- **@testing-library/react** for component testing
- **Coverage thresholds:** 80% for branches, functions, lines, statements
- **Path aliases:** `@/components`, `@/lib`, `@/hooks`, `@/app`
- Tests located in `__tests__/` or colocated as `*.test.tsx` files

### Build Configuration

**Bundle Optimization** ([next.config.js](next.config.js)):
- Custom webpack chunk splitting:
  - `framework` chunk: React core libraries
  - `ui` chunk: Radix UI components
  - `viz` chunk: D3, Three.js, react-force-graph-3d
  - `editor` chunk: Monaco editor
  - `commons` chunk: Code used in 2+ places
- Optimized package imports for `@radix-ui/react-icons`, `lucide-react`, `d3`, `framer-motion`
- Bundle analyzer available via `npm run analyze`

**Security headers** configured: X-Frame-Options, CSP for SVGs, XSS protection, DNS prefetch control

## Working with AI Providers

### Adding a New Provider

1. Create client in [lib/api/clients/](lib/api/clients/) extending base `ApiClient`
2. Add types in [lib/api/types/](lib/api/types/)
3. Register in `ApiService` factory ([lib/api/index.ts](lib/api/index.ts))
4. Update `generatePlaygroundResponse()` in [lib/playground/api.ts](lib/playground/api.ts)
5. Add provider to model catalog in [lib/data.ts](lib/data.ts)

### Environment Variables

API keys are optional (demo mode available). See [.env.example](.env.example):
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DEEPSEEK_API_KEY`
- `PERPLEXITY_API_KEY`
- Feature flags: `NEXT_PUBLIC_ENABLE_LIVE_DEMOS`, `NEXT_PUBLIC_ENABLE_ANALYTICS`

Copy `.env.example` to `.env.local` for local development.

## Design System

**Matrix-inspired theme:**
- **Typography:** JetBrains Mono (monospace)
- **Colors:** Green accent colors (`--primary` variants in [app/globals.css](app/globals.css))
- **Animations:** Framer Motion for all interactions
- **Effects:** Glowing borders, parallax scrolling, magnetic cursor

## Key Development Patterns

### Component Animations
All major components use Framer Motion:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
```

### Dynamic Imports for Visualizations
Heavy 3D/visualization components are lazy loaded:
```typescript
const NetworkGraph = dynamic(() => import('@/components/visualizations/network-graph'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})
```

### Caching Strategy
Use `MemoryCache` for short-lived API responses:
```typescript
import { MemoryCache, CacheTTL } from '@/lib/cache'
const cache = new MemoryCache<ResponseType>()
const cached = cache.get(key)
if (!cached) {
  const result = await fetchData()
  cache.set(key, result, CacheTTL.MEDIUM) // 5 minutes
}
```

## Important Notes

- **No backend database:** App uses in-memory storage and static data. All AI calls go directly to provider APIs.
- **Demo mode:** If API keys not configured, app displays mock responses for demo purposes.
- **Path aliases:** Use `@/` prefix for imports (e.g., `@/components/ui/button`)
- **ESLint ignored during builds:** `ignoreDuringBuilds: true` in next.config.js
- **Type safety:** Full TypeScript coverage expected across all new code

## Documentation

Additional docs available in [docs/](docs/):
- [docs/architecture/README.md](docs/architecture/README.md) - Detailed architecture documentation
- [docs/api/](docs/api/) - API documentation
- [docs/guides/](docs/guides/) - Development guides
- [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) - Testing strategy and patterns
