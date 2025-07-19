import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowLeft, Sparkles, Flame, Droplets, Mountain, Wind } from 'lucide-react'

const CharacterSelection = ({ elements, selectedElement, onSelectElement, onStartGame, onBack }) => {
  const getElementIcon = (elementId) => {
    switch (elementId) {
      case 'fire': return Flame
      case 'water': return Droplets
      case 'earth': return Mountain
      case 'air': return Wind
      default: return Sparkles
    }
  }

  const getElementImage = (elementId) => {
    switch (elementId) {
      case 'fire': return '/assets/images/fire_elemental.jpg'
      case 'water': return '/assets/images/water_magic.jpg'
      case 'earth': return '/assets/images/earth_elemental.jpg'
      case 'air': return '/assets/images/air_elemental.jpg'
      default: return '/assets/images/elements_four.jpg'
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2 relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-500 rounded-full blur-2xl animate-pulse delay-500"></div>
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
          {elements.slice(0, 4).map((element) => {
            const IconComponent = element.icon
            const isSelected = selectedElement?.id === element.id
            return (
              <Card
                key={element.id}
                className={`relative flex flex-row h-56 cursor-pointer transition-all duration-300 transform hover:scale-105 group ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-600/40 to-orange-600/40 border-2 border-orange-500 shadow-lg shadow-orange-500/50 scale-105'
                    : 'bg-black/60 backdrop-blur-xl border-gray-600/30 hover:border-purple-500/70 hover:bg-black/80'
                }`}
                onClick={() => onSelectElement(element)}
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
                        src={getElementImage(element.id)}
                        alt={element.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Element Icon Overlay */}
                    <div
                      className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border border-white shadow-sm"
                      style={{ backgroundColor: `${element.color}20`, borderColor: element.color }}
                    >
                      <IconComponent
                        className="h-3 w-3"
                        style={{ color: element.color }}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-lg text-white font-bold mb-1 text-center w-full">{element.name}</CardTitle>
                </div>
                {/* Right: Info */}
                <div className="flex flex-col justify-center w-1/2 p-3">
                  <p className="text-gray-300 text-xs sm:text-sm text-center leading-relaxed mb-2">
                    {element.description}
                  </p>
                  <h4 className="text-xs font-semibold text-purple-300 text-center mb-1">القدرات:</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {element.abilities.map((ability, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-gray-600 text-gray-300 hover:border-purple-500 transition-colors"
                      >
                        {ability}
                      </Badge>
                    ))}
                  </div>
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

