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
  const [selectedTerrain, setSelectedTerrain] = useState('grass')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedSpawnAsset, setSelectedSpawnAsset] = useState(null)
  const [selectedTool, setSelectedTool] = useState('terrain')
  const [mapData, setMapData] = useState(null)
  const [savedMaps, setSavedMaps] = useState([])
  const [currentMapId, setCurrentMapId] = useState(null)
  const [gridSize, setGridSize] = useState(32)
  const [cellSize, setCellSize] = useState(10)
  const [showGrid, setShowGrid] = useState(true)
  const [selectedCell, setSelectedCell] = useState(null)
  const [spawnAreas, setSpawnAreas] = useState([])
  const [brushSize, setBrushSize] = useState(1)
  const [assetHeight, setAssetHeight] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showCreateMapDialog, setShowCreateMapDialog] = useState(false)
  const [newMapName, setNewMapName] = useState('')
  const [newMapSize, setNewMapSize] = useState(32)
  const canvasRef = useRef(null)
  const [teleportAreas, setTeleportAreas] = useState([])
  const [selectedTeleportTarget, setSelectedTeleportTarget] = useState('')
  const [startingMapId, setStartingMapId] = useState(null)
  const [availableAssets, setAvailableAssets] = useState([])

  // Load saved maps from localStorage
  useEffect(() => {
    const loadSavedMaps = () => {
      try {
        const maps = JSON.parse(localStorage.getItem('savedMaps') || '[]')
        setSavedMaps(maps)
        const startingMap = localStorage.getItem('startingMapId')
        setStartingMapId(startingMap)
        if (maps.length > 0 && !currentMapId) {
          setCurrentMapId(startingMap || maps[0].id)
        }
      } catch (error) {
        console.error('Failed to load saved maps:', error)
      }
    }
    loadSavedMaps()
  }, [])

  // Load available assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // This would typically load from your asset management system
        const mockAssets = [
          { id: 'tree_oak', name: 'Oak Tree', category: 'vegetation', path: '/assets/models/trees/oak.glb', height: 2.5 },
          { id: 'tree_pine', name: 'Pine Tree', category: 'vegetation', path: '/assets/models/trees/pine.glb', height: 3.0 },
          { id: 'rock_01', name: 'Rock Small', category: 'props', path: '/assets/models/rocks/rock_01.glb', height: 0.5 },
          { id: 'rock_02', name: 'Rock Large', category: 'props', path: '/assets/models/rocks/rock_02.glb', height: 1.2 },
          { id: 'house_01', name: 'Basic House', category: 'structures', path: '/assets/models/buildings/house_01.glb', height: 4.0 },
          { id: 'tower_01', name: 'Watch Tower', category: 'structures', path: '/assets/models/buildings/tower_01.glb', height: 8.0 },
          { id: 'crystal', name: 'Magic Crystal', category: 'effects', path: '/assets/models/effects/crystal.glb', height: 1.0 },
          { id: 'portal', name: 'Portal', category: 'effects', path: '/assets/models/effects/portal.glb', height: 2.0 },
          { id: 'warrior', name: 'Warrior', category: 'characters', path: '/assets/models/characters/warrior.glb', height: 1.8 },
          { id: 'mage', name: 'Mage', category: 'characters', path: '/assets/models/characters/mage.glb', height: 1.7 }
        ]
        setAvailableAssets(mockAssets)
      } catch (error) {
        console.error('Failed to load assets:', error)
      }
    }

    loadAssets()
  }, [])

  // Set starting map
  const setAsStartingMap = (mapId) => {
    if (mapId) {
      localStorage.setItem('startingMapId', mapId)
      setStartingMapId(mapId)
      console.log(`Map ${mapId} set as starting map`)
    }
  }

  // Initialize map data
  useEffect(() => {
    const initMapData = () => {
      const newMapData = {
        id: currentMapId || `map_${Date.now()}`,
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
        teleports: [],
        createdAt: Date.now()
      }
      setMapData(newMapData)
    }

    if (!mapData || (currentMapId && mapData.id !== currentMapId)) {
      if (currentMapId) {
        loadMapById(currentMapId)
      } else {
        initMapData()
      }
    }
  }, [gridSize, cellSize, currentMapId])

  // Create new map
  const createNewMap = () => {
    if (!newMapName.trim()) return

    const mapId = `map_${Date.now()}`
    const newMap = {
      id: mapId,
      name: newMapName,
      size: newMapSize,
      cellSize: 10,
      cells: Array(newMapSize).fill(null).map((_, x) => 
        Array(newMapSize).fill(null).map((_, z) => ({
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
      teleports: [],
      createdAt: Date.now()
    }

    // Save to localStorage
    const updatedMaps = [...savedMaps, { id: mapId, name: newMapName, size: newMapSize }]
    setSavedMaps(updatedMaps)
    localStorage.setItem('savedMaps', JSON.stringify(updatedMaps))
    localStorage.setItem(`map_${mapId}`, JSON.stringify(newMap))

    setCurrentMapId(mapId)
    setMapData(newMap)
    setGridSize(newMapSize)
    setShowCreateMapDialog(false)
    setNewMapName('')
    setNewMapSize(32)
  }

  // Load map by ID
  const loadMapById = (mapId) => {
    try {
      const mapJson = localStorage.getItem(`map_${mapId}`)
      if (mapJson) {
        const loadedMap = JSON.parse(mapJson)
        setMapData(loadedMap)
        setGridSize(loadedMap.size)
        setCurrentMapId(mapId)

        if (gameEngine && onMapUpdate) {
          onMapUpdate(loadedMap)
        }
      }
    } catch (error) {
      console.error('Failed to load map:', error)
    }
  }

  // Save current map
  const saveCurrentMap = () => {
    if (!mapData) return

    try {
      localStorage.setItem(`map_${mapData.id}`, JSON.stringify(mapData))
      console.log(`Map ${mapData.name} saved successfully!`)
    } catch (error) {
      console.error('Failed to save map:', error)
    }
  }

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
                  name: selectedAsset.name,
                  position: { x: 0, y: assetHeight, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                  heightOffset: assetHeight
                })
              }
              break

            case 'spawn':
              cell.flags.spawn = true
              break

            case 'teleport':
              if (selectedTeleportTarget) {
                cell.flags.teleport = {
                  toMapId: selectedTeleportTarget,
                  teleportId: `teleport_${Date.now()}`
                }
              }
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
      assetId: selectedSpawnAsset?.id || null,
      assetName: selectedSpawnAsset?.name || 'No Asset',
      spawnRate: 1.0,
      maxObjects: 10,
      respawnInterval: 30000, // 30 seconds
      active: true
    }

    setSpawnAreas(prev => [...prev, newSpawnArea])

    // Mark cells as spawn area
    const newMapData = { ...mapData }
    const cells = newMapData.cells.map(row => [...row])

    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const cellX = selectedCell.x + dx
        const cellZ = selectedCell.z + dz

        if (cellX >= 0 && cellX < gridSize && cellZ >= 0 && cellZ < gridSize) {
          cells[cellX][cellZ].spawnArea = newSpawnArea.id
        }
      }
    }

    newMapData.cells = cells
    setMapData(newMapData)
  }

  const createTeleportArea = () => {
    if (!selectedCell || !selectedTeleportTarget) return

    const teleportId = `teleport_${Date.now()}`
    const newTeleportArea = {
      id: teleportId,
      name: `Portal to ${savedMaps.find(m => m.id === selectedTeleportTarget)?.name || 'Unknown'}`,
      position: { x: selectedCell.x, z: selectedCell.z },
      targetMapId: selectedTeleportTarget,
      size: { width: 3, height: 3 },
      active: true
    }

    setTeleportAreas(prev => [...prev, newTeleportArea])

    // Mark cells as teleport area
    const newMapData = { ...mapData }
    const cells = newMapData.cells.map(row => [...row])

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const cellX = selectedCell.x + dx
        const cellZ = selectedCell.z + dz

        if (cellX >= 0 && cellX < gridSize && cellZ >= 0 && cellZ < gridSize) {
          cells[cellX][cellZ].flags.teleport = {
            toMapId: selectedTeleportTarget,
            teleportId: teleportId
          }
        }
      }
    }

    newMapData.cells = cells
    setMapData(newMapData)

    if (gameEngine && onMapUpdate) {
      onMapUpdate(newMapData)
    }
  }

  const saveMap = async () => {
    saveCurrentMap()
  }

  const exportMap = async () => {
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
      console.error('Failed to export map:', error)
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
            {/* Map Selection */}
            <Select value={currentMapId || ''} onValueChange={setCurrentMapId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Map" />
              </SelectTrigger>
              <SelectContent>
                {savedMaps.map(map => (
                  <SelectItem key={map.id} value={map.id}>
                    {map.name} ({map.size}x{map.size})
                    {startingMapId === map.id && ' ⭐'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" onClick={() => setShowCreateMapDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Map
            </Button>

            <Button size="sm" variant="outline" onClick={() => setAsStartingMap(currentMapId)}>
              <Target className="w-4 h-4 mr-2" />
              Set as Starting Map
            </Button>

            <Button onClick={saveMap} size="sm" variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={exportMap}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={() => document.getElementById('map-file-input').click()}>
              <Upload className="w-4 h-4 mr-2" />
              Import
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

        {/* Create Map Dialog */}
        {showCreateMapDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Create New Map</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Map Name</Label>
                  <Input 
                    value={newMapName}
                    onChange={(e) => setNewMapName(e.target.value)}
                    placeholder="Enter map name"
                  />
                </div>
                <div>
                  <Label>Map Size</Label>
                  <Select value={newMapSize.toString()} onValueChange={(value) => setNewMapSize(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16x16</SelectItem>
                      <SelectItem value="32">32x32</SelectItem>
                      <SelectItem value="64">64x64</SelectItem>
                      <SelectItem value="128">128x128</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreateMapDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNewMap} disabled={!newMapName.trim()}>
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
              <TabsList className="grid grid-cols-4 gap-1">
                <TabsTrigger value="terrain" className="text-xs">
                  <Mountain className="w-3 h-3 mr-1" />
                  Terrain
                </TabsTrigger>
                <TabsTrigger value="asset" className="text-xs">
                  <Trees className="w-3 h-3 mr-1" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="spawn" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Spawn
                </TabsTrigger>
                <TabsTrigger value="teleport" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Portal
                </TabsTrigger>
              </TabsList>

              <TabsContent value="terrain" className="space-y-3">
                <div>
                  <Label className="text-xs">Terrain Type</Label>
                  <Select value={selectedTerrain} onValueChange={setSelectedTerrain}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TERRAIN_TYPES).map(([key, terrain]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: terrain.color }}
                            />
                            {terrain.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                <div>
                  <Label className="text-xs">3D Model Assignment</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select 3D model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Model</SelectItem>
                      {availableAssets.filter(asset => asset.type === 'model').map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded" />
                            {asset.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Asset Category</Label>
                  <Select value={selectedAsset?.category || ''} onValueChange={(category) => {
                    const firstAsset = availableAssets.find(a => a.category === category)
                    if (firstAsset) setSelectedAsset(firstAsset)
                  }}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ASSET_CATEGORIES).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          {info.icon} {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Asset</Label>
                  <Select value={selectedAsset?.id || ''} onValueChange={(assetId) => {
                    const asset = availableAssets.find(a => a.id === assetId)
                    if (asset) {
                      setSelectedAsset(asset)
                      setAssetHeight(asset.height || 0)
                    }
                  }}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssets
                        .filter(asset => !selectedAsset?.category || asset.category === selectedAsset.category)
                        .map(asset => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} (H: {asset.height || 0}m)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Height Offset ({assetHeight}m)</Label>
                  <Slider
                    value={[assetHeight]}
                    onValueChange={(value) => setAssetHeight(value[0])}
                    min={-5}
                    max={10}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <ScrollArea className="h-48">
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
                                onClick={() => {
                                  setSelectedAsset(asset)
                                  setAssetHeight(asset.height || 0)
                                }}
                                className="justify-start text-xs h-8"
                              >
                                {asset.name} <Badge variant="outline" className="ml-auto text-xs">{asset.height || 0}m</Badge>
                              </Button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="spawn" className="space-y-3">
                <div>
                  <Label className="text-xs">Spawn Asset</Label>
                  <Select value={selectedSpawnAsset?.id || ''} onValueChange={(assetId) => {
                    const asset = availableAssets.find(a => a.id === assetId)
                    setSelectedSpawnAsset(asset)
                  }}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select spawn asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssets.map(asset => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Spawn Settings</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Max Objects</Label>
                      <Input type="number" defaultValue="10" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Respawn Time (seconds)</Label>
                      <Input type="number" defaultValue="30" className="mt-1" />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={createSpawnArea} 
                  disabled={!selectedCell || !selectedSpawnAsset}
                  className="w-full"
                >
                  Create Spawn Area
                </Button>
              </TabsContent>

              <TabsContent value="teleport" className="space-y-3">
                <div>
                  <Label className="text-xs">Target Map</Label>
                  <Select value={selectedTeleportTarget} onValueChange={setSelectedTeleportTarget}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select target map" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedMaps
                        .filter(map => map.id !== currentMapId)
                        .map(map => (
                          <SelectItem key={map.id} value={map.id}>
                            {map.name} ({map.size}x{map.size})
                            {startingMapId === map.id && ' ⭐'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Portal Settings</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Portal Size</Label>
                      <Select defaultValue="3">
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x1 (Small)</SelectItem>
                          <SelectItem value="3">3x3 (Medium)</SelectItem>
                          <SelectItem value="5">5x5 (Large)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={createTeleportArea} 
                  disabled={!selectedCell || !selectedTeleportTarget}
                  className="w-full"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Create Portal
                </Button>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Active Portals</Label>
                  <ScrollArea className="h-24">
                    <div className="space-y-1">
                      {teleportAreas.map(area => (
                        <div key={area.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="text-xs font-medium">{area.name}</div>
                            <div className="text-xs text-gray-500">
                              To: {savedMaps.find(m => m.id === area.targetMapId)?.name || 'Unknown'}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setTeleportAreas(prev => prev.filter(a => a.id !== area.id))
                            // Remove from map cells
                            const newMapData = { ...mapData }
                            const cells = newMapData.cells.map(row => [...row])
                            cells.forEach(row => {
                              row.forEach(cell => {
                                if (cell.flags.teleport?.teleportId === area.id) {
                                  delete cell.flags.teleport
                                }
                              })
                            })
                            newMapData.cells = cells
                            setMapData(newMapData)
                          }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Special Tools */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Special Tools</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={selectedTool === 'teleport' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTool('teleport')}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Portal
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
                <Label className="text-sm font-semibold">Active Spawn Areas</Label>
              </div>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {spawnAreas.map(area => (
                    <div key={area.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="text-xs font-medium">{area.name}</div>
                        <div className="text-xs text-gray-500">{area.assetName}</div>
                      </div>
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