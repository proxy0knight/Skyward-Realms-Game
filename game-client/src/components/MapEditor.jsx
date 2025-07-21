import React, { useEffect, useState } from 'react'

const MAP_KEY = 'skyward_world_map'
const DEFAULT_SIZE = 32
const DEFAULT_CELL = { type: 'ground', asset: null, flags: {} }
const TERRAIN_TYPES = [
  { type: 'ground', label: 'Ground', color: '#4ade80' },
  { type: 'water', label: 'Water', color: '#60a5fa' },
  { type: 'path', label: 'Path', color: '#fbbf24' },
  { type: 'sea', label: 'Sea', color: '#2563eb' }
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
  const [mode, setMode] = useState('terrain') // 'terrain' or 'asset'
  const [assets, setAssets] = useState([])
  const [selectedAsset, setSelectedAsset] = useState('')

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
  }, [])

  const paintCell = (x, y) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      if (mode === 'terrain') {
        newMap[y][x].type = selectedTerrain
      } else if (mode === 'asset') {
        newMap[y][x].asset = selectedAsset || null
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

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
      <h2 className="text-xl font-bold text-white mb-4">🗺️ Map Editor</h2>
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4">
        <button
          className={`px-3 py-1 rounded-lg font-semibold text-sm border-2 transition-colors ${mode === 'terrain' ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-gray-700 bg-black/40 text-white hover:border-yellow-400'}`}
          onClick={() => setMode('terrain')}
        >Terrain</button>
        <button
          className={`px-3 py-1 rounded-lg font-semibold text-sm border-2 transition-colors ${mode === 'asset' ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-gray-700 bg-black/40 text-white hover:border-yellow-400'}`}
          onClick={() => setMode('asset')}
        >Asset</button>
        {mode === 'terrain' && (
          <div className="flex items-center gap-2">
            {TERRAIN_TYPES.map(t => (
              <button
                key={t.type}
                onClick={() => setSelectedTerrain(t.type)}
                className={`px-3 py-1 rounded-lg font-semibold text-sm border-2 transition-colors ${selectedTerrain === t.type ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-gray-700 bg-black/40 text-white hover:border-yellow-400'}`}
                style={{ background: selectedTerrain === t.type ? t.color + '33' : undefined }}
              >
                <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ background: t.color }}></span>
                {t.label}
              </button>
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
                  } else {
                    paintCell(x, y)
                  }
                }}
                onMouseUp={() => setIsPainting(false)}
                onMouseEnter={() => { if (isPainting) paintCell(x, y) }}
                onContextMenu={e => { e.preventDefault(); if (mode === 'asset') clearAsset(x, y) }}
              >
                {cell.asset && (
                  <span style={{ position: 'absolute', top: 2, right: 2, fontSize: 10, color: '#fff', background: '#6d28d9', borderRadius: 2, padding: '0 2px' }}>A</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="text-purple-300 text-xs mt-4">(Painting and asset placement work! Region/flag drawing and advanced features coming soon.)</div>
    </div>
  )
}

export default MapEditor