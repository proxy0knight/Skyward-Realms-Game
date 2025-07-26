import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  Move3D, 
  RotateCw, 
  Maximize, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Target,
  Grid,
  RefreshCw
} from 'lucide-react'

const SNAP_MODES = {
  none: 'Free',
  grid: 'Grid',
  surface: 'Surface',
  object: 'Object'
}

const COORDINATE_SYSTEMS = {
  world: 'World',
  local: 'Local',
  relative: 'Relative to Ground'
}

const AssetPositioning = ({ selectedAsset, gameEngine, onAssetUpdate }) => {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 })
  const [heightOffset, setHeightOffset] = useState(0)
  const [snapMode, setSnapMode] = useState('surface')
  const [coordinateSystem, setCoordinateSystem] = useState('relative')
  const [isLocked, setIsLocked] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [precisionMode, setPrecisionMode] = useState(false)
  const [groundHeight, setGroundHeight] = useState(0)
  const [relativeTo, setRelativeTo] = useState('ground')
  const [layerIndex, setLayerIndex] = useState(0)
  const [collisionEnabled, setCollisionEnabled] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)

  // Ground detection
  useEffect(() => {
    if (gameEngine && selectedAsset && coordinateSystem === 'relative') {
      detectGroundHeight()
    }
  }, [position.x, position.z, gameEngine, selectedAsset, coordinateSystem])

  const detectGroundHeight = async () => {
    if (!gameEngine?.scene) return

    try {
      // Raycast to find ground height
      const ray = new BABYLON.Ray(
        new BABYLON.Vector3(position.x, 100, position.z),
        new BABYLON.Vector3(0, -1, 0)
      )

      const hit = gameEngine.scene.pickWithRay(ray, (mesh) => {
        return mesh.name.includes('terrain') || mesh.name.includes('ground')
      })

      if (hit?.hit) {
        setGroundHeight(hit.pickedPoint.y)
      }
    } catch (error) {
      console.error('Ground detection failed:', error)
    }
  }

  const updatePosition = (axis, value) => {
    if (isLocked) return

    const newPosition = { ...position, [axis]: value }
    
    // Apply snapping
    if (snapMode === 'grid') {
      const gridSize = 1.0
      newPosition[axis] = Math.round(value / gridSize) * gridSize
    }

    setPosition(newPosition)
    updateAsset({ position: newPosition })
  }

  const updateRotation = (axis, value) => {
    if (isLocked) return

    const newRotation = { ...rotation, [axis]: value }
    setRotation(newRotation)
    updateAsset({ rotation: newRotation })
  }

  const updateScale = (axis, value) => {
    if (isLocked) return

    const newScale = { ...scale, [axis]: value }
    setScale(newScale)
    updateAsset({ scale: newScale })
  }

  const updateHeightOffset = (value) => {
    setHeightOffset(value)
    updateAsset({ heightOffset: value })
  }

  const updateAsset = (changes) => {
    if (!selectedAsset || !onAssetUpdate) return

    const finalY = coordinateSystem === 'relative' 
      ? groundHeight + heightOffset 
      : position.y

    const updatedAsset = {
      ...selectedAsset,
      position: { ...position, y: finalY, ...changes.position },
      rotation: { ...rotation, ...changes.rotation },
      scale: { ...scale, ...changes.scale },
      heightOffset: changes.heightOffset !== undefined ? changes.heightOffset : heightOffset,
      layerIndex,
      collisionEnabled,
      visible: isVisible
    }

    onAssetUpdate(updatedAsset)
  }

  const resetTransform = () => {
    setPosition({ x: 0, y: 0, z: 0 })
    setRotation({ x: 0, y: 0, z: 0 })
    setScale({ x: 1, y: 1, z: 1 })
    setHeightOffset(0)
    updateAsset({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      heightOffset: 0
    })
  }

  const duplicateAsset = () => {
    if (!selectedAsset) return

    const duplicated = {
      ...selectedAsset,
      id: `${selectedAsset.id}_${Date.now()}`,
      position: {
        x: position.x + 2,
        y: position.y,
        z: position.z + 2
      }
    }

    onAssetUpdate(duplicated, true) // true indicates it's a new asset
  }

  const deleteAsset = () => {
    if (!selectedAsset || !onAssetUpdate) return
    onAssetUpdate(null, false, true) // true indicates deletion
  }

  const moveToLayer = (direction) => {
    const newLayer = direction === 'up' ? layerIndex + 1 : Math.max(0, layerIndex - 1)
    setLayerIndex(newLayer)
    updateAsset({ layerIndex: newLayer })
  }

  const snapToSurface = async () => {
    if (!gameEngine?.scene) return

    try {
      const ray = new BABYLON.Ray(
        new BABYLON.Vector3(position.x, position.y + 10, position.z),
        new BABYLON.Vector3(0, -1, 0)
      )

      const hit = gameEngine.scene.pickWithRay(ray)
      if (hit?.hit) {
        const newY = hit.pickedPoint.y
        setPosition(prev => ({ ...prev, y: newY }))
        updateAsset({ position: { ...position, y: newY } })
      }
    } catch (error) {
      console.error('Snap to surface failed:', error)
    }
  }

  const getStepSize = () => {
    return precisionMode ? 0.01 : 0.1
  }

  const formatCoordinate = (value) => {
    return precisionMode ? value.toFixed(3) : value.toFixed(1)
  }

  if (!selectedAsset) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Move3D className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select an asset to edit its position</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Move3D className="w-4 h-4" />
            Asset Positioning
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsLocked(!isLocked)}
              className={isLocked ? "bg-red-100" : ""}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsVisible(!isVisible)
                updateAsset({ visible: !isVisible })
              }}
            >
              {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Badge variant="outline">{selectedAsset.name}</Badge>
          <Badge variant="outline">Layer {layerIndex}</Badge>
          {coordinateSystem === 'relative' && (
            <Badge variant="outline">Ground: {formatCoordinate(groundHeight)}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Control Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Coordinate System</Label>
            <Select value={coordinateSystem} onValueChange={setCoordinateSystem}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COORDINATE_SYSTEMS).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs">Snap Mode</Label>
            <Select value={snapMode} onValueChange={setSnapMode}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SNAP_MODES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={precisionMode} 
              onCheckedChange={setPrecisionMode}
              id="precision"
            />
            <Label htmlFor="precision" className="text-xs">Precision Mode</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={collisionEnabled} 
              onCheckedChange={setCollisionEnabled}
              id="collision"
            />
            <Label htmlFor="collision" className="text-xs">Collision</Label>
          </div>
        </div>

        <Tabs defaultValue="position" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="position" className="text-xs">Position</TabsTrigger>
            <TabsTrigger value="rotation" className="text-xs">Rotation</TabsTrigger>
            <TabsTrigger value="scale" className="text-xs">Scale</TabsTrigger>
          </TabsList>

          <TabsContent value="position" className="space-y-3 mt-4">
            {coordinateSystem === 'relative' ? (
              <div>
                <Label className="text-xs">Height Offset (relative to ground)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[heightOffset]}
                    onValueChange={(value) => updateHeightOffset(value[0])}
                    min={-10}
                    max={10}
                    step={getStepSize()}
                    className="flex-1"
                    disabled={isLocked}
                  />
                  <Input
                    type="number"
                    value={heightOffset}
                    onChange={(e) => updateHeightOffset(parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-xs"
                    step={getStepSize()}
                    disabled={isLocked}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Final Y: {formatCoordinate(groundHeight + heightOffset)}
                </div>
              </div>
            ) : (
              <>
                {['x', 'y', 'z'].map((axis) => (
                  <div key={axis}>
                    <Label className="text-xs capitalize">{axis} Position</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[position[axis]]}
                        onValueChange={(value) => updatePosition(axis, value[0])}
                        min={-50}
                        max={50}
                        step={getStepSize()}
                        className="flex-1"
                        disabled={isLocked}
                      />
                      <Input
                        type="number"
                        value={position[axis]}
                        onChange={(e) => updatePosition(axis, parseFloat(e.target.value) || 0)}
                        className="w-20 h-8 text-xs"
                        step={getStepSize()}
                        disabled={isLocked}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={snapToSurface} disabled={isLocked}>
                <ArrowDown className="w-3 h-3 mr-1" />
                Snap to Surface
              </Button>
              {snapMode === 'grid' && (
                <Button size="sm" onClick={() => updatePosition('x', Math.round(position.x))} disabled={isLocked}>
                  <Grid className="w-3 h-3 mr-1" />
                  Snap to Grid
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rotation" className="space-y-3 mt-4">
            {['x', 'y', 'z'].map((axis) => (
              <div key={axis}>
                <Label className="text-xs capitalize">{axis} Rotation (degrees)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[rotation[axis]]}
                    onValueChange={(value) => updateRotation(axis, value[0])}
                    min={-180}
                    max={180}
                    step={precisionMode ? 1 : 15}
                    className="flex-1"
                    disabled={isLocked}
                  />
                  <Input
                    type="number"
                    value={rotation[axis]}
                    onChange={(e) => updateRotation(axis, parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-xs"
                    step={precisionMode ? 1 : 15}
                    disabled={isLocked}
                  />
                </div>
              </div>
            ))}
            
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" onClick={() => updateRotation('y', rotation.y + 90)} disabled={isLocked}>
                <RotateCw className="w-3 h-3 mr-1" />
                +90°
              </Button>
              <Button size="sm" onClick={() => updateRotation('y', rotation.y - 90)} disabled={isLocked}>
                <RefreshCw className="w-3 h-3 mr-1" />
                -90°
              </Button>
              <Button size="sm" onClick={() => updateRotation('y', 0)} disabled={isLocked}>
                <Target className="w-3 h-3 mr-1" />
                Reset Y
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="scale" className="space-y-3 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Switch 
                checked={scale.x === scale.y && scale.y === scale.z}
                onCheckedChange={(uniform) => {
                  if (uniform) {
                    const avgScale = (scale.x + scale.y + scale.z) / 3
                    updateScale('x', avgScale)
                    updateScale('y', avgScale)
                    updateScale('z', avgScale)
                  }
                }}
                id="uniform-scale"
              />
              <Label htmlFor="uniform-scale" className="text-xs">Uniform Scale</Label>
            </div>

            {['x', 'y', 'z'].map((axis) => (
              <div key={axis}>
                <Label className="text-xs capitalize">{axis} Scale</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[scale[axis]]}
                    onValueChange={(value) => {
                      if (scale.x === scale.y && scale.y === scale.z) {
                        // Uniform scaling
                        setScale({ x: value[0], y: value[0], z: value[0] })
                        updateAsset({ scale: { x: value[0], y: value[0], z: value[0] } })
                      } else {
                        updateScale(axis, value[0])
                      }
                    }}
                    min={0.1}
                    max={5}
                    step={precisionMode ? 0.01 : 0.1}
                    className="flex-1"
                    disabled={isLocked}
                  />
                  <Input
                    type="number"
                    value={scale[axis]}
                    onChange={(e) => updateScale(axis, parseFloat(e.target.value) || 0.1)}
                    className="w-20 h-8 text-xs"
                    step={precisionMode ? 0.01 : 0.1}
                    min={0.1}
                    disabled={isLocked}
                  />
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Layer Controls */}
        <div className="border-t pt-4">
          <Label className="text-xs font-semibold">Layer Management</Label>
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={() => moveToLayer('down')} disabled={isLocked || layerIndex <= 0}>
              <ArrowDown className="w-3 h-3" />
            </Button>
            <span className="text-xs px-2">Layer {layerIndex}</span>
            <Button size="sm" onClick={() => moveToLayer('up')} disabled={isLocked}>
              <ArrowUp className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-4 flex gap-2">
          <Button size="sm" onClick={resetTransform} disabled={isLocked}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={duplicateAsset}>
            <Copy className="w-3 h-3 mr-1" />
            Duplicate
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteAsset}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AssetPositioning
