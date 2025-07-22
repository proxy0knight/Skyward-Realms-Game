import React, { useEffect, useRef, useState } from 'react'

const PhysicsBoxEditor = ({ asset, onClose }) => {
  const canvasRef = useRef(null)
  const [hierarchy, setHierarchy] = useState([])
  const [boxes, setBoxes] = useState([])
  const [selectedPart, setSelectedPart] = useState(null)
  const [selectedBox, setSelectedBox] = useState(null)

  // TODO: Load asset in Babylon.js scene and extract hierarchy
  useEffect(() => {
    // Placeholder: load asset and extract mesh/node hierarchy
    setHierarchy([{ name: asset.name, id: asset.id }])
    // TODO: Load saved boxes from asset metadata
    setBoxes([])
  }, [asset])

  // TODO: Babylon.js scene setup and box rendering

  return (
    <div className="flex w-[900px] h-[600px] bg-black rounded-xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-black/80 border-r border-purple-700 p-4 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-2">Asset Hierarchy</h3>
        <ul className="flex-1 overflow-y-auto space-y-1">
          {hierarchy.map(part => (
            <li
              key={part.id}
              className={`px-2 py-1 rounded cursor-pointer ${selectedPart?.id === part.id ? 'bg-purple-700 text-white' : 'text-purple-300 hover:bg-purple-600'}`}
              onClick={() => setSelectedPart(part)}
            >
              {part.name}
            </li>
          ))}
        </ul>
        <h3 className="text-lg font-bold text-white mt-4 mb-2">Physics Boxes</h3>
        <ul className="flex-1 overflow-y-auto space-y-1">
          {boxes.map(box => (
            <li
              key={box.id}
              className={`px-2 py-1 rounded cursor-pointer ${selectedBox?.id === box.id ? 'bg-green-700 text-white' : 'text-green-300 hover:bg-green-600'}`}
              onClick={() => setSelectedBox(box)}
            >
              Box {box.id}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={() => {/* TODO: Add box */}}>+ Add Box</button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={() => {/* TODO: Remove box */}} disabled={!selectedBox}>- Remove</button>
        </div>
        <button className="mt-6 bg-purple-800 hover:bg-purple-900 text-white px-3 py-1 rounded" onClick={onClose}>Close</button>
      </div>
      {/* 3D Preview */}
      <div className="flex-1 relative bg-black">
        <canvas ref={canvasRef} className="w-full h-full block" />
        {/* TODO: Add transform controls, overlays, etc. */}
      </div>
    </div>
  )
}

export default PhysicsBoxEditor