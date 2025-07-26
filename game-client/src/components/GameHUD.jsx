import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Heart,
  Zap,
  Shield,
  Sword,
  Star,
  Settings,
  Map,
  Backpack,
  Users,
  MessageCircle,
  Menu,
  X,
  Target,
  Coins
} from 'lucide-react'

const GameHUD = ({ player, onOpenInventory, onOpenMap, onOpenSettings }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Quest completed: Water Temple', type: 'success' },
    { id: 2, text: 'New ability unlocked!', type: 'info' }
  ])

  if (!player) return null

  const healthPercent = (player.health / player.maxHealth) * 100
  const manaPercent = (player.mana / player.maxMana) * 100
  const expPercent = (player.experience / player.experienceToNext) * 100

  return (
    <>
      {/* Main HUD Container */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Player Info */}
            <Card className="glass border-slate-700/50 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{player.name}</h3>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        Lv.{player.level}
                      </Badge>
                    </div>

                    {/* Health Bar */}
                    <div className="flex items-center gap-2 min-w-48">
                      <Heart className="w-4 h-4 text-red-400" />
                      <Progress value={healthPercent} className="h-2 flex-1" />
                      <span className="text-xs text-white min-w-12">
                        {player.health}/{player.maxHealth}
                      </span>
                    </div>

                    {/* Mana Bar */}
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <Progress value={manaPercent} className="h-2 flex-1" />
                      <span className="text-xs text-white min-w-12">
                        {player.mana}/{player.maxMana}
                      </span>
                    </div>

                    {/* Experience Bar */}
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <Progress value={expPercent} className="h-2 flex-1" />
                      <span className="text-xs text-white min-w-12">
                        {Math.floor(expPercent)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mini Map */}
            <Card className="glass border-slate-700/50 backdrop-blur-md">
              <CardContent className="p-3">
                <div className="w-32 h-32 bg-slate-800/50 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-2 border border-slate-600 rounded">
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-400 rounded-full"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-red-400 rounded-full"></div>
                  </div>
                  <div className="absolute bottom-1 left-1 right-1">
                    <p className="text-xs text-slate-400 text-center">Mini Map</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <Card className="glass border-slate-700/50 backdrop-blur-md">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {/* Quick Action Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-slate-600 hover:border-blue-500/50 text-white w-12 h-12"
                  onClick={onOpenInventory}
                >
                  <Backpack className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-slate-600 hover:border-green-500/50 text-white w-12 h-12"
                  onClick={onOpenMap}
                >
                  <Map className="w-5 h-5" />
                </Button>

                <Separator orientation="vertical" className="h-8 bg-slate-600" />

                {/* Ability Slots */}
                {player.element?.abilities?.slice(0, 4).map((ability, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="glass border-slate-600 hover:border-purple-500/50 text-white w-12 h-12"
                  >
                    <span className="text-sm font-bold">{index + 1}</span>
                  </Button>
                ))}

                <Separator orientation="vertical" className="h-8 bg-slate-600" />

                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-slate-600 hover:border-yellow-500/50 text-white w-12 h-12"
                  onClick={onOpenSettings}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Menu Toggle */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            className="glass border-slate-600 hover:border-blue-500/50 text-white w-12 h-12"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Side Panel */}
        {isMenuOpen && (
          <div className="absolute top-4 right-16 w-80 pointer-events-auto">
            <Card className="glass border-slate-700/50 backdrop-blur-md">
              <CardContent className="p-4 space-y-4">
                {/* Quick Stats */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Character Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Sword className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-slate-400">Attack</span>
                      </div>
                      <p className="text-white font-bold">125</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-slate-400">Defense</span>
                      </div>
                      <p className="text-white font-bold">98</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-slate-400">Magic</span>
                      </div>
                      <p className="text-white font-bold">156</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-slate-400">Gold</span>
                      </div>
                      <p className="text-white font-bold">2,847</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Notifications */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Recent Activity
                  </h4>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 rounded-lg border text-sm ${
                          notification.type === 'success' 
                            ? 'bg-green-500/10 border-green-500/20 text-green-300'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                        }`}
                      >
                        {notification.text}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="glass border-slate-600 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Party
                  </Button>
                  <Button variant="outline" size="sm" className="glass border-slate-600 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Element Indicator */}
        {player.element && (
          <div className="absolute bottom-4 left-4 pointer-events-auto">
            <Card className="glass border-slate-700/50 backdrop-blur-md">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: player.element.color + '20', border: `1px solid ${player.element.color}40` }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: player.element.color }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Element</p>
                    <p className="text-sm text-white font-semibold">{player.element.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}

export default GameHUD