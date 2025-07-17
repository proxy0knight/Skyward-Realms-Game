import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowLeft, Sparkles } from 'lucide-react'

const CharacterSelection = ({ elements, selectedElement, onSelectElement, onStartGame, onBack }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-4">
            اختر عنصرك
          </h1>
          <p className="text-gray-300 text-lg">
            كل عنصر له قدرات ومهارات فريدة. اختر بحكمة!
          </p>
        </div>

        {/* Elements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {elements.map((element) => {
            const IconComponent = element.icon
            const isSelected = selectedElement?.id === element.id
            
            return (
              <Card 
                key={element.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-purple-600/30 to-orange-600/30 border-2 border-orange-500 shadow-lg shadow-orange-500/25' 
                    : 'bg-black/40 backdrop-blur-lg border-gray-600/30 hover:border-purple-500/50'
                }`}
                onClick={() => onSelectElement(element)}
              >
                <CardHeader className="text-center">
                  <div 
                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${element.color}20`, border: `2px solid ${element.color}` }}
                  >
                    <IconComponent 
                      className="h-8 w-8" 
                      style={{ color: element.color }}
                    />
                  </div>
                  <CardTitle className="text-xl text-white">{element.name}</CardTitle>
                  {isSelected && (
                    <Badge className="bg-orange-500 text-white">
                      <Sparkles className="mr-1 h-3 w-3" />
                      مختار
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm text-center">
                    {element.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-purple-300">القدرات الأساسية:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {element.abilities.map((ability, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs border-gray-600 text-gray-300"
                        >
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Selected Element Details */}
        {selectedElement && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-orange-900/50 backdrop-blur-lg border-orange-500/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${selectedElement.color}30`, border: `2px solid ${selectedElement.color}` }}
                  >
                    <selectedElement.icon 
                      className="h-6 w-6" 
                      style={{ color: selectedElement.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">عنصر {selectedElement.name}</h3>
                    <p className="text-gray-300">{selectedElement.description}</p>
                  </div>
                </div>
                <Badge className="bg-orange-500 text-white">
                  جاهز للبدء
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button 
            onClick={onBack}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة
          </Button>
          
          <Button 
            onClick={onStartGame}
            disabled={!selectedElement}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            ابدأ المغامرة
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CharacterSelection

