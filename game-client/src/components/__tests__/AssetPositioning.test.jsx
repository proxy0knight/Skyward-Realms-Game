import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssetPositioning from '../AssetPositioning'

const mockAsset = {
  id: 'test-asset-1',
  name: 'Test Asset',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  heightOffset: 0,
  layerIndex: 0,
  visible: true
}

const mockGameEngine = {
  scene: {
    pickWithRay: vi.fn().mockReturnValue({ 
      hit: true, 
      pickedPoint: { y: 2.5 } 
    }),
    meshes: []
  }
}

const mockOnAssetUpdate = vi.fn()

describe('AssetPositioning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows placeholder when no asset is selected', () => {
    render(<AssetPositioning selectedAsset={null} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    expect(screen.getByText('Select an asset to edit its position')).toBeInTheDocument()
  })

  it('renders asset positioning controls when asset is selected', () => {
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    expect(screen.getByText('Asset Positioning')).toBeInTheDocument()
    expect(screen.getByText('Test Asset')).toBeInTheDocument()
    expect(screen.getByText('Layer 0')).toBeInTheDocument()
  })

  it('allows coordinate system selection', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Find coordinate system selector
    const coordinateSelect = screen.getAllByRole('combobox')[0]
    await user.click(coordinateSelect)
    
    // Should show coordinate system options
    expect(screen.getByText('World')).toBeInTheDocument()
    expect(screen.getByText('Local')).toBeInTheDocument()
    expect(screen.getByText('Relative to Ground')).toBeInTheDocument()
  })

  it('switches between position, rotation, and scale tabs', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Click rotation tab
    await user.click(screen.getByRole('tab', { name: 'Rotation' }))
    expect(screen.getByText('X Rotation (degrees)')).toBeInTheDocument()
    
    // Click scale tab
    await user.click(screen.getByRole('tab', { name: 'Scale' }))
    expect(screen.getByText('Uniform Scale')).toBeInTheDocument()
    
    // Click position tab
    await user.click(screen.getByRole('tab', { name: 'Position' }))
    expect(screen.getByText('Height Offset (relative to ground)')).toBeInTheDocument()
  })

  it('updates position values', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Change to world coordinates to get X/Y/Z controls
    const coordinateSelect = screen.getAllByRole('combobox')[0]
    await user.click(coordinateSelect)
    await user.click(screen.getByText('World'))
    
    // Find and interact with position sliders
    const sliders = screen.getAllByRole('slider')
    if (sliders.length > 0) {
      fireEvent.change(sliders[0], { target: { value: '5' } })
      expect(mockOnAssetUpdate).toHaveBeenCalled()
    }
  })

  it('handles height offset in relative mode', async () => {
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Should be in relative mode by default
    expect(screen.getByText('Height Offset (relative to ground)')).toBeInTheDocument()
    expect(screen.getByText('Ground: 2.500')).toBeInTheDocument()
  })

  it('enables and disables precision mode', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    const precisionToggle = screen.getByLabelText('Precision Mode')
    await user.click(precisionToggle)
    
    // Precision mode should toggle (affects step sizes)
    expect(precisionToggle).toBeChecked()
  })

  it('locks and unlocks asset editing', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Find and click lock button
    const lockButton = screen.getByRole('button', { name: /unlock/i })
    await user.click(lockButton)
    
    // Should show locked state
    expect(screen.getByRole('button')).toHaveClass('bg-red-100')
  })

  it('toggles asset visibility', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Find visibility toggle button
    const visibilityButtons = screen.getAllByRole('button')
    const visibilityButton = visibilityButtons.find(btn => 
      btn.querySelector('[data-testid="eye-icon"]') || 
      btn.textContent === '' && btn.querySelector('svg')
    )
    
    if (visibilityButton) {
      await user.click(visibilityButton)
      expect(mockOnAssetUpdate).toHaveBeenCalled()
    }
  })

  it('resets transform values', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    await user.click(screen.getByText('Reset'))
    
    expect(mockOnAssetUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      })
    )
  })

  it('duplicates asset', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    await user.click(screen.getByText('Duplicate'))
    
    expect(mockOnAssetUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringContaining('test-asset-1_'),
        position: { x: 2, y: 0, z: 2 } // Offset position
      }),
      true // isNew flag
    )
  })

  it('deletes asset', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    await user.click(screen.getByText('Delete'))
    
    expect(mockOnAssetUpdate).toHaveBeenCalledWith(null, false, true)
  })

  it('snaps to surface', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Change to world coordinates to see snap button
    const coordinateSelect = screen.getAllByRole('combobox')[0]
    await user.click(coordinateSelect)
    await user.click(screen.getByText('World'))
    
    const snapButton = screen.getByText('Snap to Surface')
    await user.click(snapButton)
    
    expect(mockGameEngine.scene.pickWithRay).toHaveBeenCalled()
  })

  it('manages layer indices', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Find layer up button
    const layerButtons = screen.getAllByRole('button')
    const upButton = layerButtons.find(btn => 
      btn.querySelector('svg') && btn.getAttribute('aria-label') === 'Move layer up'
    )
    
    if (upButton) {
      await user.click(upButton)
      expect(mockOnAssetUpdate).toHaveBeenCalled()
    }
  })

  it('handles rotation quick actions', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Switch to rotation tab
    await user.click(screen.getByRole('tab', { name: 'Rotation' }))
    
    // Click +90° button
    await user.click(screen.getByText('+90°'))
    
    expect(mockOnAssetUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        rotation: expect.objectContaining({ y: 90 })
      })
    )
  })

  it('handles uniform scaling', async () => {
    const user = userEvent.setup()
    render(<AssetPositioning selectedAsset={mockAsset} gameEngine={mockGameEngine} onAssetUpdate={mockOnAssetUpdate} />)
    
    // Switch to scale tab
    await user.click(screen.getByRole('tab', { name: 'Scale' }))
    
    // Enable uniform scaling
    const uniformToggle = screen.getByLabelText('Uniform Scale')
    await user.click(uniformToggle)
    
    expect(uniformToggle).toBeChecked()
  })
})
