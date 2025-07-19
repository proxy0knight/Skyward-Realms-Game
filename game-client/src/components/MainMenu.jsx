import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Play, Settings, Info, LogIn } from 'lucide-react'
import './MainMenu.css'

const MainMenu = ({ onStartGame, onAdminAccess }) => {
  return (
    <div className="game-header relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-orange-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-green-500 rounded-full blur-2xl animate-pulse delay-1500"></div>
      </div>

      <div className="relative z-10 flex flex-row items-center justify-center w-full min-h-screen">
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center" style={{ width: '50vw', height: '100vh', minWidth: 260, maxWidth: 600 }}>
          <img
            src="/assets/images/game-logo.png"
            alt="Skyward Realms: Echo of Elements"
            className="game-logo"
            style={{ width: '50vw', maxWidth: 400, minWidth: 200, height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
          />
          <h1 className="game-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-2">Skyward Realms</h1>
          <p className="game-subtitle text-lg sm:text-xl md:text-2xl mb-3">Echo of Elements</p>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col items-stretch justify-center space-y-8 pl-8" style={{ width: '50vw', minWidth: 220, maxWidth: 400, height: '100vh' }}>
          <Button
            onClick={onStartGame}
            className="menu-button primary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full"
          >
            <img
              src="/assets/images/play-icon.png"
              alt="Play"
              className="menu-button-icon w-5 h-5 sm:w-6 sm:h-6"
            />
            بدء اللعبة
          </Button>
          <Button className="menu-button text-sm sm:text-base px-4 sm:px-6 py-2 w-full">
            <LogIn className="menu-button-icon w-4 h-4 sm:w-5 sm:h-5" />
            تسجيل الدخول بـ Google
          </Button>
          <Button className="menu-button text-sm sm:text-base px-4 sm:px-6 py-2 w-full">
            <img
              src="/assets/images/settings-icon.png"
              alt="Settings"
              className="menu-button-icon w-4 h-4 sm:w-5 sm:h-5"
            />
            الإعدادات
          </Button>
          <Button className="menu-button text-sm sm:text-base px-4 sm:px-6 py-2 w-full">
            <img
              src="/assets/images/info-icon.png"
              alt="Info"
              className="menu-button-icon w-4 h-4 sm:w-5 sm:h-5"
            />
            حول اللعبة
          </Button>
          <Button 
            onClick={onAdminAccess}
            className="menu-button text-sm sm:text-base px-4 sm:px-6 py-2 w-full"
          >
            <Settings className="menu-button-icon w-4 h-4 sm:w-5 sm:h-5" />
            Admin Panel
          </Button>
        </div>
      </div>

      {/* Version Info */}
      <div className="mt-8 text-xs text-gray-500 text-center">
        Version 1.0.0 - Beta
      </div>
    </div>
  )
}

export default MainMenu

