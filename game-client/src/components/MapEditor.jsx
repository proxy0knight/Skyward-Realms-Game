import React, { useEffect, useState } from 'react'

const MAP_KEY = 'skyward_world_map'
const DEFAULT_SIZE = 32
const DEFAULT_CELL = { type: 'ground', asset: null, flags: {} }

function createDefaultMap(size = DEFAULT_SIZE) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ ...DEFAULT_CELL }))
  )
}

const MapEditor = () => {
  const [map, setMap] = useState([])

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

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
      <h2 className="text-xl font-bold text-white mb-4">🗺️ Map Editor</h2>
      <div className="overflow-auto" style={{ maxWidth: 800 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${DEFAULT_SIZE}, 20px)`, gap: 1 }}>
          {map.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={x + '-' + y}
                style={{ width: 20, height: 20, background: cell.type === 'ground' ? '#4ade80' : '#60a5fa', border: '1px solid #222' }}
                title={`(${x},${y}) ${cell.type}`}
              />
            ))
          )}
        </div>
      </div>
      <div className="text-purple-300 text-xs mt-4">(Painting, asset placement, and advanced features coming soon!)</div>
    </div>
  )
}

export default MapEditor