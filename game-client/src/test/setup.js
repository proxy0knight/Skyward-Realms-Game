import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Babylon.js for testing
globalThis.BABYLON = {
  Engine: class MockEngine {
    constructor() {}
    dispose() {}
  },
  Scene: class MockScene {
    constructor() {}
    dispose() {}
  },
  Vector3: class MockVector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x
      this.y = y
      this.z = z
    }
  },
  Color3: class MockColor3 {
    constructor(r = 0, g = 0, b = 0) {
      this.r = r
      this.g = g
      this.b = b
    }
  },
  Ray: class MockRay {
    constructor(origin, direction) {
      this.origin = origin
      this.direction = direction
    }
  }
}

// Mock Canvas for Babylon.js with proper 2D context
const mockContext2D = {
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  rect: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  fillText: vi.fn(),
  strokeText: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  canvas: {
    width: 512,
    height: 512
  }
}

// Remove duplicate getContext definition since we have it below

// Mock getBoundingClientRect
globalThis.HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  left: 0,
  top: 0,
  width: 512,
  height: 512,
  right: 512,
  bottom: 512,
  x: 0,
  y: 0
}))

// Mock WebGL context
const mockWebGLContext = {
  getExtension: vi.fn((name) => {
    if (name === 'WEBGL_debug_renderer_info') {
      return {
        UNMASKED_RENDERER_WEBGL: 'Mock GPU',
        UNMASKED_VENDOR_WEBGL: 'Mock Vendor'
      }
    }
    return null
  }),
  getParameter: vi.fn((param) => {
    if (param === 'Mock GPU') return 'Test GPU'
    if (param === 'Mock Vendor') return 'Test Vendor'
    return null
  })
}

globalThis.WebGLRenderingContext = class MockWebGLRenderingContext {}
globalThis.WebGL2RenderingContext = class MockWebGL2RenderingContext {}

// Enhanced Canvas mock with WebGL support
globalThis.HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === '2d') {
    return mockContext2D
  }
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return mockWebGLContext
  }
  return null
})

// Mock URL.createObjectURL and revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
globalThis.URL.revokeObjectURL = vi.fn()

// Mock File constructor
globalThis.File = class MockFile {
  constructor(content, filename, options = {}) {
    this.content = content
    this.name = filename
    this.type = options.type || ''
    this.size = content.length || 0
  }
  
  text() {
    return Promise.resolve(this.content)
  }
}

// Mock document.createElement for anchor elements
const originalCreateElement = document.createElement.bind(document)
document.createElement = vi.fn((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: vi.fn(),
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  }
  return originalCreateElement(tagName)
})

// Mock pointer capture functions for Radix UI
globalThis.Element.prototype.hasPointerCapture = vi.fn(() => false)
globalThis.Element.prototype.setPointerCapture = vi.fn()
globalThis.Element.prototype.releasePointerCapture = vi.fn()

// Mock HTMLElement scrollIntoView
globalThis.HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock window.navigator
Object.defineProperty(globalThis.navigator, 'hardwareConcurrency', {
  writable: true,
  value: 4
})

Object.defineProperty(globalThis.navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Test Environment) AppleWebKit/537.36'
})

// Mock performance.memory
Object.defineProperty(globalThis.performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 10000000,
    totalJSHeapSize: 50000000
  }
})
