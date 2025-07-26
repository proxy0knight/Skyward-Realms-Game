import { Button } from '@/components/ui/button.jsx'
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
}

export default MainMenu

