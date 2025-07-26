import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import WorldAssetsManager from '../WorldAssetsManager'

const mockGameEngine = {
  engine: {
    getFps: vi.fn(() => 60)
  },
  scene: {
    getActiveMeshes: vi.fn(() => []),
    textures: []
  }
}

const mockPlayer = {
  position: { x: 0, y: 0, z: 0 }
}

describe('WorldAssetsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders world assets manager interface', () => {
    render(<WorldAssetsManager gameEngine={mockGameEngine} player={mockPlayer} />)
    
    expect(screen.getByText('World Assets Manager')).toBeInTheDocument()
    expect(screen.getByText('60 FPS')).toBeInTheDocument()
  })

  it('displays performance stats', () => {
    render(<WorldAssetsManager gameEngine={mockGameEngine} player={mockPlayer} />)
    
    // Performance indicators should be visible
    expect(screen.getByText('60 FPS')).toBeInTheDocument()
    expect(screen.getByText(/MB/)).toBeInTheDocument()
  })

  it('shows tab navigation', () => {
    render(<WorldAssetsManager gameEngine={mockGameEngine} player={mockPlayer} />)
    
    // Check for tab buttons
    expect(screen.getByRole('tab', { name: /map editor/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /asset positioning/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /spawn areas/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /performance/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /quality/i })).toBeInTheDocument()
  })

  it('has save world functionality', () => {
    render(<WorldAssetsManager gameEngine={mockGameEngine} player={mockPlayer} />)
    
    expect(screen.getByText('Save World')).toBeInTheDocument()
  })

  it('handles missing game engine gracefully', () => {
    render(<WorldAssetsManager gameEngine={null} player={mockPlayer} />)
    
    // Should still render basic interface
    expect(screen.getByText('World Assets Manager')).toBeInTheDocument()
  })

  it('handles missing player gracefully', () => {
    render(<WorldAssetsManager gameEngine={mockGameEngine} player={null} />)
    
    // Should still render basic interface
    expect(screen.getByText('World Assets Manager')).toBeInTheDocument()
  })
})
