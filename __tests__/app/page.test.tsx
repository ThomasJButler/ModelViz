import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from '@/app/page'
import { useRouter } from 'next/navigation'

// Mock the child components
jest.mock('@/components/loading-animation', () => ({
  LoadingAnimation: ({ isLoading }: { isLoading: boolean }) =>
    isLoading ? <div data-testid="loading-animation">Loading...</div> : null
}))

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
}))

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the landing page with correct initial state', () => {
    render(<LandingPage />)

    // Check for main elements
    expect(screen.getByText('ModelViz')).toBeInTheDocument()
    expect(screen.getByText('Compare Leading AI Models Side by Side')).toBeInTheDocument()
    expect(screen.getByText('Enter Showcase')).toBeInTheDocument()

    // Should not show loading animation initially
    expect(screen.queryByTestId('loading-animation')).not.toBeInTheDocument()
  })

  it('handles enter button click correctly', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<LandingPage />)

    const enterButton = screen.getByText('Enter Showcase')

    // Click the enter button
    await user.click(enterButton)

    // Should show loading animation
    expect(screen.getByTestId('loading-animation')).toBeInTheDocument()

    // Fast-forward timers to trigger navigation (150ms timeout in component)
    jest.advanceTimersByTime(200)

    // Should navigate to dashboard
    expect(mockPush).toHaveBeenCalledWith('/dashboard')

    jest.useRealTimers()
  })

  it('applies hover effect on enter button', async () => {
    const user = userEvent.setup()
    render(<LandingPage />)
    
    const enterButton = screen.getByText('Enter Showcase')
    
    // Test hover state
    await user.hover(enterButton)
    
    // The button should still be present and clickable
    expect(enterButton).toBeInTheDocument()
    expect(enterButton).toHaveClass('hover:bg-matrix-primary')
  })

  it('shows portal animation elements', () => {
    render(<LandingPage />)
    
    // Look for the Brain icon (from lucide-react)
    const brainIcon = document.querySelector('svg')
    expect(brainIcon).toBeInTheDocument()
    
    // Check for animation containers
    const portalContainer = screen.getByText('ModelViz').closest('div')
    expect(portalContainer).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<LandingPage />)
    
    const heading = screen.getByText('ModelViz')
    expect(heading).toHaveClass('text-4xl', 'sm:text-6xl', 'font-bold')
    
    const subtitle = screen.getByText('Compare Leading AI Models Side by Side')
    expect(subtitle).toHaveClass('text-xl', 'sm:text-2xl')
    
    const enterButton = screen.getByText('Enter Showcase')
    expect(enterButton).toHaveClass('px-8', 'py-3', 'text-lg', 'rounded-lg')
  })

  it('maintains accessibility standards', () => {
    render(<LandingPage />)
    
    // Check button is accessible
    const enterButton = screen.getByRole('button', { name: /enter showcase/i })
    expect(enterButton).toBeInTheDocument()
    
    // Check heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('ModelViz')
  })
})