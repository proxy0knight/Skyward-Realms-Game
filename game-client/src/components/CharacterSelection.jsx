
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Play, 
  Droplets, 
  Flame, 
  Wind, 
  Mountain,
  Sparkles,
  Shield,
  Zap,
  Heart
} from 'lucide-react'

const elements = [
  {
    id: 'water',
    name: 'عنصر الماء',
    description: 'الشفاء والتحكم في الماء والجليد.',
    color: '#1E90FF',
    abilities: ['شفاء', 'جدار جليدي', 'تسونامي'],
    icon: Droplets,
    image: '/assets/images/water_magic.jpg',
    stats: { attack: 70, defense: 85, magic: 95, speed: 60 },
    gradient: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'fire',
    name: 'عنصر النار',
    description: 'قوة تدميرية وهجمات نارية مدمرة.',
    color: '#FF4500',
    abilities: ['كرة نار', 'انفجار لهب', 'عاصفة نار'],
    icon: Flame,
    image: '/assets/images/fire_elemental.jpg',
    stats: { attack: 95, defense: 60, magic: 85, speed: 70 },
    gradient: 'from-red-500 to-orange-400'
  },
  {
    id: 'earth',
    name: 'عنصر الأرض',
    description: 'دفاع قوي وتحكم في الصخور والأرض.',
    color: '#8B4513',
    abilities: ['جدار صخري', 'زلزال', 'درع الأرض'],
    icon: Mountain,
    image: '/assets/images/earth_elemental.jpg',
    stats: { attack: 75, defense: 95, magic: 60, speed: 50 },
    gradient: 'from-amber-600 to-yellow-500'
  },
  {
    id: 'air',
    name: 'عنصر الهواء',
    description: 'سرعة عالية وتحكم في الرياح والعواصف.',
    color: '#87CEEB',
    abilities: ['إعصار', 'ضربة ريح', 'طيران'],
    icon: Wind,
    image: '/assets/images/air_elemental.jpg',
    stats: { attack: 80, defense: 55, magic: 75, speed: 95 },
    gradient: 'from-sky-400 to-indigo-400'
  }
]

const CharacterSelection = ({ onSelectElement, onBack }) => {
  const [selectedElement, setSelectedElement] = useState(null)
  const [hoveredElement, setHoveredElement] = useState(null)

  const handleConfirm = () => {
    if (selectedElement) {
      onSelectElement(selectedElement)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/5 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={onBack}
            variant="outline"
            className="glass border-slate-600 hover:border-blue-500/50 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Choose Your Element
            </h1>
            <p className="text-slate-400">Select your magical affinity to begin your journey</p>
          </div>
          
          <div className="w-32"></div>
        </div>

        {/* Element Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {elements.map((element) => {
            const IconComponent = element.icon
            const isSelected = selectedElement?.id === element.id
            const isHovered = hoveredElement?.id === element.id
            
            return (
              <Card 
                key={element.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected 
                    ? 'glass gradient-border pulse-glow' 
                    : 'glass border-slate-700/50 hover:border-slate-600'
                }`}
                onClick={() => setSelectedElement(element)}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${element.gradient} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-white text-lg mb-2">
                    {element.name}
                  </CardTitle>
                  
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    {element.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Attack
                      </span>
                      <span className="text-sm text-white">{element.stats.attack}</span>
                    </div>
                    <Progress value={element.stats.attack} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Defense
                      </span>
                      <span className="text-sm text-white">{element.stats.defense}</span>
                    </div>
                    <Progress value={element.stats.defense} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Magic
                      </span>
                      <span className="text-sm text-white">{element.stats.magic}</span>
                    </div>
                    <Progress value={element.stats.magic} className="h-2" />
                  </div>

                  {/* Abilities */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white">Core Abilities:</h4>
                    <div className="flex flex-wrap gap-1">
                      {element.abilities.map((ability, index) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className="text-xs bg-slate-700/50 text-slate-300"
                        >
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-xs text-blue-300 text-center">✨ Element Selected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Selection Details */}
        {selectedElement && (
          <Card className="glass gradient-border max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
                <selectedElement.icon className="w-8 h-8" style={{color: selectedElement.color}} />
                {selectedElement.name}
              </CardTitle>
              <CardDescription className="text-lg text-slate-300">
                {selectedElement.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center">
              <p className="text-slate-400 mb-6">
                You have chosen the path of {selectedElement.name}. This element focuses on unique abilities 
                and playstyle that will shape your entire adventure.
              </p>
              
              <Button 
                onClick={handleConfirm}
                className="btn-primary h-12 px-8 text-lg pulse-glow"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Begin Adventure
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CharacterSelection
