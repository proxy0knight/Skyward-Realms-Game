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
  BookOpen,
  Crown,
  Sparkles,
  Target,
  Clock,
  Activity,
  Volume2,
  Wifi,
  Battery,
  Compass,
  TrendingUp,
  Award,
  Eye,
  MessageCircle,
  Bell,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { useState, useEffect } from 'react'

const GameHUD = ({ player, onTogglePanel, activePanel }) => {
  const [viewport, setViewport] = useState({ width: 1024, height: 768 })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    if (typeof window !== 'undefined') {
      updateViewport()
      window.addEventListener('resize', updateViewport)
      return () => window.removeEventListener('resize', updateViewport)
    }
  }, [])

  const isMobile = viewport.width < 640
  const isTablet = viewport.width >= 640 && viewport.width < 1024
  const isDesktop = viewport.width >= 1024

  const getElementIcon = (elementId) => {
    switch (elementId) {
      case 'fire': return Flame
      case 'water': return Droplets
      case 'earth': return Mountain
      case 'air': return Wind
      default: return Star
    }
  }

  const getElementColor = (elementId) => {
    switch (elementId) {
      case 'fire': return '#FF4500'
      case 'water': return '#1E90FF'
      case 'earth': return '#8B4513'
      case 'air': return '#87CEEB'
      default: return '#8A2BE2'
    }
  }

  const getElementGradient = (elementId) => {
    switch (elementId) {
      case 'fire': return 'from-red-500 via-orange-500 to-yellow-500'
      case 'water': return 'from-blue-500 via-cyan-500 to-teal-500'
      case 'earth': return 'from-green-600 via-emerald-500 to-lime-500'
      case 'air': return 'from-gray-400 via-blue-300 to-cyan-300'
      default: return 'from-purple-500 via-pink-500 to-indigo-500'
    }
  }

  const ElementIcon = player?.element ? getElementIcon(player.element.id) : Star
  const elementColor = player?.element ? getElementColor(player.element.id) : '#8A2BE2'
  const elementGradient = player?.element ? getElementGradient(player.element.id) : 'from-purple-500 via-pink-500 to-indigo-500'

  // Mock player data if not provided
  const playerData = player || {
    name: 'محارب العناصر',
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 80,
    maxMana: 100,
    experience: 65,
    experienceToNext: 100,
    attack: 45,
    defense: 32,
    element: { id: 'fire', name: 'النار', color: '#FF4500' }
  }

  return (
    <>
      {/* Responsive Magical Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-5 opacity-20">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            <Sparkles 
              className="text-purple-300" 
              size={4 + Math.random() * 8}
            />
          </div>
        ))}
      </div>

      {/* Responsive Top Bar - Game Status & System Info */}
      <div className="fixed top-0 left-0 right-0 z-30 p-2 sm:p-4">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between p-2 sm:p-4">
              {/* Left: Game Info - Responsive */}
              <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-white font-bold text-sm sm:text-base lg:text-lg">عوالم السماء</h1>
                    <p className="text-gray-300 text-xs lg:text-sm">Skyward Realms</p>
                  </div>
                </div>
                
                <div className="hidden lg:block h-6 lg:h-8 w-px bg-purple-500/30" />
                
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 animate-pulse" />
                    <span className="text-white text-xs sm:text-sm font-mono">15:42</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 animate-pulse" />
                    <span className="text-white text-xs sm:text-sm">غابة العناصر</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1 sm:gap-2">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 animate-pulse" />
                    <span className="text-white text-xs sm:text-sm">استكشاف</span>
                  </div>
                </div>
              </div>

              {/* Right: System Status - Responsive */}
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="hidden lg:flex items-center gap-2 lg:gap-3">
                  <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <div className="flex items-center gap-1">
                    <Battery className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                    <span className="text-white text-xs">98%</span>
                  </div>
                </div>
                
                <div className="hidden lg:block h-4 lg:h-6 w-px bg-purple-500/30" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Player Stats Panel - Adapts to viewport */}
      <div className="fixed top-16 sm:top-20 lg:top-24 right-2 sm:right-4 z-20" data-ui-element="player-stats">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 border border-purple-500/20 shadow-2xl w-64 sm:w-72 lg:w-80 xl:w-96 relative overflow-hidden">
          {/* Background glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${elementGradient} opacity-5 rounded-2xl sm:rounded-3xl`} />
          
          {/* Floating particles inside panel */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  top: `${20 + i * 25}%`,
                  left: `${15 + i * 20}%`,
                  animationDelay: `${i * 0.7}s`,
                }}
              >
                <div 
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                  style={{ backgroundColor: elementColor, opacity: 0.4 }}
                />
              </div>
            ))}
          </div>

          {/* Player Header - Responsive */}
          <div className="relative z-10 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="relative group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 group-hover:scale-105 transition-transform duration-300">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-white drop-shadow-lg" />
                  </div>
                  {playerData.element && (
                    <div 
                      className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse"
                      style={{ backgroundColor: elementColor }}
                    >
                      <ElementIcon className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                    </div>
                  )}
                  {/* Level crown */}
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-yellow-500 rounded-full flex items-center justify-center border border-yellow-300 shadow-lg">
                    <Crown className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-900" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <h3 className="text-white font-bold text-sm sm:text-lg lg:text-xl drop-shadow-lg truncate">{playerData.name}</h3>
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-400 animate-pulse flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs sm:text-sm font-bold px-2 py-1">
                      المستوى {playerData.level}
                    </Badge>
                    {playerData.element && (
                      <Badge 
                        variant="outline" 
                        className="text-xs sm:text-sm border-opacity-50 text-white bg-black/30 px-2 py-1"
                        style={{ borderColor: elementColor }}
                      >
                        {playerData.element.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0 flex-shrink-0"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Bars - Responsive */}
          <div className="relative z-10 space-y-3 sm:space-y-4 lg:space-y-5">
            {/* Health Bar */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-red-400 animate-pulse" />
                  <span className="text-red-300 font-semibold text-xs sm:text-sm">الصحة</span>
                </div>
                <span className="text-white text-xs sm:text-sm font-bold">{playerData.health}/{playerData.maxHealth}</span>
              </div>
              <div className="relative">
                <Progress 
                  value={(playerData.health / playerData.maxHealth) * 100} 
                  className="h-2 sm:h-3 bg-red-900/30 rounded-full border border-red-500/30" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full opacity-80 animate-pulse" 
                     style={{ width: `${(playerData.health / playerData.maxHealth) * 100}%` }} />
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" 
                     style={{ width: `${(playerData.health / playerData.maxHealth) * 30}%` }} />
              </div>
            </div>

            {/* Mana Bar */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-400 animate-pulse" />
                  <span className="text-blue-300 font-semibold text-xs sm:text-sm">السحر</span>
                </div>
                <span className="text-white text-xs sm:text-sm font-bold">{playerData.mana}/{playerData.maxMana}</span>
              </div>
              <div className="relative">
                <Progress 
                  value={(playerData.mana / playerData.maxMana) * 100} 
                  className="h-2 sm:h-3 bg-blue-900/30 rounded-full border border-blue-500/30" 
                />
                <div className="absolute inset-0 rounded-full opacity-80 animate-pulse"
                     style={{ 
                       width: `${(playerData.mana / playerData.maxMana) * 100}%`,
                       background: `linear-gradient(to right, ${elementColor}AA, ${elementColor}FF)`
                     }} />
                <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" 
                     style={{ width: `${(playerData.mana / playerData.maxMana) * 20}%` }} />
              </div>
            </div>

            {/* Experience Bar */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-yellow-400 animate-pulse" />
                  <span className="text-yellow-300 font-semibold text-xs sm:text-sm">الخبرة</span>
                </div>
                <span className="text-white text-xs sm:text-sm font-bold">{playerData.experience}/{playerData.experienceToNext}</span>
              </div>
              <div className="relative">
                <Progress 
                  value={(playerData.experience / playerData.experienceToNext) * 100} 
                  className="h-2 sm:h-3 bg-yellow-900/30 rounded-full border border-yellow-500/30" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 rounded-full opacity-80 animate-pulse" 
                     style={{ width: `${(playerData.experience / playerData.experienceToNext) * 100}%` }} />
                <div className="absolute inset-0 bg-white/40 rounded-full animate-pulse" 
                     style={{ width: `${(playerData.experience / playerData.experienceToNext) * 15}%` }} />
              </div>
            </div>
          </div>

          {/* Player Stats Grid - Responsive */}
          <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4 lg:mt-6">
            <div className="bg-black/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2">
                <Sword className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs lg:text-sm text-gray-300 font-semibold">الهجوم</span>
              </div>
              <span className="text-white font-bold text-sm sm:text-lg lg:text-xl">{playerData.attack}</span>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-400" />
                <span className="text-green-400 text-xs">+5</span>
              </div>
            </div>
            
            <div className="bg-black/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs lg:text-sm text-gray-300 font-semibold">الدفاع</span>
              </div>
              <span className="text-white font-bold text-sm sm:text-lg lg:text-xl">{playerData.defense}</span>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-400" />
                <span className="text-green-400 text-xs">+3</span>
              </div>
            </div>
          </div>

          {/* Quick Actions - Responsive */}
          <div className="relative z-10 flex gap-2 mt-3 sm:mt-4 lg:mt-6">
            <Button size="sm" className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">المكافآت</span>
            </Button>
            <Button size="sm" variant="outline" className="bg-black/30 border-gray-500/30 text-gray-300 hover:bg-gray-500/20 w-8 sm:w-10">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-black/30 border-gray-500/30 text-gray-300 hover:bg-gray-500/20 w-8 sm:w-10">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Responsive Navigation - Adapts position based on viewport */}
      <div className={`fixed z-20 ${isDesktop ? 'left-4 top-1/2 -translate-y-1/2' : 'bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2'}`} data-ui-element="quick-actions">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-2 sm:p-3 lg:p-4 border border-purple-500/20 shadow-2xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 rounded-2xl sm:rounded-3xl" />
          
          <div className={`relative z-10 flex ${isDesktop ? 'flex-col' : 'flex-row'} items-center gap-2 sm:gap-3`}>
            {[
              { icon: Package, label: 'الحقيبة', panel: 'inventory', color: 'text-green-400', hoverColor: 'hover:bg-green-500/20', bgColor: 'bg-green-500/10' },
              { icon: Map, label: 'الخريطة', panel: 'map', color: 'text-blue-400', hoverColor: 'hover:bg-blue-500/20', bgColor: 'bg-blue-500/10' },
              { icon: BookOpen, label: 'المهام', panel: 'quests', color: 'text-yellow-400', hoverColor: 'hover:bg-yellow-500/20', bgColor: 'bg-yellow-500/10' },
              { icon: User, label: 'المهارات', panel: 'skills', color: 'text-purple-400', hoverColor: 'hover:bg-purple-500/20', bgColor: 'bg-purple-500/10' },
              { icon: Settings, label: 'الإعدادات', panel: 'settings', color: 'text-gray-400', hoverColor: 'hover:bg-gray-500/20', bgColor: 'bg-gray-500/10' }
            ].map((item, index) => {
              const Icon = item.icon
              const isActive = activePanel === item.panel
              return (
                <div key={item.panel} className="relative group">
                  <Button
                    onClick={() => onTogglePanel(item.panel)}
                    variant="ghost"
                    size="sm"
                    className={`
                      relative w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform hover:scale-110 overflow-hidden
                      ${isActive 
                        ? `bg-white/20 border-white/40 scale-105 ${item.bgColor}` 
                        : 'bg-black/20 border-white/10 hover:border-white/30'
                      }
                      ${item.hoverColor}
                    `}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {/* Button glow effect */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl animate-pulse" />
                    )}
                    
                    <Icon className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 ${item.color} group-hover:scale-125 transition-transform duration-300 relative z-10`} />
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full animate-pulse border-2 border-white">
                        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-yellow-600 rounded-full mx-auto mt-0.5 sm:mt-1" />
                      </div>
                    )}
                  </Button>
                  
                  {/* Enhanced Tooltip - Position aware */}
                  <div className={`absolute ${isDesktop ? '-right-16 top-1/2 -translate-y-1/2' : '-top-16 left-1/2 -translate-x-1/2'} opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50`}>
                    <div className="bg-black/90 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl border border-white/20 whitespace-nowrap shadow-2xl">
                      {item.label}
                      <div className={`absolute ${isDesktop ? 'left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-black/90' : 'top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90'}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Responsive Mini Map - Position adapts to viewport */}
      <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 lg:bottom-auto lg:top-1/3 z-20" data-ui-element="mini-map">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-2 sm:p-3 lg:p-4 border border-purple-500/20 shadow-2xl w-40 h-24 sm:w-48 sm:h-28 lg:w-64 lg:h-40 relative overflow-hidden">
          {/* Background effect */}
          <div className="absolute inset-0 bg-gradient-to-tl from-green-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl sm:rounded-3xl" />
          
          <div className="relative z-10 h-full">
            <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <Compass className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-400 animate-pulse" />
                <span className="text-white text-xs sm:text-sm lg:text-base font-bold">الخريطة المصغرة</span>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0.5 sm:p-1 w-4 h-4 sm:w-6 sm:h-6">
                <Target className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
              </Button>
            </div>
            
            {/* Enhanced Mini map area */}
            <div className="w-full flex-1 bg-gradient-to-br from-green-900/40 to-blue-900/40 rounded-lg sm:rounded-xl border border-white/10 relative overflow-hidden mb-1 sm:mb-2" style={{ height: 'calc(100% - 2rem)' }}>
              {/* Player position with pulse effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse border border-white shadow-lg" />
                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75" />
              </div>
              
              {/* Enhanced map elements */}
              <div className="absolute top-1 left-2 sm:top-2 sm:left-3 w-1 h-1 sm:w-2 sm:h-2 bg-green-400 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-1 h-1 sm:w-2 sm:h-2 bg-blue-400 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-2 left-3 sm:bottom-3 sm:left-6 w-1 h-1 sm:w-2 sm:h-2 bg-red-400 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '1.5s' }} />
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-1 h-1 sm:w-2 sm:h-2 bg-purple-400 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '2s' }} />
              
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-px bg-white/30 absolute top-1/3" />
                <div className="w-full h-px bg-white/30 absolute top-2/3" />
                <div className="h-full w-px bg-white/30 absolute left-1/3" />
                <div className="h-full w-px bg-white/30 absolute left-2/3" />
              </div>
            </div>
            
            {/* Map coordinates - Hidden on smallest screens */}
            <div className="hidden sm:flex justify-between items-center text-xs lg:text-sm text-gray-400">
              <span>X: 245</span>
              <span>Y: 378</span>
              <span>Z: 12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Skills Quick Bar - Adapts to available space */}
      <div className="fixed bottom-16 sm:bottom-20 left-2 sm:left-4 lg:bottom-4 z-20" data-ui-element="skills-bar">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-2 sm:p-3 lg:p-4 border border-purple-500/20 shadow-2xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-red-600/10 to-pink-600/10 rounded-2xl sm:rounded-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
              <span className="text-white text-xs sm:text-sm lg:text-base font-bold">مهارات سريعة</span>
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className="relative w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-gray-800/80 border-2 border-gray-600/60 rounded-lg sm:rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-700/80 transition-all duration-200 group overflow-hidden"
                >
                  {slot === 1 && (
                    <div className="relative">
                      <Sword className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-orange-400 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-orange-400/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {slot === 2 && (
                    <div className="relative">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-blue-400/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {slot === 3 && playerData.element && (
                    <div className="relative">
                      <ElementIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 group-hover:scale-110 transition-transform" style={{ color: elementColor }} />
                      <div className="absolute inset-0 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${elementColor}33` }} />
                    </div>
                  )}
                  
                  {/* Slot number */}
                  <span className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-gray-700 text-white text-xs rounded-full px-1 py-0.5 font-mono border border-gray-500">
                    {slot}
                  </span>
                  
                  {/* Cooldown overlay for equipped skills */}
                  {(slot === 1 || slot === 2) && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Ready</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GameHUD

