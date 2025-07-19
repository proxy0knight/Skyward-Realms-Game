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
  Wind,
  BookOpen
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
      {/* Top Right - Player Stats */}
      <div className="absolute top-4 right-40 z-20" data-ui-element="player-stats">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/10 shadow-lg flex flex-col gap-4 min-w-[220px] max-w-[320px]">
          {/* Player Name & Level */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              {player.element && (
                <div 
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-white"
                  style={{ backgroundColor: player.element.color }}
                >
                  <ElementIcon className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{player.name}</h3>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                <Badge variant="outline" className="text-xs border-purple-500 text-purple-300 bg-purple-500/20 px-2 py-0.5">
                  Lv.{player.level}
                </Badge>
                {player.element && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-orange-500 text-orange-300 bg-orange-500/20 px-2 py-0.5"
                  >
                    <ElementIcon className="mr-1 h-2 w-2" />
                    {player.element.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Health Bar */}
          <div className="space-y-1 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-xs text-white">الصحة</span>
              </div>
              <span className="text-xs text-gray-300 font-mono">{player.health}/{player.maxHealth}</span>
            </div>
            <Progress 
              value={(player.health / player.maxHealth) * 100} 
              className="h-2 bg-gray-700/50"
            />
          </div>

          {/* Mana Bar */}
          <div className="space-y-1 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-white">الطاقة</span>
              </div>
              <span className="text-xs text-gray-300 font-mono">{player.mana}/{player.maxMana}</span>
            </div>
            <Progress 
              value={(player.mana / player.maxMana) * 100} 
              className="h-2 bg-gray-700/50"
            />
          </div>

          {/* Experience Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-white">الخبرة</span>
              </div>
              <span className="text-xs text-gray-300 font-mono">{player.experience}/{player.experienceToNext}</span>
            </div>
            <Progress 
              value={(player.experience / player.experienceToNext) * 100} 
              className="h-2 bg-gray-700/50"
            />
          </div>
        </div>
        {/* Settings Buttons under Player Stats */}
        <div className="mt-4 bg-black/20 backdrop-blur-sm rounded-2xl p-2 border border-purple-500/10 shadow-lg flex gap-3 justify-center">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Side - Action Buttons */}
      <div className="absolute top-4 right-4 z-20" data-ui-element="action-buttons">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-2 border border-purple-500/10 shadow-lg flex flex-col gap-3">
          <Button
            size="sm"
            variant="ghost"
            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 transition-all duration-200 p-2 h-8 w-8"
          >
            <Sword className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-200 p-2 h-8 w-8"
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="hover:bg-purple-500/20 transition-all duration-200 p-2 h-8 w-8"
            style={{ color: player.element ? player.element.color : '#ffffff' }}
          >
            <ElementIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Left Side - Panel Buttons */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20" data-ui-element="panel-buttons">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3 border border-purple-500/10 shadow-lg flex flex-col gap-4">
          <Button
            onClick={() => onTogglePanel('inventory')}
            size="sm"
            variant="ghost"
            className={`h-10 w-10 p-0 ${activePanel === 'inventory' ? 'bg-purple-500/60 text-white' : 'text-gray-300 hover:text-white hover:bg-purple-500/40'}`}
          >
            <Package className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => onTogglePanel('skills')}
            size="sm"
            variant="ghost"
            className={`h-10 w-10 p-0 ${activePanel === 'skills' ? 'bg-purple-500/60 text-white' : 'text-gray-300 hover:text-white hover:bg-purple-500/40'}`}
          >
            <Sword className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => onTogglePanel('map')}
            size="sm"
            variant="ghost"
            className={`h-10 w-10 p-0 ${activePanel === 'map' ? 'bg-purple-500/60 text-white' : 'text-gray-300 hover:text-white hover:bg-purple-500/40'}`}
          >
            <Map className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => onTogglePanel('quests')}
            size="sm"
            variant="ghost"
            className={`h-10 w-10 p-0 ${activePanel === 'quests' ? 'bg-purple-500/60 text-white' : 'text-gray-300 hover:text-white hover:bg-purple-500/40'}`}
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Bottom Left - Skills Bar */}
      <div className="absolute bottom-4 left-4 z-20" data-ui-element="skills-bar">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3 border border-purple-500/10 shadow-lg flex gap-4">
          {[1, 2, 3, 4, 5].map((slot) => (
            <div
              key={slot}
              className="relative w-12 h-12 bg-gray-800/80 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-700/80 transition-all duration-200 group"
            >
              {slot === 1 && <Sword className="h-5 w-5 text-orange-400 group-hover:scale-110 transition-transform" />}
              {slot === 2 && <Shield className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />}
              {slot === 3 && player.element && <ElementIcon className="h-5 w-5 group-hover:scale-110 transition-transform" style={{ color: player.element.color }} />}
              <span className="absolute -bottom-1 -right-1 text-xs bg-gray-700 text-white rounded px-1 font-mono">
                {slot}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default GameHUD

