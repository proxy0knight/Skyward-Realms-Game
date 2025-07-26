import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Zap, 
  Target, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  MapPin,
  Timer,
  Percent,
  Hash,
  Circle,
  Square,
  Hexagon,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

const SPAWN_SHAPES = {
  circle: { name: 'Circle', icon: Circle },
  square: { name: 'Square', icon: Square },
  rectangle: { name: 'Rectangle', icon: Square },
  polygon: { name: 'Polygon', icon: Hexagon }
}

const SPAWN_DISTRIBUTIONS = {
  random: 'Random',
  grid: 'Grid Pattern',
  clustered: 'Clustered',
  scattered: 'Scattered',
  organic: 'Organic'
}

const RESPAWN_MODES = {
  time: 'Time-based',
  count: 'Count-based',
  hybrid: 'Hybrid',
  manual: 'Manual Only'
}

const SpawnAreaTool = ({ gameEngine, selectedAssets, onSpawnUpdate }) => {
  const [spawnAreas, setSpawnAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newAreaData, setNewAreaData] = useState({
    name: '',
    center: { x: 0, z: 0 },
    shape: 'circle',
    size: { width: 10, height: 10, radius: 5 },
    assetTypes: [],
    spawnSettings: {
      maxObjects: 20,
      spawnRate: 0.5, // probability per spawn attempt
      distribution: 'random',
      minDistance: 2,
      maxDistance: 8,
      respawnMode: 'time',
      respawnInterval: 30000,
      autoRespawn: true,
      avoidOverlap: true,
      snapToGround: true,
      respectTerrain: true
    },
    conditions: {
      terrainTypes: [],
      heightRange: { min: -10, max: 10 },
      playerDistance: { min: 0, max: 100 },
      activeTime: { start: 0, end: 24 } // 24-hour format
    },
    visual: {
      showBounds: true,
      showSpawnPoints: false,
      debugMode: false
    }
  })
  const [globalSettings, setGlobalSettings] = useState({
    enabled: true,
    maxTotalObjects: 1000,
    performanceMode: false,
    collisionCheck: true,
    cullDistance: 100
  })
  const [spawnStats, setSpawnStats] = useState({})
  const intervalRef = useRef(null)

  // Initialize spawn system
  useEffect(() => {
    startSpawnSystem()
    return () => stopSpawnSystem()
  }, [])

  // Monitor spawn areas
  useEffect(() => {
    if (globalSettings.enabled) {
      const interval = setInterval(updateSpawnStats, 1000)
      return () => clearInterval(interval)
    }
  }, [spawnAreas, globalSettings.enabled])

  const startSpawnSystem = () => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      if (!globalSettings.enabled) return

      spawnAreas.forEach(area => {
        if (area.spawnSettings.autoRespawn) {
          processSpawnArea(area)
        }
      })
    }, 1000) // Check every second
  }

  const stopSpawnSystem = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const processSpawnArea = async (area) => {
    if (!gameEngine?.scene || !area.assetTypes.length) return

    const stats = spawnStats[area.id] || { current: 0, total: 0, lastSpawn: 0 }
    const now = Date.now()

    // Check respawn conditions
    const shouldSpawn = checkSpawnConditions(area, stats, now)
    if (!shouldSpawn) return

    // Calculate spawn position
    const spawnPosition = calculateSpawnPosition(area)
    if (!spawnPosition) return

    // Select asset to spawn
    const assetType = selectAssetToSpawn(area)
    if (!assetType) return

    // Spawn the object
    try {
      await spawnObject(area, assetType, spawnPosition)
      
      // Update stats
      setSpawnStats(prev => ({
        ...prev,
        [area.id]: {
          current: Math.min(stats.current + 1, area.spawnSettings.maxObjects),
          total: stats.total + 1,
          lastSpawn: now
        }
      }))
    } catch (error) {
      console.error('Spawn failed:', error)
    }
  }

  const checkSpawnConditions = (area, stats, currentTime) => {
    // Check max objects
    if (stats.current >= area.spawnSettings.maxObjects) return false

    // Check global max
    const totalObjects = Object.values(spawnStats).reduce((sum, s) => sum + s.current, 0)
    if (totalObjects >= globalSettings.maxTotalObjects) return false

    // Check respawn interval
    if (currentTime - stats.lastSpawn < area.spawnSettings.respawnInterval) return false

    // Check spawn rate probability
    if (Math.random() > area.spawnSettings.spawnRate) return false

    // Check time conditions
    const hour = new Date().getHours()
    if (hour < area.conditions.activeTime.start || hour > area.conditions.activeTime.end) return false

    // Check player distance (if gameEngine has player)
    if (gameEngine.player && area.conditions.playerDistance) {
      const playerPos = gameEngine.player.position
      const areaCenter = area.center
      const distance = Math.sqrt(
        Math.pow(playerPos.x - areaCenter.x, 2) + 
        Math.pow(playerPos.z - areaCenter.z, 2)
      )
      
      if (distance < area.conditions.playerDistance.min || 
          distance > area.conditions.playerDistance.max) return false
    }

    return true
  }

  const calculateSpawnPosition = (area) => {
    const { center, shape, size, spawnSettings } = area
    let position = null

    for (let attempts = 0; attempts < 50; attempts++) {
      let candidate = null

      switch (shape) {
        case 'circle':
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * size.radius
          candidate = {
            x: center.x + Math.cos(angle) * radius,
            z: center.z + Math.sin(angle) * radius
          }
          break

        case 'square':
        case 'rectangle':
          candidate = {
            x: center.x + (Math.random() - 0.5) * size.width,
            z: center.z + (Math.random() - 0.5) * size.height
          }
          break

        case 'polygon':
          // Use square for now, polygon would need point array
          candidate = {
            x: center.x + (Math.random() - 0.5) * size.width,
            z: center.z + (Math.random() - 0.5) * size.height
          }
          break
      }

      if (candidate && validateSpawnPosition(area, candidate)) {
        position = candidate
        break
      }
    }

    return position
  }

  const validateSpawnPosition = (area, position) => {
    if (!gameEngine?.scene) return false

    // Check terrain type restrictions
    if (area.conditions.terrainTypes.length > 0) {
      // This would need terrain sampling from the game engine
      // For now, assume valid
    }

    // Check height range
    if (area.spawnSettings.snapToGround) {
      const groundHeight = getGroundHeight(position.x, position.z)
      if (groundHeight < area.conditions.heightRange.min || 
          groundHeight > area.conditions.heightRange.max) {
        return false
      }
    }

    // Check for overlapping objects
    if (area.spawnSettings.avoidOverlap) {
      const existingObjects = getObjectsInRadius(position, area.spawnSettings.minDistance)
      if (existingObjects.length > 0) return false
    }

    return true
  }

  const getGroundHeight = (x, z) => {
    // Raycast to find ground height
    if (!gameEngine?.scene) return 0

    try {
      const ray = new BABYLON.Ray(
        new BABYLON.Vector3(x, 100, z),
        new BABYLON.Vector3(0, -1, 0)
      )

      const hit = gameEngine.scene.pickWithRay(ray, (mesh) => {
        return mesh.name.includes('terrain') || mesh.name.includes('ground')
      })

      return hit?.hit ? hit.pickedPoint.y : 0
    } catch (error) {
      return 0
    }
  }

  const getObjectsInRadius = (position, radius) => {
    // Find existing objects within radius
    if (!gameEngine?.scene) return []

    return gameEngine.scene.meshes.filter(mesh => {
      if (!mesh.metadata?.spawnArea) return false
      
      const distance = Math.sqrt(
        Math.pow(mesh.position.x - position.x, 2) + 
        Math.pow(mesh.position.z - position.z, 2)
      )
      
      return distance < radius
    })
  }

  const selectAssetToSpawn = (area) => {
    if (!area.assetTypes.length) return null

    // Simple random selection for now
    // Could be weighted by rarity or other factors
    const randomIndex = Math.floor(Math.random() * area.assetTypes.length)
    return area.assetTypes[randomIndex]
  }

  const spawnObject = async (area, assetType, position) => {
    if (!gameEngine?.scene) return

    try {
      // Load asset if not already loaded
      let assetData = selectedAssets.find(asset => asset.id === assetType.id)
      if (!assetData) {
        console.warn('Asset not found:', assetType.id)
        return
      }

      // Create instance or clone
      const spawnedObject = await createAssetInstance(assetData, position, area)
      
      // Store spawn area reference
      spawnedObject.metadata = {
        ...spawnedObject.metadata,
        spawnArea: area.id,
        spawnTime: Date.now(),
        assetType: assetType.id
      }

      if (onSpawnUpdate) {
        onSpawnUpdate(area.id, spawnedObject, 'spawned')
      }

    } catch (error) {
      console.error('Failed to spawn object:', error)
    }
  }

  const createAssetInstance = async (assetData, position, area) => {
    // This would integrate with your asset loading system
    // For now, create a simple placeholder
    const box = BABYLON.MeshBuilder.CreateBox(
      `spawned_${assetData.id}_${Date.now()}`, 
      { size: 1 }, 
      gameEngine.scene
    )
    
    box.position.x = position.x
    box.position.z = position.z
    
    if (area.spawnSettings.snapToGround) {
      box.position.y = getGroundHeight(position.x, position.z)
    }

    // Apply random rotation if specified
    if (area.spawnSettings.randomRotation) {
      box.rotation.y = Math.random() * Math.PI * 2
    }

    // Apply random scale variation
    if (area.spawnSettings.scaleVariation) {
      const variation = area.spawnSettings.scaleVariation
      const scale = 1 + (Math.random() - 0.5) * variation
      box.scaling = new BABYLON.Vector3(scale, scale, scale)
    }

    return box
  }

  const updateSpawnStats = () => {
    if (!gameEngine?.scene) return

    const newStats = {}
    
    spawnAreas.forEach(area => {
      const objectsInArea = gameEngine.scene.meshes.filter(mesh => 
        mesh.metadata?.spawnArea === area.id
      )
      
      newStats[area.id] = {
        ...spawnStats[area.id],
        current: objectsInArea.length
      }
    })

    setSpawnStats(newStats)
  }

  const createSpawnArea = () => {
    const newArea = {
      ...newAreaData,
      id: Date.now(),
      name: newAreaData.name || `Spawn Area ${spawnAreas.length + 1}`,
      created: Date.now(),
      active: true
    }

    setSpawnAreas(prev => [...prev, newArea])
    setSelectedArea(newArea)
    setIsCreating(false)
    setNewAreaData({
      ...newAreaData,
      name: '',
      assetTypes: []
    })
  }

  const deleteSpawnArea = (areaId) => {
    // Remove spawned objects
    if (gameEngine?.scene) {
      const objectsToRemove = gameEngine.scene.meshes.filter(mesh => 
        mesh.metadata?.spawnArea === areaId
      )
      objectsToRemove.forEach(obj => obj.dispose())
    }

    setSpawnAreas(prev => prev.filter(area => area.id !== areaId))
    if (selectedArea?.id === areaId) {
      setSelectedArea(null)
    }
  }

  const clearSpawnedObjects = (areaId) => {
    if (!gameEngine?.scene) return

    const objectsToRemove = gameEngine.scene.meshes.filter(mesh => 
      mesh.metadata?.spawnArea === areaId
    )
    
    objectsToRemove.forEach(obj => obj.dispose())
    
    setSpawnStats(prev => ({
      ...prev,
      [areaId]: { ...prev[areaId], current: 0 }
    }))
  }

  const forceSpawn = (area) => {
    processSpawnArea(area)
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Spawn Areas
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setGlobalSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              variant={globalSettings.enabled ? "default" : "outline"}
            >
              {globalSettings.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={globalSettings.enabled ? "default" : "secondary"}>
            {globalSettings.enabled ? "Active" : "Paused"}
          </Badge>
          <Badge variant="outline">
            {Object.values(spawnStats).reduce((sum, s) => sum + s.current, 0)} / {globalSettings.maxTotalObjects} Objects
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isCreating ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Create Spawn Area</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={newAreaData.name}
                  onChange={(e) => setNewAreaData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter spawn area name"
                  className="h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Shape</Label>
                  <Select 
                    value={newAreaData.shape} 
                    onValueChange={(value) => setNewAreaData(prev => ({ ...prev, shape: value }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SPAWN_SHAPES).map(([key, shape]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <shape.icon className="w-3 h-3" />
                            {shape.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Max Objects</Label>
                  <Input
                    type="number"
                    value={newAreaData.spawnSettings.maxObjects}
                    onChange={(e) => setNewAreaData(prev => ({
                      ...prev,
                      spawnSettings: { ...prev.spawnSettings, maxObjects: parseInt(e.target.value) || 1 }
                    }))}
                    className="h-8"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Spawn Rate ({(newAreaData.spawnSettings.spawnRate * 100).toFixed(0)}%)</Label>
                <Slider
                  value={[newAreaData.spawnSettings.spawnRate]}
                  onValueChange={(value) => setNewAreaData(prev => ({
                    ...prev,
                    spawnSettings: { ...prev.spawnSettings, spawnRate: value[0] }
                  }))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={createSpawnArea}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {spawnAreas.map(area => {
                const stats = spawnStats[area.id] || { current: 0, total: 0 }
                const fillPercentage = (stats.current / area.spawnSettings.maxObjects) * 100

                return (
                  <Card 
                    key={area.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedArea?.id === area.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedArea(area)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span className="text-sm font-medium">{area.name}</span>
                          <Badge variant={area.active ? "default" : "secondary"} className="text-xs">
                            {area.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              forceSpawn(area)
                            }}
                          >
                            <Zap className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              clearSpawnedObjects(area.id)
                            }}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSpawnArea(area.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Objects: {stats.current} / {area.spawnSettings.maxObjects}</span>
                          <span>Total Spawned: {stats.total}</span>
                        </div>
                        <Progress value={fillPercentage} className="h-2" />
                        
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <span>Rate: {(area.spawnSettings.spawnRate * 100).toFixed(0)}%</span>
                          <span>Shape: {SPAWN_SHAPES[area.shape].name}</span>
                          <span>Assets: {area.assetTypes.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {selectedArea && !isCreating && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {selectedArea.name} Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
                  <TabsTrigger value="spawning" className="text-xs">Spawning</TabsTrigger>
                  <TabsTrigger value="conditions" className="text-xs">Conditions</TabsTrigger>
                  <TabsTrigger value="assets" className="text-xs">Assets</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Center X</Label>
                      <Input
                        type="number"
                        value={selectedArea.center.x}
                        onChange={(e) => {
                          const newAreas = spawnAreas.map(area => 
                            area.id === selectedArea.id 
                              ? { ...area, center: { ...area.center, x: parseFloat(e.target.value) || 0 } }
                              : area
                          )
                          setSpawnAreas(newAreas)
                          setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                        }}
                        className="h-8"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Center Z</Label>
                      <Input
                        type="number"
                        value={selectedArea.center.z}
                        onChange={(e) => {
                          const newAreas = spawnAreas.map(area => 
                            area.id === selectedArea.id 
                              ? { ...area, center: { ...area.center, z: parseFloat(e.target.value) || 0 } }
                              : area
                          )
                          setSpawnAreas(newAreas)
                          setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                        }}
                        className="h-8"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {selectedArea.shape === 'circle' ? (
                    <div>
                      <Label className="text-xs">Radius</Label>
                      <Slider
                        value={[selectedArea.size.radius]}
                        onValueChange={(value) => {
                          const newAreas = spawnAreas.map(area => 
                            area.id === selectedArea.id 
                              ? { ...area, size: { ...area.size, radius: value[0] } }
                              : area
                          )
                          setSpawnAreas(newAreas)
                          setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                        }}
                        min={1}
                        max={50}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Width</Label>
                        <Slider
                          value={[selectedArea.size.width]}
                          onValueChange={(value) => {
                            const newAreas = spawnAreas.map(area => 
                              area.id === selectedArea.id 
                                ? { ...area, size: { ...area.size, width: value[0] } }
                                : area
                            )
                            setSpawnAreas(newAreas)
                            setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                          }}
                          min={1}
                          max={50}
                          step={0.5}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Height</Label>
                        <Slider
                          value={[selectedArea.size.height]}
                          onValueChange={(value) => {
                            const newAreas = spawnAreas.map(area => 
                              area.id === selectedArea.id 
                                ? { ...area, size: { ...area.size, height: value[0] } }
                                : area
                            )
                            setSpawnAreas(newAreas)
                            setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                          }}
                          min={1}
                          max={50}
                          step={0.5}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="spawning" className="space-y-3 mt-3">
                  <div>
                    <Label className="text-xs">Max Objects</Label>
                    <Input
                      type="number"
                      value={selectedArea.spawnSettings.maxObjects}
                      onChange={(e) => {
                        const newAreas = spawnAreas.map(area => 
                          area.id === selectedArea.id 
                            ? { 
                                ...area, 
                                spawnSettings: { 
                                  ...area.spawnSettings, 
                                  maxObjects: parseInt(e.target.value) || 1 
                                }
                              }
                            : area
                        )
                        setSpawnAreas(newAreas)
                        setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                      }}
                      className="h-8 mt-1"
                      min="1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">
                      Spawn Rate ({(selectedArea.spawnSettings.spawnRate * 100).toFixed(0)}%)
                    </Label>
                    <Slider
                      value={[selectedArea.spawnSettings.spawnRate]}
                      onValueChange={(value) => {
                        const newAreas = spawnAreas.map(area => 
                          area.id === selectedArea.id 
                            ? { 
                                ...area, 
                                spawnSettings: { 
                                  ...area.spawnSettings, 
                                  spawnRate: value[0] 
                                }
                              }
                            : area
                        )
                        setSpawnAreas(newAreas)
                        setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                      }}
                      min={0}
                      max={1}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">
                      Respawn Interval ({(selectedArea.spawnSettings.respawnInterval / 1000).toFixed(1)}s)
                    </Label>
                    <Slider
                      value={[selectedArea.spawnSettings.respawnInterval]}
                      onValueChange={(value) => {
                        const newAreas = spawnAreas.map(area => 
                          area.id === selectedArea.id 
                            ? { 
                                ...area, 
                                spawnSettings: { 
                                  ...area.spawnSettings, 
                                  respawnInterval: value[0] 
                                }
                              }
                            : area
                        )
                        setSpawnAreas(newAreas)
                        setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                      }}
                      min={1000}
                      max={300000}
                      step={1000}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'autoRespawn', label: 'Auto Respawn' },
                      { key: 'avoidOverlap', label: 'Avoid Overlap' },
                      { key: 'snapToGround', label: 'Snap to Ground' },
                      { key: 'respectTerrain', label: 'Respect Terrain' }
                    ].map(setting => (
                      <div key={setting.key} className="flex items-center gap-2">
                        <Switch
                          checked={selectedArea.spawnSettings[setting.key]}
                          onCheckedChange={(checked) => {
                            const newAreas = spawnAreas.map(area => 
                              area.id === selectedArea.id 
                                ? { 
                                    ...area, 
                                    spawnSettings: { 
                                      ...area.spawnSettings, 
                                      [setting.key]: checked 
                                    }
                                  }
                                : area
                            )
                            setSpawnAreas(newAreas)
                            setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                          }}
                          id={setting.key}
                        />
                        <Label htmlFor={setting.key} className="text-xs">
                          {setting.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="conditions" className="space-y-3 mt-3">
                  <div>
                    <Label className="text-xs">Height Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={selectedArea.conditions.heightRange.min}
                        onChange={(e) => {
                          const newAreas = spawnAreas.map(area => 
                            area.id === selectedArea.id 
                              ? { 
                                  ...area, 
                                  conditions: { 
                                    ...area.conditions, 
                                    heightRange: {
                                      ...area.conditions.heightRange,
                                      min: parseFloat(e.target.value) || -10
                                    }
                                  }
                                }
                              : area
                          )
                          setSpawnAreas(newAreas)
                          setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                        }}
                        className="h-8 text-xs"
                        step="0.1"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={selectedArea.conditions.heightRange.max}
                        onChange={(e) => {
                          const newAreas = spawnAreas.map(area => 
                            area.id === selectedArea.id 
                              ? { 
                                  ...area, 
                                  conditions: { 
                                    ...area.conditions, 
                                    heightRange: {
                                      ...area.conditions.heightRange,
                                      max: parseFloat(e.target.value) || 10
                                    }
                                  }
                                }
                              : area
                          )
                          setSpawnAreas(newAreas)
                          setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                        }}
                        className="h-8 text-xs"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Active Time (24h format)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input
                        type="number"
                        placeholder="Start"
                        value={selectedArea.conditions.activeTime.start}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                          const newAreas = spawnAreas.map(area => 
                            area.id === selectedArea.id 
                              ? { 
                                  ...area, 
                                  conditions: { 
                                    ...area.conditions, 
                                    activeTime: {
                                      ...area.conditions.activeTime,
                                      start: value
                                    }
                                  }
                                }
                              : area
                          )
                          setSpawnAreas(newAreas)
                          setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                        }}
                        className="h-8 text-xs"
                        min="0"
                        max="23"
                      />
                      <Input
                        type="number"
                        placeholder="End"
                        value={selectedArea.conditions.activeTime.end}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(24, parseInt(e.target.value) || 24))
                          const newAreas = spawnAreas.map(area => 
                            area.id === selectedArea.id 
                              ? { 
                                  ...area, 
                                  conditions: { 
                                    ...area.conditions, 
                                    activeTime: {
                                      ...area.conditions.activeTime,
                                      end: value
                                    }
                                  }
                                }
                              : area
                          )
                          setSpawnAreas(newAreas)
                          setSelectedArea(newAreas.find(a => a.id === selectedArea.id))
                        }}
                        className="h-8 text-xs"
                        min="0"
                        max="24"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assets" className="space-y-3 mt-3">
                  <div className="text-xs text-gray-600">
                    Asset selection for this spawn area would be implemented here.
                    This would allow selecting from available assets and setting spawn weights.
                  </div>
                  <div className="text-xs">
                    Current assets: {selectedArea.assetTypes.length}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export default SpawnAreaTool
