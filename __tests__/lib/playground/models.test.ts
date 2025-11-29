import { getAvailableModels, type ProviderGroupedModels } from '@/lib/playground/models'
import { ApiService } from '@/lib/api'

// Mock the API service
jest.mock('@/lib/api', () => ({
  ApiService: {
    getInstance: jest.fn()
  }
}))

describe('Playground Models', () => {
  let mockApiService: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockApiService = {
      getOpenAI: jest.fn(),
      getAnthropic: jest.fn(),
      getPerplexity: jest.fn()
    }
    ;(ApiService.getInstance as jest.Mock).mockReturnValue(mockApiService)
  })

  describe('getAvailableModels', () => {
    it('returns demo models when no APIs are configured', async () => {
      // Mock all API clients as undefined
      mockApiService.getOpenAI = undefined
      mockApiService.getAnthropic = undefined
      mockApiService.getPerplexity = undefined

      const models = await getAvailableModels()

      expect(models).toHaveLength(1)
      expect(models[0].provider).toBe('Demo Models')
      expect(models[0].models).toHaveLength(2)
      expect(models[0].models[0].id).toBe('gpt-4-demo')
      expect(models[0].models[1].id).toBe('claude-3-demo')
    })

    it('fetches and formats OpenAI models correctly', async () => {
      const mockOpenAIModels = {
        data: [
          { id: 'gpt-4' },
          { id: 'gpt-3.5-turbo' },
          { id: 'text-davinci-003' }, // Should be filtered out
          { id: 'whisper-1' }, // Should be filtered out
        ]
      }

      mockApiService.getOpenAI.mockReturnValue({
        listModels: jest.fn().mockResolvedValue(mockOpenAIModels)
      })

      const models = await getAvailableModels()

      const openAIGroup = models.find(g => g.provider === 'OpenAI')
      expect(openAIGroup).toBeDefined()
      expect(openAIGroup?.models).toHaveLength(2)
      expect(openAIGroup?.models[0].id).toBe('gpt-4')
      expect(openAIGroup?.models[0].name).toBe('GPT-4')
      expect(openAIGroup?.models[0].capabilities).toContain('Advanced Reasoning')
    })

    it('fetches and formats Anthropic models correctly', async () => {
      const mockAnthropicModels = [
        { name: 'claude-3-opus', description: 'Most powerful model', context_window: 200000 },
        { name: 'claude-3-sonnet', context_window: 200000 }
      ]

      mockApiService.getAnthropic.mockReturnValue({
        listModels: jest.fn().mockResolvedValue(mockAnthropicModels)
      })

      const models = await getAvailableModels()

      const anthropicGroup = models.find(g => g.provider === 'Anthropic')
      expect(anthropicGroup).toBeDefined()
      expect(anthropicGroup?.models).toHaveLength(2)
      expect(anthropicGroup?.models[0].id).toBe('claude-3-opus')
      expect(anthropicGroup?.models[0].name).toBe('Claude 3 Opus')
      expect(anthropicGroup?.models[0].metrics.tokens).toBe('200000')
    })

    it('handles API errors gracefully', async () => {
      mockApiService.getOpenAI.mockReturnValue({
        listModels: jest.fn().mockRejectedValue(new Error('API Error'))
      })

      const models = await getAvailableModels()

      // Should still return demo models on error
      expect(models).toHaveLength(1)
      expect(models[0].provider).toBe('Demo Models')
    })

    it('combines models from multiple providers', async () => {
      // Mock OpenAI
      mockApiService.getOpenAI.mockReturnValue({
        listModels: jest.fn().mockResolvedValue({ data: [{ id: 'gpt-4' }] })
      })

      // Mock Anthropic
      mockApiService.getAnthropic.mockReturnValue({
        listModels: jest.fn().mockResolvedValue([{ name: 'claude-3-opus' }])
      })

      // Mock Perplexity
      mockApiService.getPerplexity.mockReturnValue({
        listModels: jest.fn().mockResolvedValue([{ id: 'sonar-small-online' }])
      })

      const models = await getAvailableModels()

      expect(models).toHaveLength(3)
      expect(models.map(g => g.provider)).toEqual(['OpenAI', 'Anthropic', 'Perplexity'])
    })

    it('assigns correct capabilities based on model type', async () => {
      mockApiService.getOpenAI.mockReturnValue({
        listModels: jest.fn().mockResolvedValue({ 
          data: [
            { id: 'gpt-4-vision' },
            { id: 'gpt-3.5-turbo' }
          ] 
        })
      })

      const models = await getAvailableModels()
      const openAIModels = models.find(g => g.provider === 'OpenAI')?.models || []

      const visionModel = openAIModels.find(m => m.id === 'gpt-4-vision')
      expect(visionModel?.capabilities).toContain('Image Understanding')

      const turboModel = openAIModels.find(m => m.id === 'gpt-3.5-turbo')
      expect(turboModel?.capabilities).not.toContain('Image Understanding')
    })

    it('formats model metadata correctly', async () => {
      mockApiService.getPerplexity.mockReturnValue({
        listModels: jest.fn().mockResolvedValue([
          { id: 'sonar-small-online', name: 'Sonar Small', context_length: 12000 }
        ])
      })

      const models = await getAvailableModels()
      const perplexityModel = models.find(g => g.provider === 'Perplexity')?.models[0]

      expect(perplexityModel).toBeDefined()
      expect(perplexityModel?.name).toBe('Sonar Small')
      expect(perplexityModel?.capabilities).toContain('Web Search')
      expect(perplexityModel?.metrics.latency).toBe('~400ms')
      expect(perplexityModel?.metrics.tokens).toBe('12000')
    })
  })
})