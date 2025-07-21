import React, { useState } from 'react'

const defaultRoles = [
  { key: 'terrain', label: 'Terrain Model', type: 'model' },
  { key: 'skybox', label: 'Skybox (.env)', type: 'texture' },
  { key: 'water', label: 'Water Model', type: 'model' },
]

const WorldAssetsManager = ({ assets }) => {
  const [assignments, setAssignments] = useState({})
  const [characters, setCharacters] = useState([])
  const [newChar, setNewChar] = useState({ name: '', description: '', modelId: '' })

  // Assign asset to world role
  const handleAssign = (roleKey, assetId) => {
    setAssignments({ ...assignments, [roleKey]: assetId })
  }

  // Add new character
  const handleAddCharacter = () => {
    if (!newChar.name || !newChar.modelId) return
    setCharacters([...characters, { ...newChar, id: Date.now() + '_' + Math.random().toString(36).substr(2, 9) }])
    setNewChar({ name: '', description: '', modelId: '' })
  }

  // Remove character
  const handleRemoveCharacter = (id) => {
    setCharacters(characters.filter(c => c.id !== id))
  }

  // Edit character (not implemented for brevity)

  return (
    <div className="space-y-8">
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <h2 className="text-xl font-bold text-white mb-4">🌍 3D World Asset Assignments</h2>
        <div className="space-y-4">
          {defaultRoles.map(role => (
            <div key={role.key} className="flex items-center space-x-4">
              <span className="text-purple-300 w-32">{role.label}</span>
              <select
                value={assignments[role.key] || ''}
                onChange={e => handleAssign(role.key, e.target.value)}
                className="px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white"
              >
                <option value="">Default</option>
                {assets.filter(a => a.type === role.type).map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.fileName})</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <h2 className="text-xl font-bold text-white mb-4">🧙 Character Management</h2>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-2 md:space-y-0">
            <input
              type="text"
              placeholder="Character Name"
              value={newChar.name}
              onChange={e => setNewChar({ ...newChar, name: e.target.value })}
              className="px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white flex-1"
            />
            <input
              type="text"
              placeholder="Description"
              value={newChar.description}
              onChange={e => setNewChar({ ...newChar, description: e.target.value })}
              className="px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white flex-1"
            />
            <select
              value={newChar.modelId}
              onChange={e => setNewChar({ ...newChar, modelId: e.target.value })}
              className="px-3 py-2 bg-black/30 border border-purple-500/50 rounded-lg text-white flex-1"
            >
              <option value="">Select 3D Model</option>
              {assets.filter(a => a.type === 'model').map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.fileName})</option>
              ))}
            </select>
            <button
              onClick={handleAddCharacter}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >Add</button>
          </div>
          <div className="space-y-2">
            {characters.length === 0 && <div className="text-purple-300">No characters added yet.</div>}
            {characters.map(char => (
              <div key={char.id} className="flex items-center space-x-4 bg-black/20 rounded-lg p-3">
                <span className="text-white font-semibold">{char.name}</span>
                <span className="text-purple-300 text-sm">{char.description}</span>
                <span className="text-purple-400 text-xs">Model: {assets.find(a => a.id === char.modelId)?.name || 'N/A'}</span>
                <button
                  onClick={() => handleRemoveCharacter(char.id)}
                  className="text-red-400 hover:text-red-300 px-2"
                >Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorldAssetsManager