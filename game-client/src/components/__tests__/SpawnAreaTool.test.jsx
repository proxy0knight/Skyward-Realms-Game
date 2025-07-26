import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SpawnAreaTool from '../SpawnAreaTool'

// Mock game engine
const mockGameEngine = {
  scene: {
    meshes: [],
    pickWithRay: vi.fn().mockReturnValue({ hit: true, pickedPoint: { x: 0, y: 0, z: 0 } })
  },
  createSpawnArea: vi.fn(),
  deleteSpawnArea: vi.fn(),
  forceSpawn: vi.fn(),
  clearSpawnedObjects: vi.fn()
}

const mockOnSpawnAreaUpdate = vi.fn()

describe('SpawnAreaTool', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders spawn area tool interface', () => {
    render(
      <SpawnAreaTool 
        gameEngine={mockGameEngine} 
        onSpawnAreaUpdate={mockOnSpawnAreaUpdate} 
      />
    )
    
    expect(screen.getByText('Spawn Area Tool')).toBeInTheDocument()
  })

  it('renders spawn areas section', () => {
    render(
      <SpawnAreaTool 
        gameEngine={mockGameEngine} 
        onSpawnAreaUpdate={mockOnSpawnAreaUpdate} 
      />
    )
    
    expect(screen.getByText('Spawn Areas')).toBeInTheDocument()
  })

  it('shows active status', () => {
    render(
      <SpawnAreaTool 
        gameEngine={mockGameEngine} 
        onSpawnAreaUpdate={mockOnSpawnAreaUpdate} 
      />
    )
    
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows object count', () => {
    render(
      <SpawnAreaTool 
        gameEngine={mockGameEngine} 
        onSpawnAreaUpdate={mockOnSpawnAreaUpdate} 
      />
    )
    
    expect(screen.getByText(/Objects/)).toBeInTheDocument()
  })

  it('has control buttons', () => {
    render(
      <SpawnAreaTool 
        gameEngine={mockGameEngine} 
        onSpawnAreaUpdate={mockOnSpawnAreaUpdate} 
      />
    )
    
    // Should have plus button for adding
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
