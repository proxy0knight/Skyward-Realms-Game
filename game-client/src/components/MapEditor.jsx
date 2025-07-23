import React, { useEffect, useState } from 'react'

const MAPS_INDEX_KEY = 'skyward_maps_index'
const MAP_KEY_PREFIX = 'skyward_world_map_'
const TOOL_ASSET_KEY = 'skyward_tool_asset_assignments'
const DEFAULT_SIZE = 32
const DEFAULT_CELL = { type: 'sea', terrainHeightIndex: 0, objects: [], flags: {} }
const TERRAIN_TYPES = [
  { type: 'ground', label: 'Ground', color: '#4ade80', tag: 'Ground' },
  { type: 'water', label: 'Water', color: '#60a5fa', tag: 'Water' },
  { type: 'path', label: 'Path', color: '#fbbf24', tag: 'Path' },
  { type: 'sea', label: 'Sea', color: '#2563eb', tag: 'Sea' }
]
const FLAG_TYPES = [
  { flag: 'spawn', label: 'Player Spawn', color: '#f472b6' },
  { flag: 'tree_spawn', label: 'Tree Spawn', color: '#22d3ee' },
  { flag: 'path', label: 'Path', color: '#fbbf24' },
  { flag: 'teleport', label: 'Teleport', color: '#a78bfa' }
]

function createDefaultMap(size = DEFAULT_SIZE) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ ...DEFAULT_CELL }))
  )
}

const MapEditor = () => {
  const [mapsIndex, setMapsIndex] = useState([])
  const [currentMapId, setCurrentMapId] = useState('')
  const [map, setMap] = useState([])
  const [selectedTerrain, setSelectedTerrain] = useState('ground')
  const [isPainting, setIsPainting] = useState(false)
  const [mode, setMode] = useState('terrain') // 'terrain', 'asset', 'flag'
  const [assets, setAssets] = useState([])
  const [selectedAsset, setSelectedAsset] = useState('')
  const [assetHeightIndex, setAssetHeightIndex] = useState(0)
  const [selectedFlag, setSelectedFlag] = useState('spawn')
  const [toolAssets, setToolAssets] = useState({})
  const [showNewMap, setShowNewMap] = useState(false)
  const [newMapName, setNewMapName] = useState('')
  const [newMapSize, setNewMapSize] = useState(DEFAULT_SIZE)
  const [showTeleportModal, setShowTeleportModal] = useState(false)
  const [teleportSource, setTeleportSource] = useState(null)
  const [teleportDestMap, setTeleportDestMap] = useState('')
  const [teleportTwoWay, setTeleportTwoWay] = useState(true)
  const [startingMapId, setStartingMapId] = useState('')
  const [terrainHeightIndex, setTerrainHeightIndex] = useState(0)
  const [flagHeightIndex, setFlagHeightIndex] = useState(0)

  // Load maps index and current map
  useEffect(() => {
    const idx = JSON.parse(localStorage.getItem(MAPS_INDEX_KEY) || '[]')
    setMapsIndex(idx)
    let mapId = idx.length > 0 ? idx[0].id : 'default'
    if (!idx.length) {
      // Create default map
      mapId = 'default'
      const def = createDefaultMap()
      localStorage.setItem(MAP_KEY_PREFIX + mapId, JSON.stringify(def))
      localStorage.setItem(MAPS_INDEX_KEY, JSON.stringify([{ id: mapId, name: 'World', size: DEFAULT_SIZE }]))
      setMapsIndex([{ id: mapId, name: 'World', size: DEFAULT_SIZE }])
    }
    setCurrentMapId(mapId)
    // Load starting map
    const startId = localStorage.getItem('skyward_starting_map') || mapId
    setStartingMapId(startId)
  }, [])

  // Load current map data
  useEffect(() => {
    if (!currentMapId) return
    const saved = localStorage.getItem(MAP_KEY_PREFIX + currentMapId)
    if (saved) {
      setMap(JSON.parse(saved))
    }
    // Load assets
    const assetList = JSON.parse(localStorage.getItem('skyward_assets') || '[]')
    setAssets(assetList.filter(a => a.type === 'model'))
    // Load tool-asset assignments
    const ta = localStorage.getItem(TOOL_ASSET_KEY)
    if (ta) setToolAssets(JSON.parse(ta))
  }, [currentMapId])

  const saveMap = (mapData = map) => {
    if (!currentMapId) return
    localStorage.setItem(MAP_KEY_PREFIX + currentMapId, JSON.stringify(mapData))
  }

  const paintCell = (x, y) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      if (mode === 'terrain') {
        newMap[y][x].type = selectedTerrain
        newMap[y][x].terrainHeightIndex = terrainHeightIndex
      } else if (mode === 'asset') {
        if (!selectedAsset) return prev
        if (!newMap[y][x].objects) newMap[y][x].objects = []
        newMap[y][x].objects.push({ assetId: selectedAsset, heightIndex: assetHeightIndex })
      } else if (mode === 'flag') {
        newMap[y][x].flags = { ...newMap[y][x].flags, [selectedFlag]: { heightIndex: flagHeightIndex } }
      }
      saveMap(newMap)
      return newMap
    })
  }

  const clearAsset = (x, y, objIdx = null) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      if (objIdx === null) {
        newMap[y][x].objects = []
      } else {
        newMap[y][x].objects.splice(objIdx, 1)
      }
      saveMap(newMap)
      return newMap
    })
  }

  const clearFlag = (x, y, flag) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      if (newMap[y][x].flags) delete newMap[y][x].flags[flag]
      saveMap(newMap)
      return newMap
    })
  }

  // Assign asset to terrain tool
  const handleToolAssetChange = (terrainType, assetId) => {
    const updated = { ...toolAssets, [terrainType]: assetId }
    setToolAssets(updated)
    localStorage.setItem(TOOL_ASSET_KEY, JSON.stringify(updated))
  }

  // Add new map
  const handleAddMap = () => {
    if (!newMapName || !newMapSize) return
    const id = newMapName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    const newMap = createDefaultMap(Number(newMapSize))
    localStorage.setItem(MAP_KEY_PREFIX + id, JSON.stringify(newMap))
    const updatedIdx = [...mapsIndex, { id, name: newMapName, size: Number(newMapSize) }]
    setMapsIndex(updatedIdx)
    localStorage.setItem(MAPS_INDEX_KEY, JSON.stringify(updatedIdx))
    setCurrentMapId(id)
    setShowNewMap(false)
    setNewMapName('')
    setNewMapSize(DEFAULT_SIZE)
  }

  // Remove map
  const handleRemoveMap = (id) => {
    if (!window.confirm('Are you sure you want to delete this map?')) return
    localStorage.removeItem(MAP_KEY_PREFIX + id)
    const updatedIdx = mapsIndex.filter(m => m.id !== id)
    setMapsIndex(updatedIdx)
    localStorage.setItem(MAPS_INDEX_KEY, JSON.stringify(updatedIdx))
    if (updatedIdx.length > 0) setCurrentMapId(updatedIdx[0].id)
    else {
      // If no maps left, create a new default
      const defId = 'default'
      const def = createDefaultMap()
      localStorage.setItem(MAP_KEY_PREFIX + defId, JSON.stringify(def))
      localStorage.setItem(MAPS_INDEX_KEY, JSON.stringify([{ id: defId, name: 'World', size: DEFAULT_SIZE }]))
      setMapsIndex([{ id: defId, name: 'World', size: DEFAULT_SIZE }])
      setCurrentMapId(defId)
    }
  }

  // Place teleport: open modal
  const handleTeleportPlace = (x, y) => {
    setTeleportSource({ x, y, mapId: currentMapId })
    setTeleportDestMap('')
    setTeleportTwoWay(true)
    setShowTeleportModal(true)
  }

  // Confirm teleport placement
  const handleTeleportConfirm = () => {
    if (!teleportSource || !teleportDestMap) return
    // Place teleport in source cell
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      newMap[teleportSource.y][teleportSource.x].flags = {
        ...newMap[teleportSource.y][teleportSource.x].flags,
        teleport: { toMapId: teleportDestMap, twoWay: teleportTwoWay }
      }
      saveMap(newMap)
      return newMap
    })
    // If two-way, add teleport in dest map back to source
    if (teleportTwoWay && teleportDestMap !== currentMapId) {
      const destMapData = JSON.parse(localStorage.getItem(MAP_KEY_PREFIX + teleportDestMap) || '[]')
      // Find first empty cell
      let found = false
      for (let y = 0; y < destMapData.length && !found; y++) {
        for (let x = 0; x < destMapData[0].length && !found; x++) {
          if (!destMapData[y][x].flags || !destMapData[y][x].flags.teleport) {
            destMapData[y][x].flags = {
              ...destMapData[y][x].flags,
              teleport: { toMapId: currentMapId, twoWay: true }
            }
            found = true
            break
          }
        }
      }
      localStorage.setItem(MAP_KEY_PREFIX + teleportDestMap, JSON.stringify(destMapData))
    }
    setShowTeleportModal(false)
    setTeleportSource(null)
  }

  // Remove teleport flag
  const clearTeleport = (x, y) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      if (newMap[y][x].flags) delete newMap[y][x].flags.teleport
      saveMap(newMap)
      return newMap
    })
  }

  // Set as starting map
  const handleSetStartingMap = (id) => {
    setStartingMapId(id)
    localStorage.setItem('skyward_starting_map', id)
  }

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
      <h2 className="text-xl font-bold text-white mb-4">🗺️ Map Editor</h2>
      {/* Map Selector */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <label className="text-purple-300 text-sm">Map:</label>
        <select
          value={currentMapId}
          onChange={e => setCurrentMapId(e.target.value)}
          className="px-3 py-1 rounded-lg border border-purple-500/50 bg-black/40 text-white"
        >
          {mapsIndex.map(m => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.size}x{m.size}){startingMapId === m.id ? ' [Start]' : ''}
            </option>
          ))}
        </select>
        <button
          className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm"
          onClick={() => setShowNewMap(true)}
        >+ New Map</button>
        {mapsIndex.length > 1 && (
          <button
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
            onClick={() => handleRemoveMap(currentMapId)}
          >Delete Map</button>
        )}
        <button
          className={`px-3 py-1 rounded-lg text-white text-sm ${startingMapId === currentMapId ? 'bg-yellow-500' : 'bg-purple-700 hover:bg-purple-800'}`}
          onClick={() => handleSetStartingMap(currentMapId)}
        >{startingMapId === currentMapId ? 'Starting Map' : 'Set as Starting Map'}</button>
      </div>
      {/* New Map Modal */}
      {showNewMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowNewMap(false)}>
          <div className="bg-black/95 rounded-xl shadow-lg p-6 relative max-w-full" style={{ minWidth: 320, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Add New Map</h3>
            <div className="mb-2">
              <label className="block text-purple-300 text-sm mb-1">Map Name</label>
              <input type="text" value={newMapName} onChange={e => setNewMapName(e.target.value)} className="w-full px-3 py-2 rounded bg-black/30 border border-purple-500/50 text-white" />
            </div>
            <div className="mb-4">
              <label className="block text-purple-300 text-sm mb-1">Map Size</label>
              <input type="number" min={8} max={128} value={newMapSize} onChange={e => setNewMapSize(e.target.value)} className="w-full px-3 py-2 rounded bg-black/30 border border-purple-500/50 text-white" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewMap(false)} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleAddMap} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
      {/* Toolbar and Map Grid (unchanged) */}
      {/* ... rest of the previous MapEditor code ... */}
      {/* (Paste the previous toolbar, grid, and painting logic here, using 'map' and 'setMap' as before) */}
      <div className="flex gap-2 items-center mb-2">
        <button
          className={`px-3 py-1 rounded-lg font-semibold text-sm border-2 transition-colors ${mode === 'terrain' ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-gray-700 bg-black/40 text-white hover:border-yellow-400'}`}
          onClick={() => setMode('terrain')}
        >Terrain</button>
        <button
          className={`px-3 py-1 rounded-lg font-semibold text-sm border-2 transition-colors ${mode === 'asset' ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-gray-700 bg-black/40 text-white hover:border-yellow-400'}`}
          onClick={() => setMode('asset')}
        >Asset</button>
        <button
          className={`px-3 py-1 rounded-lg font-semibold text-sm border-2 transition-colors ${mode === 'flag' ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-gray-700 bg-black/40 text-white hover:border-yellow-400'}`}
          onClick={() => setMode('flag')}
        >Region/Flag</button>
        {mode === 'terrain' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedTerrain}
              onChange={e => setSelectedTerrain(e.target.value)}
              className="px-3 py-1 rounded-lg border border-purple-500/50 bg-black/40 text-white"
            >
              {TERRAIN_TYPES.map(t => (
                <option key={t.type} value={t.type}>{t.label}</option>
              ))}
            </select>
            <label className="text-xs text-purple-300 flex items-center gap-1">
              Height:
              <input type="number" value={terrainHeightIndex} onChange={e => setTerrainHeightIndex(parseFloat(e.target.value))} className="w-12 px-1 rounded bg-black/40 border border-purple-700 text-purple-200" step="0.01" />
            </label>
            <span className="text-xs text-purple-300">(Click cell to paint terrain)</span>
          </div>
        )}
        {mode === 'asset' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value)}
              className="px-3 py-1 rounded-lg border border-purple-500/50 bg-black/40 text-white"
            >
              <option value="">Select asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.fileName})</option>
              ))}
            </select>
            <label className="text-xs text-purple-300 flex items-center gap-1">
              Height:
              <input type="number" value={assetHeightIndex} onChange={e => setAssetHeightIndex(parseFloat(e.target.value))} className="w-12 px-1 rounded bg-black/40 border border-purple-700 text-purple-200" step="0.01" />
            </label>
            <span className="text-xs text-purple-300">(Click cell to place, right-click to remove)</span>
          </div>
        )}
        {mode === 'flag' && (
          <div className="flex items-center gap-2">
            {FLAG_TYPES.map(f => (
              <button
                key={f.flag}
                onClick={() => setSelectedFlag(f.flag)}
                className={`px-3 py-1 rounded-lg font-semibold text-xs border-2 transition-colors ${selectedFlag === f.flag ? 'border-pink-400 bg-pink-400/20 text-pink-200' : 'border-gray-700 bg-black/40 text-white hover:border-pink-400'}`}
                style={{ background: selectedFlag === f.flag ? f.color + '33' : undefined }}
              >
                <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: f.color }}></span>
                {f.label}
              </button>
            ))}
            <label className="text-xs text-purple-300 flex items-center gap-1">
              Height:
              <input type="number" value={flagHeightIndex} onChange={e => setFlagHeightIndex(parseFloat(e.target.value))} className="w-12 px-1 rounded bg-black/40 border border-purple-700 text-purple-200" step="0.01" />
            </label>
            <span className="text-xs text-purple-300">(Click cell to flag, right-click to clear)</span>
          </div>
        )}
      </div>
      <div className="overflow-auto" style={{ maxWidth: 800 }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: `repeat(${map.length > 0 ? map[0].length : DEFAULT_SIZE}, 20px)`, gap: 1 }}
          onMouseLeave={() => setIsPainting(false)}
        >
          {map.map((row, y) =>
            row.map((cell, x) => {
              const isTeleport = cell.flags && cell.flags.teleport
              return (
                <div
                  key={x + '-' + y}
                  style={{
                    width: 20,
                    height: 20,
                    background: TERRAIN_TYPES.find(t => t.type === cell.type)?.color || '#aaa',
                    border: '1px solid #222',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  title={isTeleport ? `Teleport to: ${mapsIndex.find(m => m.id === cell.flags.teleport.toMapId)?.name || cell.flags.teleport.toMapId} (${cell.flags.teleport.twoWay ? 'Two-way' : 'One-way'})` : `(${x},${y}) ${cell.type}${cell.objects && cell.objects.length ? ' [Objects]' : ''}`}
                  onMouseDown={e => {
                    e.preventDefault();
                    setIsPainting(true);
                    if (mode === 'asset' && e.button === 2) {
                      clearAsset(x, y)
                    } else if (mode === 'flag' && selectedFlag === 'teleport' && e.button === 0) {
                      handleTeleportPlace(x, y)
                    } else if (mode === 'flag' && selectedFlag === 'teleport' && e.button === 2) {
                      clearTeleport(x, y)
                    } else if (mode === 'flag' && e.button === 2) {
                      clearFlag(x, y, selectedFlag)
                    } else {
                      paintCell(x, y)
                    }
                  }}
                  onMouseUp={() => setIsPainting(false)}
                  onMouseEnter={() => { if (isPainting) paintCell(x, y) }}
                  onContextMenu={e => { e.preventDefault(); if (mode === 'asset') clearAsset(x, y); if (mode === 'flag' && selectedFlag === 'teleport') clearTeleport(x, y); if (mode === 'flag') clearFlag(x, y, selectedFlag) }}
                >
                  {cell.objects && cell.objects.map((obj, idx) => (
                    <span key={idx} style={{ position: 'absolute', top: 2 + idx * 10, right: 2, fontSize: 10, color: '#fff', background: '#6d28d9', borderRadius: 2, padding: '0 2px', cursor: 'pointer' }} title={`Asset: ${obj.assetId}, Height: ${obj.heightIndex}`}
                      onClick={e => { e.stopPropagation(); if (mode === 'asset') clearAsset(x, y, idx) }}>
                      A{obj.heightIndex}
                    </span>
                  ))}
                  {cell.flags && Object.keys(cell.flags).map(flag => (
                    <span key={flag} style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 9, color: '#fff', background: FLAG_TYPES.find(f => f.flag === flag)?.color || '#aaa', borderRadius: 2, padding: '0 2px', opacity: 0.85 }}>{flag[0].toUpperCase()}</span>
                  ))}
                  {isTeleport && (
                    <span style={{ position: 'absolute', bottom: 2, right: 2, fontSize: 9, color: '#fff', background: '#a78bfa', borderRadius: 2, padding: '0 2px', opacity: 0.85 }}>T</span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
      {/* Teleport Modal */}
      {showTeleportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowTeleportModal(false)}>
          <div className="bg-black/95 rounded-xl shadow-lg p-6 relative max-w-full" style={{ minWidth: 320, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Add Teleport Gate</h3>
            <div className="mb-2">
              <label className="block text-purple-300 text-sm mb-1">Destination Map</label>
              <select value={teleportDestMap} onChange={e => setTeleportDestMap(e.target.value)} className="w-full px-3 py-2 rounded bg-black/30 border border-purple-500/50 text-white">
                <option value="">Select map...</option>
                {mapsIndex.filter(m => m.id !== currentMapId).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.size}x{m.size})</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-purple-300 text-sm mb-1">Type</label>
              <select value={teleportTwoWay ? 'two' : 'one'} onChange={e => setTeleportTwoWay(e.target.value === 'two')} className="w-full px-3 py-2 rounded bg-black/30 border border-purple-500/50 text-white">
                <option value="one">One-way</option>
                <option value="two">Two-way</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTeleportModal(false)} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleTeleportConfirm} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
      <div className="text-purple-300 text-xs mt-4">(Painting, asset placement, region/flag drawing, tool asset assignment, multi-map management, and teleport gates work! 3D integration coming soon.)</div>
      <div className="flex gap-2 items-center mb-2">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow"
          onClick={() => { saveMap(); alert('✅ Map saved!') }}
        >
          Save Map
        </button>
      </div>
    </div>
  )
}

export default MapEditor