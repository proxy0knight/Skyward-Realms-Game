
<old_str>import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Play, Settings, Info, LogIn, Sparkles, Sword, Shield, Crown } from 'lucide-react'
import './MainMenu.css'

const MainMenu = ({ onStartGame, onAdminAccess }) => {
  return (
    <div className="game-header relative overflow-hidden">
      {/* Enhanced animated background with multiple layers */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        {/* Primary magical orbs */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Secondary magical orbs */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 left-10 w-28 h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.8s' }}></div>
      </div>

      {/* Floating magical particles */}
      <div className="fixed inset-0 pointer-events-none">
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
              className="text-purple-300 opacity-60" 
              size={8 + Math.random() * 12}
            />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-4 py-8">
        {/* Enhanced Logo Section */}
        <div className="flex flex-col items-center justify-center w-full max-w-2xl">
          {/* Magical logo container */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-full blur-2xl animate-pulse" />
            <img
              src="/assets/images/game-logo.png"
              alt="Skyward Realms Logo"
              className="relative z-10 w-24 h-24 mx-auto mb-2 drop-shadow-2xl animate-pulse"
              style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))' }}
            />
            {/* Floating crown above logo */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Crown className="w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>

          {/* Enhanced game title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
              عوالم السماء
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-300 mb-2 drop-shadow-lg">Skyward Realms</h2>
            <p className="text-sm md:text-base text-gray-400 mb-4 max-w-md mx-auto leading-relaxed">
              انطلق في رحلة ملحمية عبر عوالم العناصر السحرية واكتشف قوى لا محدودة
            </p>
            <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-gray-500">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>لعبة أدوار ثلاثية الأبعاد</span>
              <Sparkles className="w-3 h-3 animate-pulse" />
            </div>
          </div>

          {/* Enhanced action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <Button
              onClick={onStartGame}
              size="lg"
              className="menu-button enhanced group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-base md:text-lg">ابدأ المغامرة</span>
                <Sword className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </Button>

            <Button
              onClick={onAdminAccess}
              variant="outline"
              size="lg"
              className="menu-button enhanced group relative overflow-hidden bg-black/30 border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm md:text-base">لوحة التحكم</span>
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              </div>
            </Button>
          </div>

          {/* Game features showcase */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-300">
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🔥</span>
                </div>
                <span className="text-xs text-gray-300">عنصر النار</span>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/20 hover:border-blue-500/40 transition-colors duration-300">
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">💧</span>
                </div>
                <span className="text-xs text-gray-300">عنصر الماء</span>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-green-500/20 hover:border-green-500/40 transition-colors duration-300">
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🌿</span>
                </div>
                <span className="text-xs text-gray-300">عنصر الأرض</span>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-gray-400/20 hover:border-gray-400/40 transition-colors duration-300">
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 bg-gradient-to-r from-gray-400 to-blue-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">💨</span>
                </div>
                <span className="text-xs text-gray-300">عنصر الهواء</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}</old_str>
<new_str>import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Play, Settings, Info, LogIn, Sparkles, Sword, Shield, Crown, Zap, Globe, Star, Gamepad2 } from 'lucide-react'
import './MainMenu.css'

const MainMenu = ({ onStartGame, onAdminAccess }) => {
  return (
    <div className="game-header relative overflow-hidden min-h-screen">
      {/* Ultra Enhanced Animated Background */}
      <div className="fixed inset-0 opacity-50 pointer-events-none">
        {/* Primary magical constellation */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Secondary magical auras */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-3/4 left-3/4 w-24 h-24 bg-gradient-to-r from-lime-400 via-green-500 to-emerald-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.8s' }}></div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute animate-bounce opacity-70"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`
            }}
          >
            {i % 4 === 0 && <Sparkles className="text-purple-300" size={6 + Math.random() * 8} />}
            {i % 4 === 1 && <Star className="text-cyan-300" size={4 + Math.random() * 6} />}
            {i % 4 === 2 && <Zap className="text-yellow-300" size={5 + Math.random() * 7} />}
            {i % 4 === 3 && <Globe className="text-emerald-300" size={4 + Math.random() * 6} />}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-6 py-12">
        {/* Ultra Enhanced Logo Section */}
        <div className="flex flex-col items-center justify-center w-full max-w-4xl">
          {/* Magical logo container with multiple glows */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse scale-150" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse scale-125" style={{ animationDelay: '0.5s' }} />
            
            <img
              src="/assets/images/game-logo.png"
              alt="Skyward Realms Logo"
              className="relative z-10 w-32 h-32 mx-auto drop-shadow-2xl hover:scale-110 transition-transform duration-500"
              style={{ filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))' }}
            />
            
            {/* Orbiting elements */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDuration: '2s' }}>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 animate-spin" style={{ animationDuration: '8s' }}>
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 animate-spin" style={{ animationDuration: '6s' }}>
              <Star className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          {/* Ultra Enhanced Title Section */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse hover:scale-105 transition-transform duration-500">
              عوالم السماء
            </h1>
            <h2 className="text-3xl md:text-4xl text-gray-200 mb-4 drop-shadow-xl font-bold tracking-wide">
              Skyward Realms
            </h2>
            <div className="max-w-2xl mx-auto">
              <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed font-medium">
                انطلق في رحلة ملحمية عبر عوالم العناصر السحرية واكتشف قوى لا محدودة
              </p>
              <div className="flex items-center justify-center gap-4 text-sm md:text-base text-gray-400">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 animate-pulse" />
                  <span>لعبة أدوار ثلاثية الأبعاد</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>عالم مفتوح</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ultra Enhanced Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-lg mb-8">
            <Button
              onClick={onStartGame}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-3xl transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 shadow-2xl hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                <Play className="w-6 h-6 group-hover:scale-125 transition-transform duration-500" />
                <span className="text-lg md:text-xl">ابدأ المغامرة</span>
                <Sword className="w-5 h-5 text-yellow-300 group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </Button>

            <Button
              onClick={onAdminAccess}
              variant="outline"
              size="lg"
              className="group relative overflow-hidden bg-black/40 border-2 border-purple-500/60 text-purple-300 hover:bg-purple-500/30 hover:border-purple-400 font-semibold py-4 px-8 rounded-3xl transition-all duration-500 hover:scale-105 backdrop-blur-lg shadow-xl hover:shadow-purple-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                <Shield className="w-5 h-5 group-hover:scale-125 transition-transform duration-500" />
                <span className="text-base md:text-lg">لوحة التحكم</span>
                <Settings className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              </div>
            </Button>
          </div>

          {/* Ultra Enhanced Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
            {[
              { name: 'عنصر النار', icon: '🔥', gradient: 'from-red-500 to-orange-500', border: 'border-red-500/30 hover:border-red-400/60' },
              { name: 'عنصر الماء', icon: '💧', gradient: 'from-blue-500 to-cyan-500', border: 'border-blue-500/30 hover:border-blue-400/60' },
              { name: 'عنصر الأرض', icon: '🌿', gradient: 'from-green-500 to-emerald-500', border: 'border-green-500/30 hover:border-green-400/60' },
              { name: 'عنصر الهواء', icon: '💨', gradient: 'from-gray-400 to-blue-300', border: 'border-gray-400/30 hover:border-gray-300/60' }
            ].map((element, i) => (
              <div 
                key={i} 
                className={`bg-black/30 backdrop-blur-lg rounded-xl p-4 border ${element.border} transition-all duration-500 hover:scale-105 hover:bg-black/40 cursor-pointer group`}
              >
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 bg-gradient-to-r ${element.gradient} rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-500 shadow-lg`}>
                    <span className="text-white text-sm font-bold">{element.icon}</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-300 font-medium">{element.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}</old_str>
