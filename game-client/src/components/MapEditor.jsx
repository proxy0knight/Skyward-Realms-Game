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

  useEffect(() => {
    const saved = localStorage.getItem(MAP_KEY)
    if (saved) {
      setMap(JSON.parse(saved))
    } else {
      const def = createDefaultMap()
      setMap(def)
      localStorage.setItem(MAP_KEY, JSON.stringify(def))
    }
  }, [])

  const paintCell = (x, y) => {
    setMap(prev => {
      const newMap = prev.map(row => row.map(cell => ({ ...cell })))
      newMap[y][x].type = selectedTerrain
      localStorage.setItem(MAP_KEY, JSON.stringify(newMap))
      return newMap
    })
  }

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
      <h2 className="text-xl font-bold text-white mb-4">🗺️ Map Editor</h2>
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4">
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
      <div className="overflow-auto" style={{ maxWidth: 800 }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: `repeat(${DEFAULT_SIZE}, 20px)`, gap: 1 }}
          onMouseLeave={() => setIsPainting(false)}
        >
          {map.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={x + '-' + y}
                style={{ width: 20, height: 20, background: TERRAIN_TYPES.find(t => t.type === cell.type)?.color || '#aaa', border: '1px solid #222', cursor: 'pointer' }}
                title={`(${x},${y}) ${cell.type}`}
                onMouseDown={e => { e.preventDefault(); setIsPainting(true); paintCell(x, y) }}
                onMouseUp={() => setIsPainting(false)}
                onMouseEnter={() => { if (isPainting) paintCell(x, y) }}
              />
            ))
          )}
        </div>
      </div>
      <div className="text-purple-300 text-xs mt-4">(Painting works! Asset placement and advanced features coming soon.)</div>
    </div>
  )
}

export default MapEditor