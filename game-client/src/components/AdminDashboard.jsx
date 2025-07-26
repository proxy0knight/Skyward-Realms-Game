import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Map,
  Upload,
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
  Monitor,
  Zap,
  HardDrive,
  Cpu,
  Activity
} from 'lucide-react'

// Import sub-components
import MapEditor from './MapEditor'
import AssetUploader from './AssetUploader'
import PerformanceMonitor from './PerformanceMonitor'

const AdminDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 67,
    storage: 23,
    network: 89
  })

  useEffect(() => {
    // Simulate real-time system monitoring
    const interval = setInterval(() => {
      setSystemStats({
        cpu: Math.floor(Math.random() * 30) + 40,
        memory: Math.floor(Math.random() * 20) + 60,
        storage: Math.floor(Math.random() * 10) + 20,
        network: Math.floor(Math.random() * 15) + 80
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'map-editor', label: 'Map Editor', icon: Map },
    { id: 'assets', label: 'Assets', icon: Upload },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'performance', label: 'Performance', icon: Monitor },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const quickStats = [
    { label: 'Active Players', value: '1,247', change: '+12%', color: 'text-green-400' },
    { label: 'Total Maps', value: '89', change: '+5%', color: 'text-blue-400' },
    { label: 'Assets Loaded', value: '2,156', change: '+8%', color: 'text-purple-400' },
    { label: 'Server Uptime', value: '99.9%', change: '+0.1%', color: 'text-cyan-400' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl floating" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onBack}
              variant="outline"
              className="glass border-slate-600 hover:border-blue-500/50 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-400">Manage and monitor your game world</p>
            </div>
          </div>

          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="glass border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`text-sm font-medium ${stat.color}`}>
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass border-slate-700/50 bg-slate-800/50 p-1">
            {adminTabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-slate-400 hover:text-white transition-colors"
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Health */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass gradient-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    System Health
                  </CardTitle>
                  <CardDescription>Real-time server performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        CPU Usage
                      </span>
                      <span className="text-sm text-white">{systemStats.cpu}%</span>
                    </div>
                    <Progress value={systemStats.cpu} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Memory
                      </span>
                      <span className="text-sm text-white">{systemStats.memory}%</span>
                    </div>
                    <Progress value={systemStats.memory} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Storage
                      </span>
                      <span className="text-sm text-white">{systemStats.storage}%</span>
                    </div>
                    <Progress value={systemStats.storage} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Network
                      </span>
                      <span className="text-sm text-white">{systemStats.network}%</span>
                    </div>
                    <Progress value={systemStats.network} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription>Latest admin actions and system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Map editor accessed</p>
                        <p className="text-xs text-slate-400">2 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Assets uploaded successfully</p>
                        <p className="text-xs text-slate-400">5 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Performance optimized</p>
                        <p className="text-xs text-slate-400">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map-editor">
            <Card className="glass border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Map className="w-5 h-5 text-blue-400" />
                  World Map Editor
                </CardTitle>
                <CardDescription>Design and modify game worlds</CardDescription>
              </CardHeader>
              <CardContent>
                <MapEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <Card className="glass border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-400" />
                  Asset Management
                </CardTitle>
                <CardDescription>Upload and manage game assets</CardDescription>
              </CardHeader>
              <CardContent>
                <AssetUploader />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  User Management
                </CardTitle>
                <CardDescription>Manage players and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">User management features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="glass border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  Performance Monitor
                </CardTitle>
                <CardDescription>Monitor system performance and optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceMonitor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-yellow-400" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system preferences and options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Settings panel coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard