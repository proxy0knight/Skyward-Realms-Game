import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapEditor from '../MapEditor'

// Mock game engine
const mockGameEngine = {
  scene: {
    meshes: [],
    pickWithRay: vi.fn().mockReturnValue({ hit: true, pickedPoint: { y: 0 } })
  },
  updateWorldFromMap: vi.fn()
}

const mockOnMapUpdate = vi.fn()

describe('MapEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders map editor interface', () => {
    render(<MapEditor gameEngine={mockGameEngine} onMapUpdate={mockOnMapUpdate} />)
    
    expect(screen.getByText('Map Editor')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Load')).toBeInTheDocument()
  })

  it('displays terrain controls', async () => {
    const user = userEvent.setup()
    render(<MapEditor gameEngine={mockGameEngine} onMapUpdate={mockOnMapUpdate} />)
    
    // Click terrain tab
    await user.click(screen.getByRole('tab', { name: /terrain/i }))
    
    // Check terrain options are visible
    expect(screen.getByText('Grass')).toBeInTheDocument()
    expect(screen.getByText('Stone')).toBeInTheDocument()
    expect(screen.getByText('Water')).toBeInTheDocument()
  })

  it('displays asset controls', async () => {
    const user = userEvent.setup()
    render(<MapEditor gameEngine={mockGameEngine} onMapUpdate={mockOnMapUpdate} />)
    
    // Click assets tab
    await user.click(screen.getByRole('tab', { name: /assets/i }))
    
    // Assets tab should be active
    expect(screen.getByText('Structures')).toBeInTheDocument()
    expect(screen.getByText('Vegetation')).toBeInTheDocument()
  })

  it('displays spawn area controls', async () => {
    const user = userEvent.setup()
    render(<MapEditor gameEngine={mockGameEngine} onMapUpdate={mockOnMapUpdate} />)
    
    // Click spawn areas tab
    await user.click(screen.getByRole('tab', { name: /spawn areas/i }))
    
    // Spawn areas tab should be active
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('has save functionality', async () => {
    const user = userEvent.setup()
    render(<MapEditor gameEngine={mockGameEngine} onMapUpdate={mockOnMapUpdate} />)
    
    const saveButton = screen.getByText('Save')
    expect(saveButton).toBeInTheDocument()
    
    // Click save (without testing the file download mechanism)
    await user.click(saveButton)
  })

  it('has load functionality', () => {
    render(<MapEditor gameEngine={mockGameEngine} onMapUpdate={mockOnMapUpdate} />)
    
    const loadButton = screen.getByText('Load')
    expect(loadButton).toBeInTheDocument()
  })
})
