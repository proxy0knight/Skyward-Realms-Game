import { useState, useEffect } from 'react'
import { Sparkles, Star, Zap, Flame, Droplets, Mountain, Wind, Crown } from 'lucide-react'

const LoadingScreen = ({ progress = 0, currentTask = "تحميل عالم العناصر السحري..." }) => {
  const [particles, setParticles] = useState([])
  const [currentElement, setCurrentElement] = useState(0)

  const elements = [
    { 
      name: 'النار', 
      icon: Flame, 
      color: '#FF4500', 
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      particles: '🔥'
    },
    { 
      name: 'الماء', 
      icon: Droplets, 
      color: '#1E90FF', 
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      particles: '💧'
    },
    { 
      name: 'الأرض', 
      icon: Mountain, 
      color: '#8B4513', 
      gradient: 'from-green-600 via-emerald-500 to-lime-500',
      particles: '🌿'
    },
    { 
      name: 'الهواء', 
      icon: Wind, 
      color: '#87CEEB', 
      gradient: 'from-gray-400 via-blue-300 to-cyan-300',
      particles: '💨'
    }
  ]

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 4,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        element: Math.floor(Math.random() * 4)
      }))
      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  // Cycle through elements
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentElement((prev) => (prev + 1) % elements.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [elements.length])

  const currentElementData = elements[currentElement]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {particles.map((particle) => {
          const element = elements[particle.element]
          return (
            <div
              key={particle.id}
              className="absolute animate-bounce"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.id * 0.1}s`,
                animationDuration: `${particle.speed + 2}s`,
                opacity: particle.opacity
              }}
            >
              <div
                className="rounded-full blur-sm"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: element.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${element.color}50`
                }}
              />
            </div>
          )
        })}

        {/* Magical orbs */}
        <div className="absolute top-20 left-20 w-60 h-60 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-500/40 via-cyan-500/40 to-purple-500/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Game logo/title */}
        <div className="mb-12">
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${currentElementData.gradient} rounded-full animate-spin`} style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                <Crown className="w-10 h-10 text-yellow-400 animate-pulse" />
              </div>
              {/* Element icon overlay */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-white">
                <currentElementData.icon className="w-4 h-4" style={{ color: currentElementData.color }} />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3">
            <span className={`bg-gradient-to-r ${currentElementData.gradient} bg-clip-text text-transparent animate-pulse`}>
              عوالم السماء
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">Skyward Realms</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>لعبة الأدوار السحرية الملحمية</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        {/* Current element showcase */}
        <div className="mb-8 p-6 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <currentElementData.icon 
              className="w-8 h-8 animate-pulse" 
              style={{ color: currentElementData.color }} 
            />
            <span className="text-xl font-semibold text-white">
              تحميل عنصر {currentElementData.name}
            </span>
          </div>
          
          <div className="flex justify-center gap-2 mb-4">
            {elements.map((element, index) => {
              const Icon = element.icon
              return (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    index === currentElement 
                      ? 'border-white bg-white/20 scale-110' 
                      : 'border-gray-500 bg-gray-500/10'
                  }`}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: index === currentElement ? element.color : '#gray' }} 
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-300">{currentTask}</span>
            <span className="text-sm font-bold text-white">{progress}%</span>
          </div>
          
          <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full" />
            
            {/* Progress fill */}
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${currentElementData.gradient} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse" />
            </div>
            
            {/* Progress glow */}
            <div 
              className="absolute top-0 left-0 h-full rounded-full blur-sm opacity-60"
              style={{ 
                width: `${progress}%`,
                backgroundColor: currentElementData.color,
                boxShadow: `0 0 20px ${currentElementData.color}80`
              }}
            />
          </div>
        </div>

        {/* Loading text with typewriter effect */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span className="text-sm">تحضير المغامرة...</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {progress < 25 && "تجهيز العوالم السحرية..."}
            {progress >= 25 && progress < 50 && "تحميل الشخصيات والقوى..."}
            {progress >= 50 && progress < 75 && "إعداد المعارك والمهام..."}
            {progress >= 75 && progress < 100 && "اللمسات الأخيرة..."}
            {progress >= 100 && "مرحباً بك في عوالم السماء!"}
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-4">
            {elements.map((element, index) => (
              <div
                key={index}
                className="text-2xl animate-bounce"
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '2s'
                }}
              >
                {element.particles}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating magical sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Star className="w-4 h-4 text-yellow-400 opacity-60" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default LoadingScreen