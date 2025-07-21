import React, { useEffect, useState } from 'react'

const MAP_KEY = 'skyward_world_map'
const TOOL_ASSET_KEY = 'skyward_tool_asset_assignments'
const DEFAULT_SIZE = 32
const DEFAULT_CELL = { type: 'ground', asset: null, flags: {} }
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
  const [map, setMap] = useState([])
  const [selectedTerrain, setSelectedTerrain] = useState('ground')
  const [isPainting, setIsPainting] = useState(false)
  const [mode, setMode] = useState('terrain') // 'terrain', 'asset', 'flag'
  const [assets, setAssets] = useState([])
  const [selectedAsset, setSelectedAsset] = useState('')
  const [selectedFlag, setSelectedFlag] = useState('spawn')
  const [toolAssets, setToolAssets] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem(MAP_KEY)
    if (saved) {
      setMap(JSON.parse(saved))
    } else {
      const def = createDefaultMap()
      setMap(def)
      localStorage.setItem(MAP_KEY, JSON.stringify(def))
    }
    // Load assets
    const assetList = JSON.parse(localStorage.getItem('skyward_assets') || '[]')
    setAssets(assetList.filter(a => a.type === 'model'))
    // Load tool-asset assignments
    const ta = localStorage.getItem(TOOL_ASSET_KEY)
    if (ta) setToolAssets(JSON.parse(ta))
  }, [])

  const paintCell = (x, y) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      if (mode === 'terrain') {
        newMap[y][x].type = selectedTerrain
      } else if (mode === 'asset') {
        newMap[y][x].asset = selectedAsset || null
      } else if (mode === 'flag') {
        newMap[y][x].flags = { ...newMap[y][x].flags, [selectedFlag]: true }
      }
      localStorage.setItem(MAP_KEY, JSON.stringify(newMap))
      return newMap
    })
  }

  const clearAsset = (x, y) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      newMap[y][x].asset = null
      localStorage.setItem(MAP_KEY, JSON.stringify(newMap))
      return newMap
    })
  }

  const clearFlag = (x, y, flag) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      if (newMap[y][x].flags) delete newMap[y][x].flags[flag]
      localStorage.setItem(MAP_KEY, JSON.stringify(newMap))
      return newMap
    })
  }

  // Assign asset to terrain tool
  const handleToolAssetChange = (terrainType, assetId) => {
    const updated = { ...toolAssets, [terrainType]: assetId }
    setToolAssets(updated)
    localStorage.setItem(TOOL_ASSET_KEY, JSON.stringify(updated))
  }

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
      <h2 className="text-xl font-bold text-white mb-4">🗺️ Map Editor</h2>
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
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
            {TERRAIN_TYPES.map(t => (
              <div key={t.type} className="flex flex-col items-center">
                <button
                  onClick={() => setSelectedTerrain(t.type)}
                  className={`px-3 py-1 rounded-lg font-semibold text-sm border-2 transition-colors ${selectedTerrain === t.type ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-gray-700 bg-black/40 text-white hover:border-yellow-400'}`}
                  style={{ background: selectedTerrain === t.type ? t.color + '33' : undefined }}
                >
                  <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ background: t.color }}></span>
                  {t.label}
                </button>
                {/* Tool asset assignment */}
                <select
                  value={toolAssets[t.type] || ''}
                  onChange={e => handleToolAssetChange(t.type, e.target.value)}
                  className="mt-1 px-2 py-1 rounded border border-purple-500/50 bg-black/40 text-xs text-white"
                >
                  <option value="">Default</option>
                  {assets.filter(a => (a.category === t.tag || (a.tags || []).includes(t.tag))).map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.fileName})</option>
                  ))}
                </select>
              </div>
            ))}
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
            <span className="text-xs text-purple-300">(Click cell to flag, right-click to clear)</span>
          </div>
        )}
      </div>
      <div className="overflow-auto" style={{ maxWidth: 800 }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: `repeat(${DEFAULT_SIZE}, 20px)`, gap: 1 }}
          onMouseLeave={() => setIsPainting(false)}
        >
          {map.map((row, y) =>
            row.map((cell, x) => (
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
                title={`(${x},${y}) ${cell.type}${cell.asset ? ' [Asset]' : ''}`}
                onMouseDown={e => {
                  e.preventDefault();
                  setIsPainting(true);
                  if (e.button === 2 && mode === 'asset') {
                    clearAsset(x, y)
                  } else if (e.button === 2 && mode === 'flag') {
                    clearFlag(x, y, selectedFlag)
                  } else {
                    paintCell(x, y)
                  }
                }}
                onMouseUp={() => setIsPainting(false)}
                onMouseEnter={() => { if (isPainting) paintCell(x, y) }}
                onContextMenu={e => { e.preventDefault(); if (mode === 'asset') clearAsset(x, y); if (mode === 'flag') clearFlag(x, y, selectedFlag) }}
              >
                {cell.asset && (
                  <span style={{ position: 'absolute', top: 2, right: 2, fontSize: 10, color: '#fff', background: '#6d28d9', borderRadius: 2, padding: '0 2px' }}>A</span>
                )}
                {cell.flags && Object.keys(cell.flags).map(flag => (
                  <span key={flag} style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 9, color: '#fff', background: FLAG_TYPES.find(f => f.flag === flag)?.color || '#aaa', borderRadius: 2, padding: '0 2px', opacity: 0.85 }}>{flag[0].toUpperCase()}</span>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="text-purple-300 text-xs mt-4">(Painting, asset placement, region/flag drawing, and tool asset assignment work! 3D integration coming soon.)</div>
    </div>
  )
}

export default MapEditor