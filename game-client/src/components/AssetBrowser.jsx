import React, { useState, useMemo, useRef, useEffect } from 'react'
import Modal from './ui/modal.jsx'
import { get, del } from 'idb-keyval'

const AssetBrowser = ({ assets, onSelectAsset, onDeleteAsset, selectedAsset }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState('grid')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterTag, setFilterTag] = useState('')
  const [editAsset, setEditAsset] = useState(null)
  const [editCategory, setEditCategory] = useState('')
  const [editTags, setEditTags] = useState('')

  const allCategories = Array.from(new Set(assets.map(a => a.category).filter(Boolean)))
  const allTags = Array.from(new Set(assets.flatMap(a => a.tags || [])))

  const getFileIcon = (type) => {
    switch (type) {
      case 'model': return '🎭'
      case 'texture': return '🖼️'
      case 'audio': return '🎵'
      default: return '📄'
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleEditClick = (asset) => {
    setEditAsset(asset)
    setEditCategory(asset.category || '')
    setEditTags((asset.tags || []).join(', '))
  }

  // Babylon.js preview for GLB/GLTF
  const ModelPreview = ({ asset }) => {
    const canvasRef = useRef(null)
    useEffect(() => {
      if (!asset || asset.type !== 'model' || !asset.id) return
      let engine, scene
      get(asset.id).then(base64 => {
        if (!base64) return
        import('@babylonjs/core').then(BABYLON => {
          engine = new BABYLON.Engine(canvasRef.current, true)
          scene = new BABYLON.Scene(engine)
          const camera = new BABYLON.ArcRotateCamera('cam', Math.PI/2, Math.PI/2.5, 3, BABYLON.Vector3.Zero(), scene)
          camera.attachControl(canvasRef.current, true)
          new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0,1,0), scene)
          BABYLON.SceneLoader.ImportMesh('', '', base64, scene, () => {
            engine.runRenderLoop(() => scene.render())
          })
        })
      })
      return () => { engine && engine.dispose() }
    }, [asset])
    return <canvas ref={canvasRef} style={{ width: 240, height: 180, background: '#222', borderRadius: 8 }} />
  }

  const handleEditSave = () => {
    if (!editAsset) return
    const updatedAssets = assets.map(a =>
      a.id === editAsset.id
        ? { ...a, category: editCategory, tags: editTags.split(',').map(t => t.trim()).filter(Boolean) }
        : a
    )
    localStorage.setItem('skyward_assets', JSON.stringify(updatedAssets))
    setEditAsset(null)
    setEditCategory('')
    setEditTags('')
    window.location.reload() // Quick way to refresh UI; in a real app, use state management
  }

  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || asset.type === filterType
      const matchesCategory = filterCategory === 'all' || asset.category === filterCategory
      const matchesTag = !filterTag || (asset.tags && asset.tags.includes(filterTag))
      return matchesSearch && matchesType && matchesCategory && matchesTag
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'size':
          return b.size - a.size
        case 'date':
        default:
          return new Date(b.uploadDate) - new Date(a.uploadDate)
      }
    })
  }, [assets, searchTerm, filterType, sortBy, filterCategory, filterTag])

  const handleDeleteAsset = async (asset, e) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      await del(asset.id)
      onDeleteAsset(asset.id)
    }
  }

  const AssetCard = ({ asset }) => (
    <div
      className={`bg-black/20 rounded-lg border transition-all duration-200 cursor-pointer ${
        selectedAsset?.id === asset.id
          ? 'border-purple-400 bg-purple-500/20'
          : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10'
      }`}
      onClick={() => onSelectAsset(asset)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getFileIcon(asset.type)}</span>
            <div className="text-sm">
              <div className="text-white font-medium truncate">{asset.name}</div>
              <div className="text-purple-300 text-xs">{asset.type.toUpperCase()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleEditClick(asset) }}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Edit asset"
            >
              ✏️
            </button>
            <button
              onClick={(e) => handleDeleteAsset(asset, e)}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Delete asset"
            >
              🗑️
            </button>
          </div>
        </div>
        {/* Category and Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {asset.category && <span className="px-2 py-0.5 rounded bg-purple-700 text-white text-xs">{asset.category}</span>}
          {(asset.tags || []).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded bg-purple-900 text-purple-300 text-xs">{tag}</span>
          ))}
        </div>
        
        <div className="space-y-1 text-xs text-purple-300">
          <div>Size: {formatFileSize(asset.size)}</div>
          <div>File: {asset.fileName}</div>
          <div>Uploaded: {formatDate(asset.uploadDate)}</div>
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <span className={`px-2 py-1 rounded text-xs ${
            asset.loaded ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            {asset.loaded ? '✓ Loaded' : '○ Not Loaded'}
          </span>
          {asset.optimized && (
            <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">
              ⚡ Optimized
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const AssetRow = ({ asset }) => (
    <div
      className={`bg-black/20 rounded-lg border p-4 transition-all duration-200 cursor-pointer ${
        selectedAsset?.id === asset.id
          ? 'border-purple-400 bg-purple-500/20'
          : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10'
      }`}
      onClick={() => onSelectAsset(asset)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <span className="text-2xl">{getFileIcon(asset.type)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium truncate">{asset.name}</div>
            <div className="text-purple-300 text-sm">{asset.fileName}</div>
          </div>
          <div className="text-purple-300 text-sm">{asset.type.toUpperCase()}</div>
          <div className="text-purple-300 text-sm">{formatFileSize(asset.size)}</div>
          <div className="text-purple-300 text-sm">{formatDate(asset.uploadDate)}</div>
        </div>
        {/* Category and Tags */}
        <div className="flex flex-wrap gap-1 ml-4">
          {asset.category && <span className="px-2 py-0.5 rounded bg-purple-700 text-white text-xs">{asset.category}</span>}
          {(asset.tags || []).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded bg-purple-900 text-purple-300 text-xs">{tag}</span>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <span className={`px-2 py-1 rounded text-xs ${
            asset.loaded ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            {asset.loaded ? '✓' : '○'}
          </span>
          {asset.optimized && (
            <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">⚡</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleEditClick(asset) }}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="Edit asset"
          >
            ✏️
          </button>
          <button
            onClick={(e) => handleDeleteAsset(asset, e)}
            className="text-red-400 hover:text-red-300 transition-colors ml-2"
            title="Delete asset"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-white">📂 Asset Browser</h2>
            <p className="text-purple-300 text-sm">
              {filteredAndSortedAssets.length} of {assets.length} assets
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-black/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
                }`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
                }`}
              >
                ☰ List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              🔍 Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets..."
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
            />
          </div>
          {/* Filter by Type */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              📁 Type Filter
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Types</option>
              <option value="model">🎭 3D Models</option>
              <option value="texture">🖼️ Textures</option>
              <option value="audio">🎵 Audio</option>
            </select>
          </div>
          {/* Filter by Category */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              🏷️ Category
            </label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* Filter by Tag */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              🏷️ Tag
            </label>
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          {/* Quick Actions */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              ⚡ Quick Actions
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setSortBy('date')
                  setFilterCategory('all')
                  setFilterTag('')
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Display */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        {filteredAndSortedAssets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-white text-lg mb-2">No assets found</div>
            <div className="text-purple-300">
              {assets.length === 0 
                ? 'Upload some assets to get started!' 
                : 'Try adjusting your search or filters.'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAndSortedAssets.map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedAssets.map(asset => (
                  <AssetRow key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Asset Info */}
      {selectedAsset && (
        <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-400 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Selected Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-300">Name:</span>
                <span className="text-white">{selectedAsset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">File:</span>
                <span className="text-white">{selectedAsset.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Type:</span>
                <span className="text-white">{selectedAsset.type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Size:</span>
                <span className="text-white">{formatFileSize(selectedAsset.size)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-300">Uploaded:</span>
                <span className="text-white">{formatDate(selectedAsset.uploadDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Status:</span>
                <span className={selectedAsset.loaded ? 'text-green-400' : 'text-gray-400'}>
                  {selectedAsset.loaded ? '✓ Loaded' : '○ Not Loaded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Optimized:</span>
                <span className={selectedAsset.optimized ? 'text-blue-400' : 'text-gray-400'}>
                  {selectedAsset.optimized ? '⚡ Yes' : '○ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">ID:</span>
                <span className="text-white font-mono text-xs">{selectedAsset.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAsset && (
        <Modal onClose={() => setEditAsset(null)}>
          <div className="p-6 bg-black/90 rounded-xl max-w-md mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Edit Asset</h2>
            {editAsset.type === 'model' && editAsset.data && (
              <div className="mb-4 flex flex-col items-center">
                <div className="mb-2 text-purple-300 text-xs">3D Preview</div>
                <ModelPreview asset={editAsset} />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-300 mb-1">Category</label>
              <input
                type="text"
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={editTags}
                onChange={e => setEditTags(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditAsset(null)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              >Cancel</button>
              <button
                onClick={handleEditSave}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AssetBrowser