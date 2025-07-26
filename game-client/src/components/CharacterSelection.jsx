import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowLeft, Sparkles, Flame, Droplets, Mountain, Wind, ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

const DEFAULT_ELEMENTS = [
  {
    id: 'fire',
    name: 'عنصر النار',
    description: 'قوة اللهب والحرارة، هجوم قوي وسرعة عالية.',
    color: '#FF4500',
    abilities: ['كرة نار', 'درع اللهب', 'عاصفة نارية'],
    icon: Flame,
    image: '/assets/images/fire_elemental.jpg',
  },
  {
    id: 'water',
    name: 'عنصر الماء',
    description: 'الشفاء والتحكم في الماء والجليد.',
    color: '#1E90FF',
    abilities: ['شفاء', 'جدار جليدي', 'تسونامي'],
    icon: Droplets,
    image: '/assets/images/water_magic.jpg',
  },
  {
    id: 'earth',
    name: 'عنصر الأرض',
    description: 'دفاع قوي وتحكم في الصخور والتربة.',
    color: '#8B4513',
    abilities: ['درع حجري', 'زلزال', 'أشواك حجرية'],
    icon: Mountain,
    image: '/assets/images/earth_elemental.jpg',
  },
  {
    id: 'air',
    name: 'عنصر الهواء',
    description: 'سرعة وخفة وقدرة على الطيران.',
    color: '#87CEEB',
    abilities: ['شفرة ريح', 'طيران', 'إعصار'],
    icon: Wind,
    image: '/assets/images/air_elemental.jpg',
  },
]

const CharacterSelection = ({ selectedElement, onSelectElement, onStartGame, onBack }) => {
  const [characterList, setCharacterList] = useState(DEFAULT_ELEMENTS)
  const [assets, setAssets] = useState([])

  useEffect(() => {
    // Try to load admin-defined characters
    const chars = localStorage.getItem('skyward_world_characters')
    if (chars) {
      const parsed = JSON.parse(chars)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCharacterList(parsed)
        // Load assets for preview images
        const assetList = JSON.parse(localStorage.getItem('skyward_assets') || '[]')
        setAssets(assetList)
        return
      }
    }
    setCharacterList(DEFAULT_ELEMENTS)
  }, [])

  const getCharacterImage = (char) => {
    if (char.modelId && assets.length > 0) {
      const asset = assets.find(a => a.id === char.modelId)
      if (asset && asset.type === 'model') {
        // No thumbnail for GLB, fallback to icon
        return '/assets/images/elements_four.jpg'
      }
    }
    // Fallback to default or provided image
    return char.image || '/assets/images/elements_four.jpg'
  }

  const getElementIcon = (elementId, char) => {
    if (char && char.icon) return char.icon
    switch (elementId) {
      case 'fire': return Flame
      case 'water': return Droplets
      case 'earth': return Mountain
      case 'air': return Wind
      default: return Sparkles
    }
  }

  return (
    <div className="character-selection-container relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-95"></div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJzdGFycyIgeD0iMCIgeT0iMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzhhNWNmNiIgb3BhY2l0eT0iMC4zIi8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMkIi8+Cjwvc3ZnPg==')] opacity-20"></div>

      <div className="character-selection-header relative z-10">
        <button 
          onClick={onBack}
          className="back-button group hover:scale-110 transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          العودة للقائمة
        </button>

        <div className="header-content">
          <h1 className="main-title text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-4">
            اختر عنصرك السحري
          </h1>
          <p className="subtitle text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            كل عنصر يمنحك قوى وقدرات فريدة في عالم السماء المليء بالمغامرات والأسرار
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>اختر بحكمة، فكل عنصر له مسار مختلف</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center justify-center min-h-[80vh] relative z-10 py-2 sm:py-4 px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 animate-pulse">
            اختر عنصرك
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm max-w-[min(90vw,500px)] mx-auto leading-relaxed">
            كل عنصر له قدرات ومهارات فريدة. اختر بحكمة!
          </p>
        </div>

        {/* Elements Grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-6 mb-8" style={{ width: '70vw', maxWidth: 900, minWidth: 320 }}>
          {characterList.slice(0, 4).map((char, idx) => {
            const IconComponent = getElementIcon(char.id, char)
            const isSelected = selectedElement?.id === char.id
            return (
              <Card
                key={char.id || idx}
                className={`relative flex flex-row h-56 cursor-pointer transition-all duration-300 transform hover:scale-105 group ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-600/40 to-orange-600/40 border-2 border-orange-500 shadow-lg shadow-orange-500/50 scale-105'
                    : 'bg-black/60 backdrop-blur-xl border-gray-600/30 hover:border-purple-500/70 hover:bg-black/80'
                }`}
                onClick={() => onSelectElement(char)}
              >
                {/* Ribbon for selected */}
                {isSelected && (
                  <div className="absolute left-0 top-4 z-10 flex items-center">
                    <div className="bg-yellow-400 text-white px-2 py-1 rounded-r-lg flex items-center shadow-md">
                      <Sparkles className="w-4 h-4 mr-1" />
                    </div>
                  </div>
                )}
                {/* Left: Image + Name */}
                <div className="flex flex-col items-center justify-center w-1/2 p-3">
                  <div className="relative mb-2">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-purple-500 transition-all duration-300">
                      <img
                        src={getCharacterImage(char)}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Element Icon Overlay */}
                    <div
                      className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border border-white shadow-sm"
                      style={{ backgroundColor: `${char.color || '#fff'}20`, borderColor: char.color || '#fff' }}
                    >
                      <IconComponent
                        className="h-3 w-3"
                        style={{ color: char.color || '#fff' }}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-lg text-white font-bold mb-1 text-center w-full">{char.name}</CardTitle>
                </div>
                {/* Right: Info */}
                <div className="flex flex-col justify-center w-1/2 p-3">
                  <p className="text-gray-300 text-xs sm:text-sm text-center leading-relaxed mb-2">
                    {char.description}
                  </p>
                  {char.abilities && char.abilities.length > 0 && <>
                    <h4 className="text-xs font-semibold text-purple-300 text-center mb-1">القدرات:</h4>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {char.abilities.map((ability, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-300 hover:border-purple-500 transition-colors"
                        >
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </>}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center w-[70vw] max-w-[900px] mx-auto">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-purple-500 transition-all duration-300 px-3 py-1.5"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            العودة
          </Button>
          <Button
            onClick={onStartGame}
            disabled={!selectedElement}
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold px-4 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            ابدأ المغامرة
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CharacterSelection