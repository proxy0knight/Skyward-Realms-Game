import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { 
  Map, 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  Upload, 
  Download, 
  Grid, 
  Eye, 
  EyeOff,
  Move3D,
  RotateCw,
  Layers,
  Zap,
  Target,
  Trees,
  Mountain,
  Waves,
  Settings
} from 'lucide-react'

const TERRAIN_TYPES = {
  grass: { name: 'Grass', color: '#4ade80', height: 0 },
  dirt: { name: 'Dirt', color: '#92400e', height: 0.1 },
  stone: { name: 'Stone', color: '#6b7280', height: 0.3 },
  water: { name: 'Water', color: '#3b82f6', height: -0.2 },
  sand: { name: 'Sand', color: '#fde047', height: 0 },
  snow: { name: 'Snow', color: '#f8fafc', height: 0.4 }
}

const ASSET_CATEGORIES = {
  structures: { name: 'Structures', icon: '🏠' },
  vegetation: { name: 'Vegetation', icon: '🌳' },
  props: { name: 'Props', icon: '📦' },
  effects: { name: 'Effects', icon: '✨' },
  characters: { name: 'Characters', icon: '👤' }
}

const MapEditor = ({ gameEngine, onMapUpdate }) => {
  const [selectedTool, setSelectedTool] = useState('terrain')
  const [selectedTerrain, setSelectedTerrain] = useState('grass')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [mapData, setMapData] = useState(null)
  const [gridSize, setGridSize] = useState(32)
  const [cellSize, setCellSize] = useState(10)
  const [showGrid, setShowGrid] = useState(true)
  const [selectedCell, setSelectedCell] = useState(null)
  const [spawnAreas, setSpawnAreas] = useState([])
  const [brushSize, setBrushSize] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const canvasRef = useRef(null)
  const [availableAssets, setAvailableAssets] = useState([])

  // Initialize map data
  useEffect(() => {
    const initMapData = () => {
      const newMapData = {
        name: 'New Map',
        size: gridSize,
        cellSize: cellSize,
        cells: Array(gridSize).fill(null).map((_, x) => 
          Array(gridSize).fill(null).map((_, z) => ({
            x,
            z,
            terrain: 'grass',
            height: 0,
            objects: [],
            flags: {},
            spawnArea: null
          }))
        ),
        spawnPoints: [],
        teleports: []
      }
      setMapData(newMapData)
    }

    if (!mapData) {
      initMapData()
    }
  }, [gridSize, cellSize, mapData])

  // Load available assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // This would typically load from your asset management system
        const mockAssets = [
          { id: 'tree_oak', name: 'Oak Tree', category: 'vegetation', path: '/assets/models/trees/oak.glb' },
          { id: 'rock_01', name: 'Rock Small', category: 'props', path: '/assets/models/rocks/rock_01.glb' },
          { id: 'house_01', name: 'Basic House', category: 'structures', path: '/assets/models/buildings/house_01.glb' },
          { id: 'crystal', name: 'Magic Crystal', category: 'effects', path: '/assets/models/effects/crystal.glb' }
        ]
        setAvailableAssets(mockAssets)
      } catch (error) {
        console.error('Failed to load assets:', error)
      }
    }

    loadAssets()
  }, [])

  // Canvas drawing for map visualization
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !mapData) return

    const ctx = canvas.getContext('2d')
    const { cells } = mapData
    const cellPixelSize = canvas.width / gridSize

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw cells
    cells.forEach((row, x) => {
      row.forEach((cell, z) => {
        const pixelX = x * cellPixelSize
        const pixelZ = z * cellPixelSize

        // Terrain color
        const terrain = TERRAIN_TYPES[cell.terrain]
        ctx.fillStyle = terrain.color
        ctx.fillRect(pixelX, pixelZ, cellPixelSize, cellPixelSize)

        // Height indicator
        if (cell.height !== 0) {
          const alpha = Math.abs(cell.height) * 0.5
          ctx.fillStyle = cell.height > 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`
          ctx.fillRect(pixelX, pixelZ, cellPixelSize, cellPixelSize)
        }

        // Objects indicator
        if (cell.objects.length > 0) {
          ctx.fillStyle = '#ff6b35'
          ctx.beginPath()
          ctx.arc(pixelX + cellPixelSize/2, pixelZ + cellPixelSize/2, 2, 0, Math.PI * 2)
          ctx.fill()
        }

        // Spawn area indicator
        if (cell.spawnArea) {
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2
          ctx.strokeRect(pixelX + 1, pixelZ + 1, cellPixelSize - 2, cellPixelSize - 2)
        }

        // Flags
        if (cell.flags.spawn) {
          ctx.fillStyle = '#00ff00'
          ctx.fillRect(pixelX, pixelZ, 4, 4)
        }
        if (cell.flags.teleport) {
          ctx.fillStyle = '#ff00ff'
          ctx.fillRect(pixelX + cellPixelSize - 4, pixelZ, 4, 4)
        }
      })
    })

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      for (let i = 0; i <= gridSize; i++) {
        const pos = i * cellPixelSize
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, canvas.height)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(0, pos)
        ctx.lineTo(canvas.width, pos)
        ctx.stroke()
      }
    }

    // Highlight selected cell
    if (selectedCell) {
      const pixelX = selectedCell.x * cellPixelSize
      const pixelZ = selectedCell.z * cellPixelSize
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.strokeRect(pixelX, pixelZ, cellPixelSize, cellPixelSize)
    }
  }, [mapData, gridSize, showGrid, selectedCell])

  useEffect(() => {
    drawMap()
  }, [drawMap])

  // Handle canvas click
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current
    if (!canvas || !mapData) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const canvasX = (event.clientX - rect.left) * scaleX
    const canvasY = (event.clientY - rect.top) * scaleY
    
    const x = Math.floor(canvasX / (canvas.width / gridSize))
    const z = Math.floor(canvasY / (canvas.height / gridSize))

    if (x >= 0 && x < gridSize && z >= 0 && z < gridSize) {
      setSelectedCell({ x, z })
      
      // Apply tool
      applyTool(x, z)
    }
  }

  const applyTool = (x, z) => {
    if (!mapData) return

    const newMapData = { ...mapData }
    const cells = newMapData.cells.map(row => [...row])

    for (let dx = -Math.floor(brushSize/2); dx <= Math.floor(brushSize/2); dx++) {
      for (let dz = -Math.floor(brushSize/2); dz <= Math.floor(brushSize/2); dz++) {
        const cellX = x + dx
        const cellZ = z + dz
        
        if (cellX >= 0 && cellX < gridSize && cellZ >= 0 && cellZ < gridSize) {
          const cell = cells[cellX][cellZ]
          
          switch (selectedTool) {
            case 'terrain':
              cell.terrain = selectedTerrain
              cell.height = TERRAIN_TYPES[selectedTerrain].height
              break
              
            case 'height':
              // Height modification would be handled by separate sliders
              break
              
            case 'asset':
              if (selectedAsset && !cell.objects.find(obj => obj.assetId === selectedAsset.id)) {
                cell.objects.push({
                  assetId: selectedAsset.id,
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                  heightOffset: 0
                })
              }
              break
              
            case 'spawn':
              cell.flags.spawn = true
              break
              
            case 'erase':
              cell.objects = []
              cell.flags = {}
              cell.spawnArea = null
              break
          }
        }
      }
    }

    newMapData.cells = cells
    setMapData(newMapData)
    
    // Sync with 3D world
    if (gameEngine && onMapUpdate) {
      onMapUpdate(newMapData)
    }
  }

  const updateCellHeight = (height) => {
    if (!selectedCell || !mapData) return

    const newMapData = { ...mapData }
    newMapData.cells[selectedCell.x][selectedCell.z].height = height
    setMapData(newMapData)
    
    if (gameEngine && onMapUpdate) {
      onMapUpdate(newMapData)
    }
  }

  const createSpawnArea = () => {
    if (!selectedCell) return

    const newSpawnArea = {
      id: Date.now(),
      name: `Spawn Area ${spawnAreas.length + 1}`,
      center: { x: selectedCell.x, z: selectedCell.z },
      size: { width: 5, height: 5 },
      assetId: selectedAsset?.id || null,
      spawnRate: 1.0,
      maxObjects: 10,
      respawnInterval: 30000, // 30 seconds
      active: true
    }

    setSpawnAreas(prev => [...prev, newSpawnArea])
  }

  const saveMap = async () => {
    try {
      const mapJson = JSON.stringify(mapData, null, 2)
      const blob = new Blob([mapJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${mapData.name}.json`
      a.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to save map:', error)
    }
  }

  const loadMap = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const loadedMapData = JSON.parse(text)
      setMapData(loadedMapData)
      setGridSize(loadedMapData.size)
      
      if (gameEngine && onMapUpdate) {
        onMapUpdate(loadedMapData)
      }
    } catch (error) {
      console.error('Failed to load map:', error)
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Map Editor
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={saveMap} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => document.getElementById('map-file-input').click()}>
              <Upload className="w-4 h-4 mr-2" />
              Load
            </Button>
            <input
              id="map-file-input"
              type="file"
              accept=".json"
              onChange={loadMap}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Map Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Grid Size:</Label>
                <Select value={gridSize.toString()} onValueChange={(value) => setGridSize(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                    <SelectItem value="64">64</SelectItem>
                    <SelectItem value="128">128</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                <Label>Show Grid</Label>
              </div>

              <div className="flex items-center gap-2">
                <Label>Brush Size:</Label>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-20"
                />
                <span className="w-8 text-center">{brushSize}</span>
              </div>
            </div>

            <div className="border rounded-lg bg-gray-900 p-2">
              <canvas
                ref={canvasRef}
                width={512}
                height={512}
                className="w-full h-auto cursor-crosshair"
                onClick={handleCanvasClick}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {selectedCell && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Cell ({selectedCell.x}, {selectedCell.z})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Height Offset</Label>
                      <Slider
                        value={[mapData?.cells[selectedCell.x]?.[selectedCell.z]?.height || 0]}
                        onValueChange={(value) => updateCellHeight(value[0])}
                        min={-2}
                        max={2}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Objects: {mapData?.cells[selectedCell.x]?.[selectedCell.z]?.objects.length || 0}</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tools Panel */}
          <div className="space-y-4">
            <Tabs value={selectedTool} onValueChange={setSelectedTool}>
              <TabsList className="grid grid-cols-2 gap-1">
                <TabsTrigger value="terrain" className="text-xs">
                  <Mountain className="w-3 h-3 mr-1" />
                  Terrain
                </TabsTrigger>
                <TabsTrigger value="asset" className="text-xs">
                  <Trees className="w-3 h-3 mr-1" />
                  Assets
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="terrain" className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TERRAIN_TYPES).map(([key, terrain]) => (
                    <Button
                      key={key}
                      variant={selectedTerrain === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTerrain(key)}
                      className="h-12 p-2"
                    >
                      <div 
                        className="w-4 h-4 rounded mr-2" 
                        style={{ backgroundColor: terrain.color }}
                      />
                      <span className="text-xs">{terrain.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="asset" className="space-y-3">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {Object.entries(ASSET_CATEGORIES).map(([category, info]) => (
                      <div key={category}>
                        <Label className="text-xs font-semibold">{info.icon} {info.name}</Label>
                        <div className="grid grid-cols-1 gap-1 mt-1">
                          {availableAssets
                            .filter(asset => asset.category === category)
                            .map(asset => (
                              <Button
                                key={asset.id}
                                variant={selectedAsset?.id === asset.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedAsset(asset)}
                                className="justify-start text-xs h-8"
                              >
                                {asset.name}
                              </Button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Special Tools */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Special Tools</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedTool === 'spawn' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTool('spawn')}
                >
                  <Target className="w-3 h-3 mr-1" />
                  Spawn
                </Button>
                <Button
                  variant={selectedTool === 'erase' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTool('erase')}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Erase
                </Button>
              </div>
            </div>

            {/* Spawn Areas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Spawn Areas</Label>
                <Button size="sm" onClick={createSpawnArea} disabled={!selectedCell}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {spawnAreas.map(area => (
                    <div key={area.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-xs">{area.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => setSpawnAreas(prev => prev.filter(a => a.id !== area.id))}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MapEditor
