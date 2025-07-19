import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { X, Download, Eye, Trash2, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'
import './InventoryPanel.css'

const ExternalAssetPanel = ({ isOpen, onClose, gameEngine }) => {
  const [assetUrl, setAssetUrl] = useState('')
  const [assetType, setAssetType] = useState('gltf')
  const [assetName, setAssetName] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadedAssets, setLoadedAssets] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const assetTypes = [
    { value: 'gltf', label: 'GLTF/GLB', description: 'Modern 3D format with animations' },
    { value: 'obj', label: 'OBJ', description: 'Simple 3D format, no animations' },
    { value: 'fbx', label: 'FBX', description: 'Autodesk format with animations' }
  ]

  const exampleAssets = [
    {
      name: 'Fantasy Sword (GLB)',
      url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
      type: 'gltf',
      description: 'Damaged helmet example from Three.js'
    },
    {
      name: 'Simple Cube (GLB)',
      url: 'https://threejs.org/examples/models/gltf/Box/glTF/Box.gltf',
      type: 'gltf',
      description: 'Simple box example from Three.js'
    }
  ]

  const assetSources = [
    {
      name: 'Sketchfab',
      url: 'https://sketchfab.com/3d-models',
      description: 'High-quality 3D models (some free)',
      icon: '🎨'
    },
    {
      name: 'Free3D',
      url: 'https://free3d.com/',
      description: 'Free 3D models',
      icon: '🆓'
    },
    {
      name: 'TurboSquid',
      url: 'https://www.turbosquid.com/',
      description: 'Professional 3D models (paid)',
      icon: '💎'
    },
    {
      name: 'CGTrader',
      url: 'https://www.cgtrader.com/',
      description: '3D models marketplace',
      icon: '🛒'
    },
    {
      name: 'AmbientCG',
      url: 'https://ambientcg.com/',
      description: 'Free PBR textures',
      icon: '🎨'
    }
  ]

  useEffect(() => {
    if (!isOpen) {
      setAssetUrl('')
      setAssetName('')
      setError('')
      setSuccess('')
      setLoadingProgress(0)
    }
  }, [isOpen])

  const loadAsset = async () => {
    if (!assetUrl.trim() || !gameEngine?.assetManager) {
      setError('Please enter a valid URL and ensure game engine is available')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')
    setLoadingProgress(0)

    try {
      const assetId = assetName || `external_${Date.now()}`
      
      const asset = await gameEngine.assetManager.loadExternalModel(
        assetUrl,
        assetType,
        {
          id: assetId,
          onProgress: (progress) => {
            setLoadingProgress(progress.loaded / progress.total * 100)
          }
        }
      )

      setLoadedAssets(prev => [...prev, {
        id: assetId,
        name: assetName || 'External Asset',
        type: assetType,
        url: assetUrl,
        asset: asset
      }])

      setSuccess(`Asset loaded successfully: ${assetId}`)
      setAssetUrl('')
      setAssetName('')
      setLoadingProgress(0)
    } catch (err) {
      setError(`Failed to load asset: ${err.message}`)
      setLoadingProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const spawnAsset = (assetId) => {
    if (!gameEngine?.scene) return

    try {
      const asset = gameEngine.assetManager.getAsset(assetId)
      if (!asset) {
        setError(`Asset not found: ${assetId}`)
        return
      }

      const instance = gameEngine.assetManager.createModelInstance(assetId, {
        position: new THREE.Vector3(
          Math.random() * 20 - 10,
          0,
          Math.random() * 20 - 10
        )
      })

      gameEngine.scene.add(instance)
      setSuccess(`Asset spawned: ${assetId}`)
    } catch (err) {
      setError(`Failed to spawn asset: ${err.message}`)
    }
  }

  const removeAsset = (assetId) => {
    setLoadedAssets(prev => prev.filter(asset => asset.id !== assetId))
    
    if (gameEngine?.assetManager) {
      // Note: This would need to be implemented in AssetManager
      // gameEngine.assetManager.removeAsset(assetId)
    }
  }

  const loadExampleAsset = (example) => {
    setAssetUrl(example.url)
    setAssetType(example.type)
    setAssetName(example.name)
  }

  const openAssetSource = (source) => {
    window.open(source.url, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="external-asset-panel">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">External Asset Loader</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Asset Sources */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Asset Sources</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {assetSources.map((source) => (
                <Button
                  key={source.name}
                  variant="outline"
                  size="sm"
                  onClick={() => openAssetSource(source)}
                  className="justify-start"
                >
                  <span className="mr-2">{source.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{source.name}</div>
                    <div className="text-xs text-muted-foreground">{source.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Load Asset Form */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Load External Asset</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asset-url">Asset URL</Label>
                <Input
                  id="asset-url"
                  placeholder="https://example.com/model.glb"
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="asset-type">File Type</Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="asset-name">Asset Name (Optional)</Label>
              <Input
                id="asset-name"
                placeholder="My Custom Asset"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
            </div>

            <Button 
              onClick={loadAsset} 
              disabled={isLoading || !assetUrl.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Load Asset
                </>
              )}
            </Button>

            {isLoading && (
              <div className="space-y-2">
                <Label>Loading Progress</Label>
                <Progress value={loadingProgress} className="w-full" />
                <div className="text-sm text-muted-foreground">
                  {Math.round(loadingProgress)}% complete
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* Example Assets */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Example Assets</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleAssets.map((example) => (
                <Button
                  key={example.name}
                  variant="outline"
                  size="sm"
                  onClick={() => loadExampleAsset(example)}
                  className="justify-start"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{example.name}</div>
                    <div className="text-xs text-muted-foreground">{example.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Loaded Assets */}
          {loadedAssets.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Loaded Assets</Label>
              <div className="space-y-2">
                {loadedAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{asset.type.toUpperCase()}</Badge>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => spawnAsset(asset.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ExternalAssetPanel 