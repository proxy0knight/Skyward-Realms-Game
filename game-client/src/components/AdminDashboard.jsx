import React, { useState, useEffect } from 'react'
import AssetUploader from './AssetUploader'
import AssetBrowser from './AssetBrowser'
import WorldAssetsManager from './WorldAssetsManager'
import MapEditor from './MapEditor'

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  const [assets, setAssets] = useState([])
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [adminPassword, setAdminPassword] = useState('')

  useEffect(() => {
    // Check if user is already logged in as admin
    const adminStatus = localStorage.getItem('skyward_admin')
    if (adminStatus === 'true') {
      setIsAdmin(true)
      loadAssets()
    }
  }, [])

  const handleAdminLogin = () => {
    // Simple admin authentication (in production, use proper auth)
    if (adminPassword === 'skyward_admin_2024') {
      setIsAdmin(true)
      localStorage.setItem('skyward_admin', 'true')
      loadAssets()
    } else {
      alert('❌ Invalid admin password')
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('skyward_admin')
    setAssets([])
    setSelectedAsset(null)
  }

  const loadAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const assetData = await response.json()
        setAssets(assetData)
      }
    } catch (error) {
      console.log('Loading local assets...')
      // Load assets from localStorage as fallback
      const localAssets = JSON.parse(localStorage.getItem('skyward_assets') || '[]')
      setAssets(localAssets)
    }
  }

  const handleAssetUpload = (newAsset) => {
    const updatedAssets = [...assets, newAsset]
    setAssets(updatedAssets)
    localStorage.setItem('skyward_assets', JSON.stringify(updatedAssets))
  }

  const handleAssetDelete = (assetId) => {
    const updatedAssets = assets.filter(asset => asset.id !== assetId)
    setAssets(updatedAssets)
    localStorage.setItem('skyward_assets', JSON.stringify(updatedAssets))
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-8 w-full max-w-md border border-purple-500/30">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">🛠️ Admin Panel</h1>
            <p className="text-purple-300">Skyward Realms Asset Manager</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/50 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                placeholder="Enter admin password..."
              />
            </div>
            
            <button
              onClick={handleAdminLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              🔐 Login as Admin
            </button>
            
            <div className="text-xs text-purple-400 text-center">
              Default password: skyward_admin_2024
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">🛠️ Skyward Realms</h1>
              <span className="text-purple-300">Asset Management Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-purple-300">
                Assets: <span className="text-white font-semibold">{assets.length}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'browse', name: '📂 Browse Assets', icon: '📂' },
              { id: 'upload', name: '⬆️ Upload Assets', icon: '⬆️' },
              { id: 'preview', name: '👁️ Preview', icon: '👁️' },
              { id: 'world', name: '🌍 3D World Assets', icon: '🌍' },
              { id: 'map', name: '🗺️ Map Editor', icon: '🗺️' },
              { id: 'settings', name: '⚙️ Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-purple-400 hover:text-purple-300 hover:border-purple-500'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            {activeTab === 'browse' && (
              <AssetBrowser
                assets={assets}
                onSelectAsset={setSelectedAsset}
                onDeleteAsset={handleAssetDelete}
                selectedAsset={selectedAsset}
              />
            )}
            
            {activeTab === 'upload' && (
              <AssetUploader
                onAssetUpload={handleAssetUpload}
                onSwitchTab={() => setActiveTab('browse')}
              />
            )}
            
            {activeTab === 'world' && (
              <WorldAssetsManager assets={assets} />
            )}
            
            {activeTab === 'map' && (
              <MapEditor />
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
                <h2 className="text-xl font-bold text-white mb-4">⚙️ Asset Manager Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">📊 Storage Statistics</h3>
                    <div className="bg-black/20 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">Total Assets:</span>
                        <span className="text-white">{assets.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">3D Models:</span>
                        <span className="text-white">{assets.filter(a => a.type === 'model').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">Textures:</span>
                        <span className="text-white">{assets.filter(a => a.type === 'texture').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">Audio Files:</span>
                        <span className="text-white">{assets.filter(a => a.type === 'audio').length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">🔧 Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          localStorage.removeItem('skyward_assets')
                          setAssets([])
                          alert('✅ Asset cache cleared!')
                        }}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        🗑️ Clear Asset Cache
                      </button>
                      
                      <button
                        onClick={() => {
                          const dataStr = JSON.stringify(assets, null, 2)
                          const dataBlob = new Blob([dataStr], { type: 'application/json' })
                          const url = URL.createObjectURL(dataBlob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = 'skyward_assets_backup.json'
                          link.click()
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        💾 Export Assets List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300">🎮 Game Status</span>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300">🌍 World Renderer</span>
                  <span className="text-green-400 text-sm">Optimized</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300">📦 Assets Loaded</span>
                  <span className="text-white text-sm">{assets.filter(a => a.loaded).length}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🕒 Recent Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="text-purple-300">System initialized</div>
                <div className="text-purple-300">Asset manager ready</div>
                <div className="text-purple-300">Optimization active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard