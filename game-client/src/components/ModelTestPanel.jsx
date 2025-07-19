import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { X, Leaf, Mountain, Building, Zap, Flame, Droplets, Wind } from 'lucide-react'
import './InventoryPanel.css'

const ModelTestPanel = ({ isOpen, onClose, gameEngine }) => {
  const [spawnedModels, setSpawnedModels] = useState([])
  const [spawnedCharacters, setSpawnedCharacters] = useState([])

  const environmentModels = [
    { id: 'tree_pine', name: 'شجرة الصنوبر', icon: Leaf, category: 'trees' },
    { id: 'tree_oak', name: 'شجرة البلوط', icon: Leaf, category: 'trees' },
    { id: 'tree_magic', name: 'الشجرة السحرية', icon: Leaf, category: 'trees' },
    { id: 'rock_large', name: 'صخرة كبيرة', icon: Mountain, category: 'rocks' },
    { id: 'crystal_blue', name: 'كريستال أزرق', icon: Zap, category: 'crystals' },
    { id: 'crystal_red', name: 'كريستال أحمر', icon: Zap, category: 'crystals' },
    { id: 'hut_small', name: 'كوخ صغير', icon: Building, category: 'buildings' },
    { id: 'tower_magic', name: 'برج سحري', icon: Building, category: 'buildings' },
    { id: 'portal_elemental', name: 'بوابة عنصرية', icon: Zap, category: 'portals' },
    { id: 'campfire', name: 'نار المخيم', icon: Flame, category: 'props' },
    { id: 'fountain_healing', name: 'نافورة الشفاء', icon: Droplets, category: 'props' },
    { id: 'altar_elemental', name: 'مذبح عنصري', icon: Wind, category: 'props' }
  ]

  const characterModels = [
    { id: 'eldric', name: 'الحكيم إلدريك', type: 'npc', element: 'neutral' },
    { id: 'pyra', name: 'بايرا', type: 'npc', element: 'fire' },
    { id: 'aqua', name: 'أكوا', type: 'npc', element: 'water' },
    { id: 'terra', name: 'تيرا', type: 'npc', element: 'earth' },
    { id: 'zephyr', name: 'زيفر', type: 'npc', element: 'air' },
    { id: 'shadow_creature', name: 'مخلوق الظل', type: 'enemy', element: 'dark' },
    { id: 'corrupted_elemental', name: 'العنصر الفاسد', type: 'enemy', element: 'corrupted' }
  ]

  const spawnModel = (modelType) => {
    if (!gameEngine || !gameEngine.model3D) return

    // Generate random position around player
    const playerPos = gameEngine.player?.position || { x: 0, z: 0 }
    const angle = Math.random() * Math.PI * 2
    const distance = 10 + Math.random() * 10
    const position = {
      x: playerPos.x + Math.cos(angle) * distance,
      y: 0,
      z: playerPos.z + Math.sin(angle) * distance
    }

    const modelId = `${modelType}_${Date.now()}`
    const model = gameEngine.model3D.addModel(modelId, modelType, position)
    
    if (model) {
      setSpawnedModels(prev => [...prev, { id: modelId, type: modelType, position }])
    }
  }

  const spawnCharacter = (characterData) => {
    if (!gameEngine || !gameEngine.character3D) return

    // Generate random position around player
    const playerPos = gameEngine.player?.position || { x: 0, z: 0 }
    const angle = Math.random() * Math.PI * 2
    const distance = 8 + Math.random() * 8
    const position = {
      x: playerPos.x + Math.cos(angle) * distance,
      y: 0,
      z: playerPos.z + Math.sin(angle) * distance
    }

    const characterId = `${characterData.id}_${Date.now()}`
    const character = gameEngine.character3D.addCharacter(characterId, characterData.type, {
      ...characterData,
      position
    })
    
    if (character) {
      setSpawnedCharacters(prev => [...prev, { id: characterId, ...characterData, position }])
    }
  }

  const removeModel = (modelId) => {
    if (gameEngine && gameEngine.model3D) {
      gameEngine.model3D.removeModel(modelId)
      setSpawnedModels(prev => prev.filter(model => model.id !== modelId))
    }
  }

  const removeCharacter = (characterId) => {
    if (gameEngine && gameEngine.character3D) {
      gameEngine.character3D.removeCharacter(characterId)
      setSpawnedCharacters(prev => prev.filter(char => char.id !== characterId))
    }
  }

  const clearAll = () => {
    if (gameEngine) {
      // Clear models
      spawnedModels.forEach(model => {
        if (gameEngine.model3D) {
          gameEngine.model3D.removeModel(model.id)
        }
      })
      setSpawnedModels([])

      // Clear characters
      spawnedCharacters.forEach(character => {
        if (gameEngine.character3D) {
          gameEngine.character3D.removeCharacter(character.id)
        }
      })
      setSpawnedCharacters([])
    }
  }

  const getElementIcon = (element) => {
    const icons = {
      fire: Flame,
      water: Droplets,
      earth: Mountain,
      air: Wind,
      neutral: Leaf,
      dark: Zap,
      corrupted: Zap
    }
    const IconComponent = icons[element]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null
  }

  const getElementColor = (element) => {
    const colors = {
      fire: '#FF4500',
      water: '#1E90FF',
      earth: '#8B4513',
      air: '#E6E6FA',
      neutral: '#8B7355',
      dark: '#2F2F2F',
      corrupted: '#4B0082'
    }
    return colors[element] || '#888888'
  }

  if (!isOpen) return null

  return (
    <div className="hud-panel-glass fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-black/30 backdrop-blur-sm border-2 border-purple-500/20 rounded-2xl w-full max-w-6xl h-5/6 mx-4 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <h2 className="text-xl font-bold text-white">اختبار النماذج ثلاثية الأبعاد</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Left Panel - Model Categories */}
          <div className="w-1/2 space-y-4">
            {/* Environment Models */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">نماذج البيئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {environmentModels.map((model) => {
                    const IconComponent = model.icon
                    return (
                      <Button
                        key={model.id}
                        onClick={() => spawnModel(model.id)}
                        className="flex items-center gap-2 text-sm"
                        variant="outline"
                      >
                        <IconComponent className="h-4 w-4" />
                        {model.name}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Character Models */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">الشخصيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {characterModels.map((character) => (
                    <Button
                      key={character.id}
                      onClick={() => spawnCharacter(character)}
                      className="flex items-center justify-between w-full text-sm"
                      variant="outline"
                      style={{ borderColor: getElementColor(character.element) + '50' }}
                    >
                      <div className="flex items-center gap-2">
                        {getElementIcon(character.element)}
                        <span>{character.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {character.type}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">التحكم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    onClick={clearAll}
                    className="w-full bg-red-600 hover:bg-red-700"
                    variant="destructive"
                  >
                    مسح الكل
                  </Button>
                  <p className="text-gray-400 text-xs">
                    انقر على أي نموذج لإنشائه حول اللاعب
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Spawned Objects */}
          <div className="w-1/2 space-y-4">
            {/* Spawned Models */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">
                  النماذج المنشأة ({spawnedModels.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-48">
                <div className="space-y-1">
                  {spawnedModels.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-2 rounded border border-purple-500/20 bg-black/20"
                    >
                      <span className="text-white text-sm">
                        {environmentModels.find(m => m.id === model.type)?.name || model.type}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeModel(model.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        حذف
                      </Button>
                    </div>
                  ))}
                  {spawnedModels.length === 0 && (
                    <p className="text-gray-400 text-sm">لا توجد نماذج منشأة</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Spawned Characters */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">
                  الشخصيات المنشأة ({spawnedCharacters.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-48">
                <div className="space-y-1">
                  {spawnedCharacters.map((character) => (
                    <div
                      key={character.id}
                      className="flex items-center justify-between p-2 rounded border border-purple-500/20 bg-black/20"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getElementColor(character.element) }}
                        />
                        <span className="text-white text-sm">{character.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {character.type}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCharacter(character.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        حذف
                      </Button>
                    </div>
                  ))}
                  {spawnedCharacters.length === 0 && (
                    <p className="text-gray-400 text-sm">لا توجد شخصيات منشأة</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">التعليمات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 text-sm space-y-2">
                  <p>• انقر على أي نموذج لإنشائه حول اللاعب</p>
                  <p>• النماذج السحرية تحتوي على تأثيرات متحركة</p>
                  <p>• الشخصيات تتفاعل مع البيئة</p>
                  <p>• استخدم "مسح الكل" لإزالة جميع النماذج</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelTestPanel 