# ModelViz v2.0 Improvements Plan

## Playground

- [x] Remove model compare section (deleted `app/compare/`)
- [x] Improve layout - use dropdown selectors for models
- [x] Remove effects toggle from playground
- [ ] Add batch test feature (test all APIs at once, gallery view for responses)
- [x] Fix OpenAI model list - remove dated variants, keep only working models

### Working Models to Keep

**OpenAI:**
- [x] GPT-3.5 Turbo
- [x] GPT-4o
- [x] GPT-4o Mini
- [ ] Add: o3, o4-mini (when available)

**Removed from OpenAI:**
- [x] GPT-3.5 Turbo-1106
- [x] GPT-3.5 Turbo-0125
- [x] GPT-4o-2024-05-13
- [x] GPT-4o Mini-2024-07-18
- [x] GPT-4o-2024-08-06
- [x] GPT-4o-2024-11-20

**Anthropic:**
- [x] Claude 4.5 Sonnet - works
- [x] Claude 3.5 Sonnet - works
- [x] Claude 3.5 Haiku - works
- [x] Remove Opus 4.5 (doesn't work)

**Google:**
- [x] Gemini 2.0 Flash - keep (only working model)
- [x] Remove all other Google models

**Perplexity:**
- [x] Sonar - works
- [x] Sonar Pro - works
- [x] Sonar Pro Reasoning - works

---

## Dashboard

- [x] Remove "ModelViz API Analytics" text from sidebar
- [x] Sidebar closed by default
- [x] Add time range filter to Request History (1h, 3h, all time)
- [x] Add Model Output Stats tab (words, tokens, efficiency)
- [x] Remove effects toggle
- [ ] Remove tagline "The magnum opus of API visualization and analytics"
- [ ] Fix tabs not changing color when clicked
- [ ] Improve real-time monitor visually
- [ ] Improve API Response Times visualization in performance tab
- [ ] Improve cost analysis charts
- [ ] Fix Google showing -0.1% in cost tracking
- [ ] Fix Cost Distribution by Provider chart (shows nothing)
- [ ] Move Request Timeline to overview tab (1 hour default)

### Tabs Removed
- [x] 3D Network Visualization
- [x] AI Insights
- [x] Rate Limits
- [x] Error Analysis

---

## Navigation

- [x] Order: About, Dashboard, Playground, Docs, Settings
- [x] "Enter Showcase" goes to About page
- [x] Full screen navbar with symmetrical margins

---

## Documentation

- [x] Security-first messaging
- [x] No account required emphasis
- [x] No payments required
- [x] 100% client-side storage
- [x] API key setup guide for each provider
- [ ] Add api.json file setup guide for easy testing

---

## Known Errors (from testing)

These errors occurred with the compare page (now removed):
- [x] "Unknown provider" errors - fixed by removing compare page
- [ ] Anthropic API errors - may need better error handling
- [ ] Google API errors - may need better error handling
