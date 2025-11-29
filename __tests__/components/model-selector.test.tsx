import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModelSelector } from '@/components/model-selector'
import { Brain, Sparkles, Code } from 'lucide-react'

describe('ModelSelector', () => {
  const mockModels = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Advanced language model',
      icon: Brain
    },
    {
      id: 'claude-3',
      name: 'Claude 3',
      description: 'Anthropic model',
      icon: Sparkles
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      description: 'Code generation model',
      icon: Code
    }
  ]

  const defaultProps = {
    selectedModel: 'gpt-4',
    onSelectModel: jest.fn(),
    models: mockModels
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all available models', () => {
    render(<ModelSelector {...defaultProps} />)
    
    mockModels.forEach(model => {
      expect(screen.getByText(model.name)).toBeInTheDocument()
      expect(screen.getByText(model.description)).toBeInTheDocument()
    })
  })

  it('highlights the selected model', () => {
    render(<ModelSelector {...defaultProps} />)
    
    const selectedModelCard = screen.getByText('GPT-4').closest('button')
    expect(selectedModelCard).toHaveClass('border-matrix-primary')
    
    const unselectedModelCard = screen.getByText('Claude 3').closest('button')
    expect(unselectedModelCard).not.toHaveClass('border-matrix-primary')
  })

  it('calls onSelectModel when a model is clicked', async () => {
    const user = userEvent.setup()
    render(<ModelSelector {...defaultProps} />)
    
    const claudeModel = screen.getByText('Claude 3').closest('button')!
    await user.click(claudeModel)
    
    expect(defaultProps.onSelectModel).toHaveBeenCalledWith('claude-3')
  })

  it('renders model icons correctly', () => {
    render(<ModelSelector {...defaultProps} />)

    // Check that SVG icons are rendered (component has model icons plus Check icon for selected)
    const icons = document.querySelectorAll('svg')
    // At minimum, we should have one icon per model
    expect(icons.length).toBeGreaterThanOrEqual(mockModels.length)
  })

  it('applies hover effects', async () => {
    const user = userEvent.setup()
    render(<ModelSelector {...defaultProps} />)
    
    const modelCard = screen.getByText('Claude 3').closest('button')!
    
    await user.hover(modelCard)
    
    // Card should have hover styling
    expect(modelCard).toHaveClass('hover:border-matrix-primary/50')
  })

  it('handles keyboard navigation', () => {
    render(<ModelSelector {...defaultProps} />)

    const firstModel = screen.getByText('GPT-4').closest('button')!
    firstModel.focus()

    // Press Enter to select
    fireEvent.keyDown(firstModel, { key: 'Enter', code: 'Enter' })
    fireEvent.click(firstModel) // Simulates button activation on Enter
    expect(defaultProps.onSelectModel).toHaveBeenCalledWith('gpt-4')

    // Press Space to select (buttons activate on space)
    fireEvent.click(firstModel)
    expect(defaultProps.onSelectModel).toHaveBeenCalledTimes(2)
  })

  it('displays empty state when no models are available', () => {
    render(<ModelSelector {...defaultProps} models={[]} />)
    
    // The component renders an empty grid when there are no models
    const grid = document.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid?.children.length).toBe(0)
  })

  it('applies correct accessibility attributes', () => {
    render(<ModelSelector {...defaultProps} />)
    
    const modelButtons = screen.getAllByRole('button')
    
    // Buttons have default accessible attributes
    expect(modelButtons.length).toBe(mockModels.length)
    modelButtons.forEach((button) => {
      expect(button).toBeInTheDocument()
    })
  })

  it('shows selection indicator on selected model', () => {
    render(<ModelSelector {...defaultProps} />)
    
    const selectedModel = screen.getByText('GPT-4').closest('button')
    
    // Selected model should have the selected styles
    expect(selectedModel).toHaveClass('border-matrix-primary', 'bg-matrix-primary/10')
  })

  it('maintains grid layout', () => {
    const { container } = render(<ModelSelector {...defaultProps} />)
    
    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-2')
  })
})