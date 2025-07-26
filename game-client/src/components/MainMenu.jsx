
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Settings, 
  Info, 
  Sword, 
  Shield, 
  Zap,
  Crown,
  Trophy,
  Sparkles
} from 'lucide-react'

const MainMenu = ({ onStartGame, onSettings, onAbout, onAdminAccess }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl floating" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Game Info */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Beta Version
                </Badge>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Skyward Realms
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Embark on an epic journey through mystical realms. Master the elements, 
                forge alliances, and become the ultimate champion in this immersive 3D fantasy world.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card className="glass border-blue-500/20 bg-blue-500/5">
                  <CardContent className="p-4 text-center">
                    <Sword className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-1">Epic Combat</h3>
                    <p className="text-sm text-slate-400">Master elemental abilities</p>
                  </CardContent>
                </Card>
                
                <Card className="glass border-purple-500/20 bg-purple-500/5">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-1">Rich Lore</h3>
                    <p className="text-sm text-slate-400">Discover ancient secrets</p>
                  </CardContent>
                </Card>
                
                <Card className="glass border-cyan-500/20 bg-cyan-500/5">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-1">Multiplayer</h3>
                    <p className="text-sm text-slate-400">Join epic adventures</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right side - Menu Actions */}
          <div className="space-y-6">
            <Card className="glass gradient-border">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Game Menu
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Choose your path to adventure
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button 
                  onClick={onStartGame}
                  className="w-full btn-primary h-14 text-lg pulse-glow"
                  size="lg"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Adventure
                </Button>
                
                <Separator className="bg-slate-700" />
                
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={onSettings}
                    variant="outline"
                    className="h-12 glass border-slate-600 hover:border-blue-500/50 hover:bg-blue-500/10 text-white"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings & Preferences
                  </Button>
                  
                  <Button 
                    onClick={onAbout}
                    variant="outline"
                    className="h-12 glass border-slate-600 hover:border-purple-500/50 hover:bg-purple-500/10 text-white"
                  >
                    <Info className="w-5 h-5 mr-3" />
                    About & Credits
                  </Button>
                  
                  {onAdminAccess && (
                    <Button 
                      onClick={onAdminAccess}
                      variant="outline"
                      className="h-12 glass border-slate-600 hover:border-red-500/50 hover:bg-red-500/10 text-white"
                    >
                      <Crown className="w-5 h-5 mr-3" />
                      Admin Dashboard
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick stats or news */}
            <Card className="glass border-slate-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Latest Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">New elemental abilities added</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Performance optimizations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Enhanced map editor</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainMenu
