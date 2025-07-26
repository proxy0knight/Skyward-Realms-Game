import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { X, MapPin, Users, Flame, Droplets, Mountain, Wind, Crown, Sword } from 'lucide-react'
import './InventoryPanel.css'

const MapPanel = ({ isOpen, onClose }) => {
  const mapRegions = [
    {
      id: 'fire_realm',
      name: 'عالم النار',
      icon: Flame,
      color: '#FF4500',
      position: { x: 75, y: 25 },
      description: 'أراضي بركانية مليئة بالحمم والمخلوقات النارية',
      level: '15-25',
      bosses: ['تنين الحمم', 'عفريت النار الأكبر']
    },
    {
      id: 'water_realm',
      name: 'عالم الماء',
      icon: Droplets,
      color: '#1E90FF',
      position: { x: 25, y: 75 },
      description: 'محيطات عميقة وجزر عائمة مع مخلوقات مائية',
      level: '10-20',
      bosses: ['كراكن الأعماق', 'ملكة الجليد']
    },
    {
      id: 'earth_realm',
      name: 'عالم الأرض',
      icon: Mountain,
      color: '#8B4513',
      position: { x: 25, y: 25 },
      description: 'جبال شاهقة وكهوف عميقة مليئة بالكنوز',
      level: '5-15',
      bosses: ['عملاق الصخر', 'ملك الكهوف']
    },
    {
      id: 'air_realm',
      name: 'عالم الهواء',
      icon: Wind,
      color: '#E6E6FA',
      position: { x: 75, y: 75 },
      description: 'جزر عائمة في السماء مع عواصف سحرية',
      level: '20-30',
      bosses: ['ملك العواصف', 'طائر الرعد الأسطوري']
    }
  ]

  const players = [
    { id: 1, name: 'أحمد', position: { x: 50, y: 50 }, element: 'fire', level: 12 },
    { id: 2, name: 'فاطمة', position: { x: 30, y: 40 }, element: 'water', level: 15 },
    { id: 3, name: 'محمد', position: { x: 60, y: 70 }, element: 'earth', level: 8 },
  ]

  const getElementIcon = (elementId) => {
    switch (elementId) {
      case 'fire': return Flame
      case 'water': return Droplets
      case 'earth': return Mountain
      case 'air': return Wind
      default: return MapPin
    }
  }

  const getElementColor = (elementId) => {
    switch (elementId) {
      case 'fire': return '#FF4500'
      case 'water': return '#1E90FF'
      case 'earth': return '#8B4513'
      case 'air': return '#E6E6FA'
      default: return '#888888'
    }
  }

  if (!isOpen) return null

  return (
    <div className="hud-panel-glass absolute top-2 sm:top-4 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-96 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-lg z-20" data-ui-element="map-panel">
      <Card className="h-full bg-transparent border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl text-white">خريطة العالم</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* Map Display */}
          <div className="relative bg-gradient-to-br from-blue-900/30 to-green-900/30 rounded-lg border border-gray-600 aspect-square">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="text-gray-500">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Regions */}
            {mapRegions.map((region) => {
              const RegionIcon = region.icon
              return (
                <div
                  key={region.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ 
                    left: `${region.position.x}%`, 
                    top: `${region.position.y}%` 
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 group-hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: `${region.color}30`, 
                      borderColor: region.color 
                    }}
                  >
                    <RegionIcon 
                      className="h-4 w-4" 
                      style={{ color: region.color }}
                    />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {region.name}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Players */}
            {players.map((player) => {
              const PlayerIcon = getElementIcon(player.element)
              return (
                <div
                  key={player.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${player.position.x}%`, 
                    top: `${player.position.y}%` 
                  }}
                >
                  <div className="relative">
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center border"
                      style={{ 
                        backgroundColor: getElementColor(player.element), 
                        borderColor: '#ffffff' 
                      }}
                    >
                      <Users className="h-2 w-2 text-white" />
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <div className="bg-black/80 text-white text-xs rounded px-1 whitespace-nowrap">
                        {player.name} ({player.level})
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Player Position (You) */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: '50%', top: '50%' }}
            >
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                <MapPin className="h-3 w-3 text-white" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                <Badge className="bg-yellow-500 text-black text-xs">
                  أنت
                </Badge>
              </div>
            </div>
          </div>

          {/* Region Details */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">مناطق العالم</h4>
            {mapRegions.map((region) => {
              const RegionIcon = region.icon
              return (
                <div
                  key={region.id}
                  className="bg-gray-800/60 rounded-lg p-3 border border-gray-600 hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                      style={{ 
                        backgroundColor: `${region.color}30`, 
                        borderColor: region.color 
                      }}
                    >
                      <RegionIcon 
                        className="h-4 w-4" 
                        style={{ color: region.color }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-white font-medium">{region.name}</h5>
                        <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                          مستوى {region.level}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{region.description}</p>
                      
                      <div className="space-y-1">
                        <h6 className="text-xs font-medium text-purple-300">الزعماء:</h6>
                        <div className="flex flex-wrap gap-1">
                          {region.bosses.map((boss, index) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="text-xs border-red-500 text-red-300"
                            >
                              <Crown className="mr-1 h-2 w-2" />
                              {boss}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Online Players */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">اللاعبون المتصلون</h4>
            {players.map((player) => {
              const PlayerIcon = getElementIcon(player.element)
              return (
                <div
                  key={player.id}
                  className="bg-gray-800/60 rounded-lg p-3 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getElementColor(player.element) }}
                      >
                        <PlayerIcon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-white">{player.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                      مستوى {player.level}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MapPanel

