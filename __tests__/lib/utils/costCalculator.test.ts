import {
  calculateCost,
  estimateTokens,
  getModelPricing,
  getAvailableProviders,
  getProviderModels,
  formatCost,
  calculateSavings,
  projectMonthlyCost,
  PRICING_TABLE
} from '@/lib/utils/costCalculator';

describe('Cost Calculator', () => {
  describe('calculateCost', () => {
    describe('OpenAI pricing', () => {
      it('calculates cost for GPT-4 Turbo correctly', () => {
        // GPT-4 Turbo: $0.01/1K input, $0.03/1K output
        const cost = calculateCost('OpenAI', 'gpt-4-turbo', 1000, 500);
        // Expected: (1000/1000 * 0.01) + (500/1000 * 0.03) = 0.01 + 0.015 = 0.025
        expect(cost).toBe(0.025);
      });

      it('calculates cost for GPT-3.5 Turbo correctly', () => {
        // GPT-3.5 Turbo: $0.0005/1K input, $0.0015/1K output
        const cost = calculateCost('OpenAI', 'gpt-3.5-turbo', 2000, 1000);
        // Expected: (2000/1000 * 0.0005) + (1000/1000 * 0.0015) = 0.001 + 0.0015 = 0.0025
        expect(cost).toBe(0.0025);
      });

      it('calculates cost for GPT-4o correctly', () => {
        const cost = calculateCost('OpenAI', 'gpt-4o', 1500, 750);
        // Expected: (1500/1000 * 0.005) + (750/1000 * 0.015) = 0.0075 + 0.01125 = 0.01875
        expect(cost).toBe(0.01875);
      });

      it('calculates cost for o1 correctly', () => {
        const cost = calculateCost('OpenAI', 'o1', 1000, 1000);
        // Expected: (1000/1000 * 0.015) + (1000/1000 * 0.06) = 0.015 + 0.06 = 0.075
        expect(cost).toBe(0.075);
      });
    });

    describe('Anthropic pricing', () => {
      it('calculates cost for Claude 3 Opus correctly', () => {
        // Claude 3 Opus: $0.015/1K input, $0.075/1K output
        const cost = calculateCost('Anthropic', 'claude-3-opus', 1000, 500);
        // Expected: (1000/1000 * 0.015) + (500/1000 * 0.075) = 0.015 + 0.0375 = 0.0525
        expect(cost).toBe(0.0525);
      });

      it('calculates cost for Claude 3 Haiku correctly', () => {
        const cost = calculateCost('Anthropic', 'claude-3-haiku', 2000, 1000);
        // Expected: (2000/1000 * 0.00025) + (1000/1000 * 0.00125) = 0.0005 + 0.00125 = 0.00175
        expect(cost).toBe(0.00175);
      });

      it('calculates cost for Claude 3.5 Sonnet correctly', () => {
        const cost = calculateCost('Anthropic', 'claude-3.5-sonnet', 1500, 750);
        // Expected: (1500/1000 * 0.003) + (750/1000 * 0.015) = 0.0045 + 0.01125 = 0.01575
        expect(cost).toBe(0.01575);
      });
    });

    describe('Google pricing', () => {
      it('calculates cost for Gemini 1.5 Pro correctly', () => {
        const cost = calculateCost('Google', 'gemini-1.5-pro', 1000, 500);
        // Expected: (1000/1000 * 0.0035) + (500/1000 * 0.0105) = 0.0035 + 0.00525 = 0.00875
        expect(cost).toBe(0.00875);
      });

      it('calculates cost for Gemini 1.5 Flash correctly', () => {
        const cost = calculateCost('Google', 'gemini-1.5-flash', 10000, 5000);
        // Expected: (10000/1000 * 0.000075) + (5000/1000 * 0.0003) = 0.00075 + 0.0015 = 0.00225
        expect(cost).toBe(0.00225);
      });
    });

    describe('Other providers', () => {
      it('calculates cost for Perplexity models', () => {
        const cost = calculateCost('Perplexity', 'sonar-medium-chat', 1000, 1000);
        // Expected: (1000/1000 * 0.0006) + (1000/1000 * 0.0006) = 0.0006 + 0.0006 = 0.0012
        expect(cost).toBe(0.0012);
      });

      it('calculates cost for Mistral models', () => {
        const cost = calculateCost('Mistral', 'mistral-large', 1000, 500);
        // Expected: (1000/1000 * 0.004) + (500/1000 * 0.012) = 0.004 + 0.006 = 0.01
        expect(cost).toBe(0.01);
      });

      it('calculates cost for Cohere models', () => {
        const cost = calculateCost('Cohere', 'command-r-plus', 1000, 1000);
        // Expected: (1000/1000 * 0.003) + (1000/1000 * 0.015) = 0.003 + 0.015 = 0.018
        expect(cost).toBe(0.018);
      });
    });

    describe('Case sensitivity', () => {
      it('handles case-insensitive provider names', () => {
        const cost1 = calculateCost('openai', 'gpt-4-turbo', 1000, 500);
        const cost2 = calculateCost('OpenAI', 'gpt-4-turbo', 1000, 500);
        const cost3 = calculateCost('OPENAI', 'gpt-4-turbo', 1000, 500);

        expect(cost1).toBe(cost2);
        expect(cost2).toBe(cost3);
        expect(cost1).toBe(0.025);
      });
    });

    describe('Partial model matching', () => {
      it('finds model by partial match', () => {
        // The function should match 'gpt-4-turbo-preview-0125' to 'gpt-4-turbo-preview'
        const cost = calculateCost('OpenAI', 'gpt-4-turbo-preview-0125', 1000, 500);
        expect(cost).toBeGreaterThan(0);
      });
    });

    describe('Edge cases', () => {
      it('returns 0 for unknown provider', () => {
        const cost = calculateCost('UnknownProvider', 'some-model', 1000, 500);
        expect(cost).toBe(0);
      });

      it('returns 0 for unknown model', () => {
        const cost = calculateCost('OpenAI', 'unknown-model-xyz', 1000, 500);
        expect(cost).toBe(0);
      });

      it('handles zero tokens', () => {
        const cost = calculateCost('OpenAI', 'gpt-4-turbo', 0, 0);
        expect(cost).toBe(0);
      });

      it('handles only input tokens', () => {
        const cost = calculateCost('OpenAI', 'gpt-4-turbo', 1000, 0);
        // Expected: (1000/1000 * 0.01) = 0.01
        expect(cost).toBe(0.01);
      });

      it('handles only output tokens', () => {
        const cost = calculateCost('OpenAI', 'gpt-4-turbo', 0, 1000);
        // Expected: (1000/1000 * 0.03) = 0.03
        expect(cost).toBe(0.03);
      });

      it('rounds to 6 decimal places', () => {
        const cost = calculateCost('OpenAI', 'gpt-4o-mini', 333, 777);
        // Should round to 6 decimal places
        expect(cost.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(6);
      });

      it('handles very large token counts', () => {
        const cost = calculateCost('OpenAI', 'gpt-4-turbo', 100000, 50000);
        // Expected: (100000/1000 * 0.01) + (50000/1000 * 0.03) = 1 + 1.5 = 2.5
        expect(cost).toBe(2.5);
      });
    });
  });

  describe('estimateTokens', () => {
    it('estimates tokens for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('estimates tokens for short text', () => {
      const text = 'Hello, world!'; // 13 characters
      // Expected: Math.ceil(13 / 4) = 4 tokens
      expect(estimateTokens(text)).toBe(4);
    });

    it('estimates tokens for longer text', () => {
      const text = 'This is a longer piece of text that should be estimated to have more tokens.'; // 77 chars
      // Expected: Math.ceil(77 / 4) = 19.25 -> 20 tokens
      const expected = Math.ceil(text.length / 4);
      expect(estimateTokens(text)).toBe(expected);
    });

    it('rounds up partial tokens', () => {
      const text = 'Test'; // 4 characters
      // Expected: Math.ceil(4 / 4) = 1 token
      expect(estimateTokens(text)).toBe(1);

      const text2 = 'Tests'; // 5 characters
      // Expected: Math.ceil(5 / 4) = 2 tokens
      expect(estimateTokens(text2)).toBe(2);
    });

    it('handles multi-line text', () => {
      const text = 'Line 1\nLine 2\nLine 3'; // 20 characters including newlines
      // Expected: Math.ceil(20 / 4) = 5 tokens
      expect(estimateTokens(text)).toBe(5);
    });

    it('handles special characters', () => {
      const text = '!@#$%^&*()_+-={}[]|:";\'<>?,./'; // 30 characters
      // Expected: Math.ceil(30 / 4) = 8 tokens
      expect(estimateTokens(text)).toBe(8);
    });

    it('estimates consistent token count for same length', () => {
      const text1 = 'aaaa';
      const text2 = 'bbbb';
      expect(estimateTokens(text1)).toBe(estimateTokens(text2));
    });
  });

  describe('getModelPricing', () => {
    it('returns pricing for valid provider and model', () => {
      const pricing = getModelPricing('OpenAI', 'gpt-4-turbo');
      expect(pricing).toEqual({ input: 0.01, output: 0.03 });
    });

    it('returns null for invalid provider', () => {
      const pricing = getModelPricing('InvalidProvider', 'gpt-4');
      expect(pricing).toBeNull();
    });

    it('returns null for invalid model', () => {
      const pricing = getModelPricing('OpenAI', 'invalid-model');
      expect(pricing).toBeNull();
    });

    it('handles case-insensitive provider names', () => {
      const pricing1 = getModelPricing('openai', 'gpt-4-turbo');
      const pricing2 = getModelPricing('OpenAI', 'gpt-4-turbo');
      expect(pricing1).toEqual(pricing2);
    });

    it('returns correct pricing for all providers', () => {
      const providers = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Cohere', 'Perplexity'];
      providers.forEach(provider => {
        const models = getProviderModels(provider);
        if (models.length > 0) {
          const pricing = getModelPricing(provider, models[0]);
          expect(pricing).not.toBeNull();
          expect(pricing?.input).toBeGreaterThanOrEqual(0);
          expect(pricing?.output).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('getAvailableProviders', () => {
    it('returns all providers', () => {
      const providers = getAvailableProviders();
      expect(providers).toContain('OpenAI');
      expect(providers).toContain('Anthropic');
      expect(providers).toContain('Google');
      expect(providers).toContain('Mistral');
      expect(providers).toContain('Cohere');
      expect(providers).toContain('Perplexity');
    });

    it('returns correct number of providers', () => {
      const providers = getAvailableProviders();
      expect(providers.length).toBe(6);
    });

    it('returns providers in consistent order', () => {
      const providers1 = getAvailableProviders();
      const providers2 = getAvailableProviders();
      expect(providers1).toEqual(providers2);
    });
  });

  describe('getProviderModels', () => {
    it('returns models for OpenAI', () => {
      const models = getProviderModels('OpenAI');
      expect(models).toContain('gpt-4-turbo');
      expect(models).toContain('gpt-3.5-turbo');
      expect(models).toContain('gpt-4o');
      expect(models.length).toBeGreaterThan(0);
    });

    it('returns models for Anthropic', () => {
      const models = getProviderModels('Anthropic');
      expect(models).toContain('claude-3-opus');
      expect(models).toContain('claude-3-sonnet');
      expect(models).toContain('claude-3-haiku');
      expect(models.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown provider', () => {
      const models = getProviderModels('UnknownProvider');
      expect(models).toEqual([]);
    });

    it('handles case-insensitive provider names', () => {
      const models1 = getProviderModels('openai');
      const models2 = getProviderModels('OpenAI');
      expect(models1).toEqual(models2);
    });

    it('returns all models for each provider', () => {
      const providers = getAvailableProviders();
      providers.forEach(provider => {
        const models = getProviderModels(provider);
        expect(models.length).toBeGreaterThan(0);

        // Verify each model has pricing
        models.forEach(model => {
          const pricing = getModelPricing(provider, model);
          expect(pricing).not.toBeNull();
        });
      });
    });
  });

  describe('formatCost', () => {
    it('formats zero cost', () => {
      expect(formatCost(0)).toBe('$0.00');
    });

    it('formats very small costs', () => {
      expect(formatCost(0.0000001)).toBe('<$0.000001');
      expect(formatCost(0.0000005)).toBe('<$0.000001');
    });

    it('formats small costs with 6 decimals', () => {
      expect(formatCost(0.000123)).toBe('$0.000123');
      expect(formatCost(0.0056789)).toBe('$0.005679'); // Rounded to 6 decimals
    });

    it('formats regular costs with 4 decimals', () => {
      expect(formatCost(0.0123)).toBe('$0.0123');
      expect(formatCost(0.5678)).toBe('$0.5678');
      expect(formatCost(1.2345)).toBe('$1.2345');
    });

    it('formats large costs with 4 decimals', () => {
      expect(formatCost(10.5)).toBe('$10.5000');
      expect(formatCost(123.456)).toBe('$123.4560');
    });

    it('handles boundary cases', () => {
      expect(formatCost(0.000001)).toBe('$0.000001');
      expect(formatCost(0.01)).toBe('$0.0100');
      expect(formatCost(0.009999)).toBe('$0.009999');
    });
  });

  describe('calculateSavings', () => {
    it('calculates positive savings when A is cheaper', () => {
      const savings = calculateSavings(0.01, 0.02);
      // Expected: ((0.02 - 0.01) / 0.02) * 100 = 50%
      expect(savings).toBe(50);
    });

    it('calculates negative savings when B is cheaper', () => {
      const savings = calculateSavings(0.02, 0.01);
      // Expected: ((0.01 - 0.02) / 0.01) * 100 = -100%
      expect(savings).toBe(-100);
    });

    it('returns 0 for equal costs', () => {
      const savings = calculateSavings(0.05, 0.05);
      expect(savings).toBe(0);
    });

    it('returns 0 when costB is 0', () => {
      const savings = calculateSavings(0.01, 0);
      expect(savings).toBe(0);
    });

    it('handles very small differences', () => {
      const savings = calculateSavings(0.001, 0.002);
      expect(savings).toBe(50);
    });

    it('handles large cost differences', () => {
      const savings = calculateSavings(1, 10);
      // Expected: ((10 - 1) / 10) * 100 = 90%
      expect(savings).toBe(90);
    });

    it('calculates 100% savings when costA is 0', () => {
      const savings = calculateSavings(0, 0.01);
      // Expected: ((0.01 - 0) / 0.01) * 100 = 100%
      expect(savings).toBe(100);
    });
  });

  describe('projectMonthlyCost', () => {
    it('projects monthly cost from daily average', () => {
      const monthly = projectMonthlyCost(10, 10);
      // Expected: (10 / 10) * 30 = 30
      expect(monthly).toBe(30);
    });

    it('handles single day projection', () => {
      const monthly = projectMonthlyCost(5, 1);
      // Expected: (5 / 1) * 30 = 150
      expect(monthly).toBe(150);
    });

    it('handles partial month projection', () => {
      const monthly = projectMonthlyCost(15, 5);
      // Expected: (15 / 5) * 30 = 90
      expect(monthly).toBe(90);
    });

    it('returns 0 when daysElapsed is 0', () => {
      const monthly = projectMonthlyCost(100, 0);
      expect(monthly).toBe(0);
    });

    it('handles full month data', () => {
      const monthly = projectMonthlyCost(300, 30);
      // Expected: (300 / 30) * 30 = 300
      expect(monthly).toBe(300);
    });

    it('handles very small daily costs', () => {
      const monthly = projectMonthlyCost(0.01, 1);
      // Expected: (0.01 / 1) * 30 = 0.3
      expect(monthly).toBe(0.3);
    });

    it('handles large cost projections', () => {
      const monthly = projectMonthlyCost(1000, 7);
      // Expected: (1000 / 7) * 30 ≈ 4285.71
      expect(monthly).toBeCloseTo(4285.71, 2);
    });
  });

  describe('PRICING_TABLE', () => {
    it('exports pricing table', () => {
      expect(PRICING_TABLE).toBeDefined();
      expect(typeof PRICING_TABLE).toBe('object');
    });

    it('has correct structure for all providers', () => {
      const providers = Object.keys(PRICING_TABLE);

      providers.forEach(provider => {
        const models = PRICING_TABLE[provider];
        expect(typeof models).toBe('object');

        Object.keys(models).forEach(model => {
          const pricing = models[model];
          expect(pricing).toHaveProperty('input');
          expect(pricing).toHaveProperty('output');
          expect(typeof pricing.input).toBe('number');
          expect(typeof pricing.output).toBe('number');
          expect(pricing.input).toBeGreaterThanOrEqual(0);
          expect(pricing.output).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('has sensible pricing values', () => {
      const allPricing = Object.values(PRICING_TABLE).flatMap(provider =>
        Object.values(provider)
      );

      allPricing.forEach(pricing => {
        // Input pricing should be reasonable (between $0 and $1 per 1K tokens)
        expect(pricing.input).toBeLessThan(1);
        expect(pricing.input).toBeGreaterThanOrEqual(0);

        // Output pricing should be reasonable
        expect(pricing.output).toBeLessThan(1);
        expect(pricing.output).toBeGreaterThanOrEqual(0);

        // Output is typically more expensive than input
        // (though not always, so we just check they're both non-negative)
      });
    });
  });

  describe('Integration tests', () => {
    it('calculates realistic API call costs', () => {
      // Simulate a typical chat completion
      const promptTokens = 150;
      const completionTokens = 300;

      const gpt4Cost = calculateCost('OpenAI', 'gpt-4-turbo', promptTokens, completionTokens);
      const gpt35Cost = calculateCost('OpenAI', 'gpt-3.5-turbo', promptTokens, completionTokens);
      const claudeOpusCost = calculateCost('Anthropic', 'claude-3-opus', promptTokens, completionTokens);
      const claudeHaikuCost = calculateCost('Anthropic', 'claude-3-haiku', promptTokens, completionTokens);

      // GPT-4 should be more expensive than GPT-3.5
      expect(gpt4Cost).toBeGreaterThan(gpt35Cost);

      // Claude Opus should be more expensive than Claude Haiku
      expect(claudeOpusCost).toBeGreaterThan(claudeHaikuCost);

      // All costs should be reasonable
      expect(gpt4Cost).toBeLessThan(1);
      expect(gpt35Cost).toBeLessThan(0.1);
    });

    it('calculates monthly projections from realistic usage', () => {
      // Simulate 1 week of usage
      const dailyCosts = [1.50, 2.00, 1.75, 2.25, 1.80, 0.50, 0.75];
      const totalCost = dailyCosts.reduce((sum, cost) => sum + cost, 0);
      const daysElapsed = dailyCosts.length;

      const projected = projectMonthlyCost(totalCost, daysElapsed);

      // Should be reasonable (not negative, not absurdly high)
      expect(projected).toBeGreaterThan(0);
      expect(projected).toBeLessThan(1000);
    });

    it('compares model costs and calculates savings', () => {
      const promptTokens = 1000;
      const completionTokens = 1000;

      const expensiveModel = calculateCost('OpenAI', 'gpt-4', promptTokens, completionTokens);
      const cheaperModel = calculateCost('OpenAI', 'gpt-3.5-turbo', promptTokens, completionTokens);

      const savings = calculateSavings(cheaperModel, expensiveModel);

      // GPT-3.5 should save significant cost vs GPT-4
      expect(savings).toBeGreaterThan(80); // At least 80% savings

      const formatted = formatCost(expensiveModel - cheaperModel);
      expect(formatted).toMatch(/^\$/);
    });
  });
});
