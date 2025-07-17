import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Play, Settings, Info, LogIn } from 'lucide-react'

const MainMenu = ({ onStartGame }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Card className="relative z-10 w-full max-w-md mx-4 bg-black/40 backdrop-blur-lg border-purple-500/30">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
            <div className="text-3xl font-bold text-white">SR</div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
            Skyward Realms
          </CardTitle>
          <p className="text-lg text-purple-300">Echo of Elements</p>
          <p className="text-sm text-gray-400">
            استكشف عالماً سحرياً مليئاً بالعناصر الطبيعية
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button 
            onClick={onStartGame}
            className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-3 text-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            بدء اللعبة
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            <LogIn className="mr-2 h-5 w-5" />
            تسجيل الدخول بـ Google
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Settings className="mr-2 h-4 w-4" />
              الإعدادات
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Info className="mr-2 h-4 w-4" />
              حول اللعبة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MainMenu

