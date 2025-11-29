// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock IDBKeyRange for IndexedDB tests
global.IDBKeyRange = {
  bound: jest.fn((lower, upper) => ({ lower, upper, type: 'bound' })),
  upperBound: jest.fn((upper) => ({ upper, type: 'upperBound' })),
  lowerBound: jest.fn((lower) => ({ lower, type: 'lowerBound' })),
  only: jest.fn((value) => ({ value, type: 'only' })),
}

// Mock PointerEvent for Framer Motion tests
class MockPointerEvent extends Event {
  constructor(type, props) {
    super(type, props)
    this.pointerId = props?.pointerId || 0
    this.pointerType = props?.pointerType || 'mouse'
    this.clientX = props?.clientX || 0
    this.clientY = props?.clientY || 0
    this.button = props?.button || 0
    this.buttons = props?.buttons || 0
    this.ctrlKey = props?.ctrlKey || false
    this.shiftKey = props?.shiftKey || false
    this.altKey = props?.altKey || false
    this.metaKey = props?.metaKey || false
  }
}
global.PointerEvent = MockPointerEvent

// Suppress console errors in tests unless explicitly testing error scenarios
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})