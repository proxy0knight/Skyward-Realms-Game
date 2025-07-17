import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Heart, 
  Zap, 
  Star,
  Package,
  Map,
  Settings,
  User,
  LogOut,
  Sword,
  Shield,
  Flame,
  Droplets,
  Mountain,
  Wind
} from 'lucide-react'

const GameHUD = ({ player, onTogglePanel, activePanel }) => {
  const getElementIcon = (elementId) => {
    switch (elementId) {
      case 'fire': return Flame
      case 'water': return Droplets
      case 'earth': return Mountain
      case 'air': return Wind
      default: return Star
    }
  }

  const ElementIcon = player.element ? getElementIcon(player.element.id) : Star

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-start">
          {/* Player Info */}
          <div className="bg-black/60 backdrop-blur-lg rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{player.name}</h3>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Badge variant="outline" className="text-xs border-purple-500 text-purple-300">
                    المستوى {player.level}
                  </Badge>
                  {player.element && (
                    <Badge 
                      variant="outline" 
                      className="text-xs border-orange-500 text-orange-300"
                    >
                      <ElementIcon className="mr-1 h-3 w-3" />
                      {player.element.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Health Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-white">الصحة</span>
                </div>
                <span className="text-sm text-gray-300">{player.health}/{player.maxHealth}</span>
              </div>
              <Progress 
                value={(player.health / player.maxHealth) * 100} 
                className="h-2 bg-gray-700"
              />
            </div>

            {/* Mana Bar */}
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-white">الطاقة</span>
                </div>
                <span className="text-sm text-gray-300">{player.mana}/{player.maxMana}</span>
              </div>
              <Progress 
                value={(player.mana / player.maxMana) * 100} 
                className="h-2 bg-gray-700"
              />
            </div>

            {/* Experience Bar */}
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-white">الخبرة</span>
                </div>
                <span className="text-sm text-gray-300">{player.experience}/{player.experienceToNext}</span>
              </div>
              <Progress 
                value={(player.experience / player.experienceToNext) * 100} 
                className="h-2 bg-gray-700"
              />
            </div>
          </div>

          {/* Menu Buttons */}
          <div className="bg-black/60 backdrop-blur-lg rounded-lg p-2 border border-purple-500/30">
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="flex justify-between items-end">
          {/* Skills Bar */}
          <div className="bg-black/60 backdrop-blur-lg rounded-lg p-3 border border-purple-500/30">
            <div className="flex space-x-2 rtl:space-x-reverse">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className="w-12 h-12 bg-gray-800/80 border border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  {slot === 1 && <Sword className="h-5 w-5 text-orange-400" />}
                  {slot === 2 && <Shield className="h-5 w-5 text-blue-400" />}
                  {slot === 3 && player.element && <ElementIcon className="h-5 w-5" style={{ color: player.element.color }} />}
                  <span className="absolute -bottom-1 -right-1 text-xs bg-gray-700 text-white rounded px-1">
                    {slot}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Buttons */}
          <div className="bg-black/60 backdrop-blur-lg rounded-lg p-2 border border-purple-500/30">
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                size="sm"
                variant={activePanel === 'inventory' ? 'default' : 'ghost'}
                className={`${
                  activePanel === 'inventory' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/20'
                }`}
                onClick={() => onTogglePanel('inventory')}
              >
                <Package className="h-4 w-4 mr-1" />
                المخزون
              </Button>
              <Button
                size="sm"
                variant={activePanel === 'skills' ? 'default' : 'ghost'}
                className={`${
                  activePanel === 'skills' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/20'
                }`}
                onClick={() => onTogglePanel('skills')}
              >
                <Star className="h-4 w-4 mr-1" />
                المهارات
              </Button>
              <Button
                size="sm"
                variant={activePanel === 'map' ? 'default' : 'ghost'}
                className={`${
                  activePanel === 'map' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/20'
                }`}
                onClick={() => onTogglePanel('map')}
              >
                <Map className="h-4 w-4 mr-1" />
                الخريطة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GameHUD

