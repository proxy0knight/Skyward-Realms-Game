import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ArrowLeft, Settings, Database, Users, BarChart3, Shield } from 'lucide-react'

const AdminPanel = ({ onClose, gameEngine }) => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Admin Dashboard
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
        </div>

        <div className="p-6 h-full overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Game Engine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Engine:</span>
                        <span className="text-purple-400">Babylon.js</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physics:</span>
                        <span className="text-green-400">Cannon.js</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-green-400">Running</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>FPS:</span>
                        <span className="text-blue-400">{gameEngine?.getFPS?.() || 60}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Draw Calls:</span>
                        <span className="text-yellow-400">Optimized</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory:</span>
                        <span className="text-green-400">Good</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Character Models:</span>
                        <span className="text-purple-400">Procedural</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environment:</span>
                        <span className="text-blue-400">Procedural Sky</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physics:</span>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assets">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Database className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Asset Management</h3>
                      <p className="text-gray-400 mb-4">
                        Replace procedural assets with custom GLB models, environment maps, and textures.
                      </p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>📁 Character Models: /public/assets/models/characters/</p>
                        <p>🌍 Environment Maps: /public/textures/</p>
                        <p>🎵 Audio Files: /public/assets/audio/</p>
                        <p>✨ Particle Textures: /public/particles/</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">User Management</h3>
                    <p className="text-gray-400">
                      User management system will be available in future updates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Game Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Game Configuration</h3>
                      <p className="text-gray-400 mb-4">
                        Game settings and configuration options.
                      </p>
                      <div className="text-sm text-gray-500 space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Graphics Quality:</span>
                          <span className="text-green-400">Auto</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Physics Accuracy:</span>
                          <span className="text-blue-400">High</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Asset Fallbacks:</span>
                          <span className="text-purple-400">Enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel 