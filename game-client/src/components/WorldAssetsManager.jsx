import React, { useState, useEffect } from 'react'
import PhysicsBoxEditor from './PhysicsBoxEditor'

const defaultRoles = [
  { key: 'terrain', label: 'Terrain Model', type: 'model' },
  { key: 'skybox', label: 'Skybox (.env)', type: 'texture' },
  { key: 'water', label: 'Water Model', type: 'model' },
]

const ASSIGNMENTS_KEY = 'skyward_world_assignments'
const CHARACTERS_KEY = 'skyward_world_characters'

const WorldAssetsManager = ({ assets }) => {
  const [assignments, setAssignments] = useState({})
  const [characters, setCharacters] = useState([])
  const [newChar, setNewChar] = useState({ name: '', description: '', modelId: '' })
  const [selectedAsset, setSelectedAsset] = useState(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedAssignments = localStorage.getItem(ASSIGNMENTS_KEY)
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments))
    const savedChars = localStorage.getItem(CHARACTERS_KEY)
    if (savedChars) setCharacters(JSON.parse(savedChars))
  }, [])

  // Save assignments to localStorage
  useEffect(() => {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
  }, [assignments])

  // Save characters to localStorage
  useEffect(() => {
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters))
  }, [characters])

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
      <div className="flex w-full h-[600px] bg-black rounded-xl overflow-hidden mt-8">
        {/* Vertical asset list */}
        <div className="w-64 bg-black/80 border-r border-purple-700 p-4 flex flex-col overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4">3D Assets</h3>
          <div className="space-y-4">
            {assets.filter(a => a.type === 'model').map(asset => (
              <div
                key={asset.id}
                className={`rounded-lg border cursor-pointer transition-all duration-200 ${selectedAsset?.id === asset.id ? 'border-purple-400 bg-purple-500/20' : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10'}`}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="p-2 flex flex-col items-center">
                  {/* Thumbnail preview (could use ModelPreview or a static image) */}
                  <div className="w-24 h-16 bg-black/60 rounded mb-2 flex items-center justify-center">
                    {/* TODO: Replace with ModelPreview if available */}
                    <span className="text-3xl">🎭</span>
                  </div>
                  <div className="text-white text-sm font-medium truncate w-full text-center">{asset.name}</div>
                  <div className="text-purple-300 text-xs w-full text-center">{asset.fileName}</div>
                  <div className="text-purple-300 text-xs w-full text-center">{asset.category || 'No Category'}</div>
                  <div className="text-purple-300 text-xs w-full text-center">{asset.size ? `${(asset.size/1024/1024).toFixed(2)} MB` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Main preview/editor area */}
        <div className="flex-1 bg-black">
          {selectedAsset && selectedAsset.type === 'model' ? (
            <PhysicsBoxEditor asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
          ) : (
            <div className="flex items-center justify-center h-full text-purple-300 text-lg">Select a 3D asset to configure physics boxes.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorldAssetsManager