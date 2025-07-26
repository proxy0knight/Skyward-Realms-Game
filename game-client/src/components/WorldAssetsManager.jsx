import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { 
  Globe, 
  Layers, 
  Activity, 
  Settings, 
  Eye, 
  EyeOff, 
  Zap, 
  Target, 
  Gauge,
  Monitor,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react'

import MapEditor from './MapEditor'
import AssetPositioning from './AssetPositioning'
import SpawnAreaTool from './SpawnAreaTool'
import PerformanceOptimizer from '@/lib/PerformanceOptimizer'

const WorldAssetsManager = ({ gameEngine, player }) => {
  const [activeTab, setActiveTab] = useState('map')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [worldData, setWorldData] = useState(null)
  const [performanceStats, setPerformanceStats] = useState({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    textures: 0,
    memory: { used: 0, total: 0 }
  })
  const [qualitySettings, setQualitySettings] = useState({
    lodDistance: 50,
    shadowQuality: 'medium',
    textureQuality: 'high',
    particleQuality: 'medium',
    cullingDistance: 100,
    maxDrawCalls: 1000,
    enableInstancing: true,
    enableFrustumCulling: true,
    enableOcclusion: false
  })
  const [systemInfo, setSystemInfo] = useState({
    gpu: 'Unknown',
    memory: 0,
    cores: 0,
    mobile: false
  })
  const [optimizationMode, setOptimizationMode] = useState('balanced')
  const [assets, setAssets] = useState([])
  const [selectedAssets, setSelectedAssets] = useState([])
  const performanceRef = useRef(null)
  const optimizerRef = useRef(null)

  // Initialize PerformanceOptimizer
  useEffect(() => {
    if (gameEngine && !optimizerRef.current) {
      optimizerRef.current = new PerformanceOptimizer(gameEngine)
      optimizerRef.current.startMonitoring()
    }
    
    return () => {
      if (optimizerRef.current) {
        optimizerRef.current.stopMonitoring()
      }
    }
  }, [gameEngine])

  // Performance monitoring
  useEffect(() => {
    if (!gameEngine?.engine) return

    const updatePerformance = () => {
      if (gameEngine.engine && gameEngine.scene) {
        const stats = optimizerRef.current ? optimizerRef.current.getMetrics() : null
        
        setPerformanceStats({
          fps: Math.round(gameEngine.engine.getFps()),
          drawCalls: gameEngine.scene.getActiveMeshes().length,
          triangles: gameEngine.scene.getActiveMeshes().reduce((total, mesh) => {
            return total + (mesh.getTotalVertices ? Math.floor(mesh.getTotalVertices() / 3) : 0)
          }, 0),
          textures: gameEngine.scene.textures.length,
          memory: {
            used: stats?.memory?.used || (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0),
            total: stats?.memory?.total || (performance.memory ? Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) : 0)
          }
        })
      }
    }

    const interval = setInterval(updatePerformance, 1000)
    return () => clearInterval(interval)
  }, [gameEngine])

  // System detection
  useEffect(() => {
    detectSystemCapabilities()
  }, [])

  // Auto-optimization based on performance
  useEffect(() => {
    if (optimizationMode === 'auto') {
      autoOptimize()
    }
  }, [performanceStats, optimizationMode])

  const detectSystemCapabilities = () => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    const info = {
      mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      cores: navigator.hardwareConcurrency || 4,
      memory: navigator.deviceMemory ? navigator.deviceMemory * 1024 : 4096, // MB
      gpu: 'Unknown'
    }

    if (gl && typeof gl.getExtension === 'function') {
      try {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo && typeof gl.getParameter === 'function') {
          info.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        }
      } catch (error) {
        console.warn('Failed to get GPU info:', error)
      }
    }

    setSystemInfo(info)
    
    // Auto-select optimization mode based on system
    if (info.mobile || info.memory < 2048) {
      setOptimizationMode('performance')
      applyPerformancePreset('low')
    } else if (info.memory > 8192 && info.cores >= 8) {
      setOptimizationMode('quality')
      applyPerformancePreset('ultra')
    } else {
      setOptimizationMode('balanced')
      applyPerformancePreset('high')
    }
  }

  const autoOptimize = () => {
    if (optimizerRef.current) {
      const recommendations = optimizerRef.current.getOptimizationRecommendations()
      
      // Apply PerformanceOptimizer recommendations
      if (recommendations.length > 0) {
        recommendations.forEach(rec => {
          switch (rec.type) {
            case 'quality':
              if (rec.setting === 'shadowQuality') {
                updateQualitySetting('shadowQuality', rec.value)
              } else if (rec.setting === 'textureQuality') {
                updateQualitySetting('textureQuality', rec.value)
              }
              break
            case 'lod':
              updateQualitySetting('lodDistance', rec.value)
              break
            case 'culling':
              updateQualitySetting('cullingDistance', rec.value)
              updateQualitySetting('enableOcclusion', rec.enableOcclusion)
              break
          }
        })
      }
    } else {
      // Fallback to basic optimization
      const { fps, drawCalls, memory } = performanceStats
      
      if (fps < 30 || drawCalls > qualitySettings.maxDrawCalls) {
        if (qualitySettings.shadowQuality === 'ultra') {
          updateQualitySetting('shadowQuality', 'high')
        } else if (qualitySettings.shadowQuality === 'high') {
          updateQualitySetting('shadowQuality', 'medium')
        } else if (qualitySettings.shadowQuality === 'medium') {
          updateQualitySetting('shadowQuality', 'low')
        }
        
        if (qualitySettings.lodDistance > 20) {
          updateQualitySetting('lodDistance', Math.max(20, qualitySettings.lodDistance - 10))
        }
      }
      
      if (memory.used > memory.total * 0.8) {
        updateQualitySetting('cullingDistance', Math.max(30, qualitySettings.cullingDistance - 10))
        updateQualitySetting('enableOcclusion', true)
      }
    }
  }

  const applyPerformancePreset = (preset) => {
    const presets = {
      low: {
        lodDistance: 20,
        shadowQuality: 'low',
        textureQuality: 'medium',
        particleQuality: 'low',
        cullingDistance: 50,
        maxDrawCalls: 500,
        enableInstancing: true,
        enableFrustumCulling: true,
        enableOcclusion: true
      },
      medium: {
        lodDistance: 35,
        shadowQuality: 'medium',
        textureQuality: 'medium',
        particleQuality: 'medium',
        cullingDistance: 75,
        maxDrawCalls: 750,
        enableInstancing: true,
        enableFrustumCulling: true,
        enableOcclusion: true
      },
      high: {
        lodDistance: 50,
        shadowQuality: 'high',
        textureQuality: 'high',
        particleQuality: 'medium',
        cullingDistance: 100,
        maxDrawCalls: 1000,
        enableInstancing: true,
        enableFrustumCulling: true,
        enableOcclusion: false
      },
      ultra: {
        lodDistance: 100,
        shadowQuality: 'ultra',
        textureQuality: 'ultra',
        particleQuality: 'high',
        cullingDistance: 150,
        maxDrawCalls: 1500,
        enableInstancing: true,
        enableFrustumCulling: true,
        enableOcclusion: false
      }
    }

    if (presets[preset]) {
      setQualitySettings(presets[preset])
      applyQualitySettings(presets[preset])
    }
  }

  const updateQualitySetting = (key, value) => {
    const newSettings = { ...qualitySettings, [key]: value }
    setQualitySettings(newSettings)
    applyQualitySettings(newSettings)
  }

  const applyQualitySettings = (settings) => {
    if (!gameEngine?.scene) return

    try {
      // Sync with PerformanceOptimizer
      if (optimizerRef.current) {
        optimizerRef.current.applyOptimizations(settings)
      }

      // Apply LOD settings
      gameEngine.scene.meshes.forEach(mesh => {
        if (mesh.setLODDistance) {
          mesh.setLODDistance(settings.lodDistance)
        }
      })

      // Apply shadow settings
      if (gameEngine.shadowGenerator) {
        switch (settings.shadowQuality) {
          case 'low':
            gameEngine.shadowGenerator.mapSize = 512
            gameEngine.shadowGenerator.useExponentialShadowMap = false
            break
          case 'medium':
            gameEngine.shadowGenerator.mapSize = 1024
            gameEngine.shadowGenerator.useExponentialShadowMap = true
            break
          case 'high':
            gameEngine.shadowGenerator.mapSize = 2048
            gameEngine.shadowGenerator.useExponentialShadowMap = true
            break
          case 'ultra':
            gameEngine.shadowGenerator.mapSize = 4096
            gameEngine.shadowGenerator.useExponentialShadowMap = true
            break
        }
      }

      // Apply culling
      if (settings.enableFrustumCulling) {
        gameEngine.scene.setOcclusionCullingEnabled(settings.enableOcclusion)
      }

      // Apply texture quality
      gameEngine.scene.textures.forEach(texture => {
        if (texture.updateSize) {
          const scale = settings.textureQuality === 'low' ? 0.5 : 
                       settings.textureQuality === 'medium' ? 0.75 : 1.0
          // texture.updateSize(texture.baseSize * scale, texture.baseSize * scale)
        }
      })

    } catch (error) {
      console.error('Failed to apply quality settings:', error)
    }
  }

  const handleMapUpdate = async (mapData) => {
    setWorldData(mapData)
    
    // Sync with 3D world
    if (gameEngine && mapData) {
      try {
        await gameEngine.updateWorldFromMap(mapData)
      } catch (error) {
        console.error('Failed to sync map with 3D world:', error)
      }
    }
  }

  const handleAssetUpdate = (asset, isNew = false, isDelete = false) => {
    if (isDelete) {
      setSelectedAsset(null)
      // Remove from 3D world
      if (gameEngine?.scene && asset) {
        const mesh = gameEngine.scene.getMeshByName(asset.id)
        if (mesh) mesh.dispose()
      }
    } else if (isNew) {
      setAssets(prev => [...prev, asset])
      // Add to 3D world
      if (gameEngine) {
        gameEngine.loadAndPlaceAsset(asset)
      }
    } else {
      setSelectedAsset(asset)
      // Update in 3D world
      if (gameEngine?.scene && asset) {
        const mesh = gameEngine.scene.getMeshByName(asset.id)
        if (mesh) {
          mesh.position.set(asset.position.x, asset.position.y, asset.position.z)
          mesh.rotation.set(asset.rotation.x, asset.rotation.y, asset.rotation.z)
          mesh.scaling.set(asset.scale.x, asset.scale.y, asset.scale.z)
          mesh.setEnabled(asset.visible)
        }
      }
    }
  }

  const handleSpawnUpdate = (areaId, spawnedObject, action) => {
    // Handle spawn area updates
    console.log(`Spawn area ${areaId}: ${action}`, spawnedObject)
  }

  const saveWorldData = async () => {
    try {
      const fullWorldData = {
        map: worldData,
        assets: assets,
        settings: qualitySettings,
        timestamp: Date.now(),
        version: '1.0'
      }

      const blob = new Blob([JSON.stringify(fullWorldData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `world_${Date.now()}.json`
      a.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to save world data:', error)
    }
  }

  const getPerformanceStatus = () => {
    const { fps, drawCalls, memory } = performanceStats
    
    if (fps < 30 || drawCalls > qualitySettings.maxDrawCalls) {
      return { status: 'poor', color: 'red', icon: AlertTriangle }
    } else if (fps < 45 || drawCalls > qualitySettings.maxDrawCalls * 0.8) {
      return { status: 'fair', color: 'yellow', icon: AlertTriangle }
    } else {
      return { status: 'good', color: 'green', icon: CheckCircle }
    }
  }

  const performanceStatus = getPerformanceStatus()

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            World Assets Manager
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* Performance indicator */}
            <div className="flex items-center gap-2">
              <performanceStatus.icon className={`w-4 h-4 text-${performanceStatus.color}-500`} />
              <Badge variant="outline" className="text-xs">
                {performanceStats.fps} FPS
              </Badge>
              <Badge variant="outline" className="text-xs">
                {performanceStats.memory.used}MB
              </Badge>
            </div>
            
            <Button size="sm" onClick={saveWorldData}>
              <Save className="w-4 h-4 mr-2" />
              Save World
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="map" className="text-xs">
              <Layers className="w-3 h-3 mr-1" />
              Map Editor
            </TabsTrigger>
            <TabsTrigger value="assets" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Asset Positioning
            </TabsTrigger>
            <TabsTrigger value="spawn" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Spawn Areas
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Quality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-4">
            <MapEditor 
              gameEngine={gameEngine}
              onMapUpdate={handleMapUpdate}
            />
          </TabsContent>

          <TabsContent value="assets" className="mt-4">
            <AssetPositioning
              selectedAsset={selectedAsset}
              gameEngine={gameEngine}
              onAssetUpdate={handleAssetUpdate}
            />
          </TabsContent>

          <TabsContent value="spawn" className="mt-4">
            <SpawnAreaTool
              gameEngine={gameEngine}
              selectedAssets={selectedAssets}
              onSpawnUpdate={handleSpawnUpdate}
            />
          </TabsContent>

          <TabsContent value="performance" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Performance Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>FPS</span>
                        <span className={`font-medium text-${performanceStatus.color}-600`}>
                          {performanceStats.fps}
                        </span>
                      </div>
                      <Progress 
                        value={(performanceStats.fps / 60) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Draw Calls</span>
                        <span>{performanceStats.drawCalls}</span>
                      </div>
                      <Progress 
                        value={(performanceStats.drawCalls / qualitySettings.maxDrawCalls) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Memory</span>
                        <span>{performanceStats.memory.used} / {performanceStats.memory.total} MB</span>
                      </div>
                      <Progress 
                        value={performanceStats.memory.total > 0 ? (performanceStats.memory.used / performanceStats.memory.total) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Triangles</span>
                        <span>{performanceStats.triangles.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">System Information</Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3 h-3" />
                      <span>CPU Cores: {systemInfo.cores}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3 h-3" />
                      <span>Memory: {systemInfo.memory}MB</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Wifi className="w-3 h-3" />
                      <span className="truncate">GPU: {systemInfo.gpu}</span>
                    </div>
                  </div>
                  <Badge variant={systemInfo.mobile ? "secondary" : "outline"} className="text-xs">
                    {systemInfo.mobile ? "Mobile Device" : "Desktop"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Optimization Mode</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {['performance', 'balanced', 'quality', 'auto'].map(mode => (
                      <Button
                        key={mode}
                        size="sm"
                        variant={optimizationMode === mode ? "default" : "outline"}
                        onClick={() => setOptimizationMode(mode)}
                        className="text-xs capitalize"
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Quality Presets</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {['low', 'medium', 'high', 'ultra'].map(preset => (
                      <Button
                        key={preset}
                        size="sm"
                        variant="outline"
                        onClick={() => applyPerformancePreset(preset)}
                        className="text-xs capitalize"
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quality Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">LOD Distance ({qualitySettings.lodDistance}m)</Label>
                  <Slider
                    value={[qualitySettings.lodDistance]}
                    onValueChange={(value) => updateQualitySetting('lodDistance', value[0])}
                    min={10}
                    max={200}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs">Culling Distance ({qualitySettings.cullingDistance}m)</Label>
                  <Slider
                    value={[qualitySettings.cullingDistance]}
                    onValueChange={(value) => updateQualitySetting('cullingDistance', value[0])}
                    min={30}
                    max={200}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs">Max Draw Calls ({qualitySettings.maxDrawCalls})</Label>
                  <Slider
                    value={[qualitySettings.maxDrawCalls]}
                    onValueChange={(value) => updateQualitySetting('maxDrawCalls', value[0])}
                    min={200}
                    max={2000}
                    step={50}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'enableInstancing', label: 'GPU Instancing' },
                    { key: 'enableFrustumCulling', label: 'Frustum Culling' },
                    { key: 'enableOcclusion', label: 'Occlusion Culling' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center gap-2">
                      <Switch
                        checked={qualitySettings[setting.key]}
                        onCheckedChange={(checked) => updateQualitySetting(setting.key, checked)}
                        id={setting.key}
                      />
                      <Label htmlFor={setting.key} className="text-xs">
                        {setting.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default WorldAssetsManager
