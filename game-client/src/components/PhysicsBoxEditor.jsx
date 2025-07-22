import React, { useEffect, useRef, useState } from 'react'
import { get } from 'idb-keyval'

const PhysicsBoxEditor = ({ asset, onClose }) => {
  const canvasRef = useRef(null)
  const [hierarchy, setHierarchy] = useState([])
  const [boxes, setBoxes] = useState([])
  const [selectedPart, setSelectedPart] = useState(null)
  const [selectedBox, setSelectedBox] = useState(null)
  const [sceneReady, setSceneReady] = useState(false)
  const engineRef = useRef(null)
  const sceneRef = useRef(null)
  const assetMeshesRef = useRef([])

  // Load asset in Babylon.js scene and extract hierarchy
  useEffect(() => {
    let engine, scene, camera, light
    let assetContainer = null
    let boxMeshes = []
    let disposed = false
    async function setupScene() {
      if (!canvasRef.current || !asset.id) return
      // Clean up previous engine/scene
      if (engineRef.current) {
        engineRef.current.dispose()
        engineRef.current = null
      }
      engine = new window.BABYLON.Engine(canvasRef.current, true)
      scene = new window.BABYLON.Scene(engine)
      engineRef.current = engine
      sceneRef.current = scene
      camera = new window.BABYLON.ArcRotateCamera('cam', Math.PI/2, Math.PI/2.5, 3, window.BABYLON.Vector3.Zero(), scene)
      camera.attachControl(canvasRef.current, true)
      light = new window.BABYLON.HemisphericLight('light', new window.BABYLON.Vector3(0,1,0), scene)
      // Load asset GLB from IndexedDB
      const base64 = await get(asset.id)
      if (!base64) return
      window.BABYLON.SceneLoader.ImportMesh('', '', base64, scene, (meshes, ps, skels, ags) => {
        assetMeshesRef.current = meshes
        // Extract hierarchy (flat list for now)
        const flat = meshes.map(m => ({ name: m.name, id: m.id, type: m.getClassName?.() || 'Node' }))
        setHierarchy(flat)
        setSceneReady(true)
      })
      // Render loop
      engine.runRenderLoop(() => {
        if (!disposed) scene.render()
      })
    }
    setupScene()
    return () => {
      disposed = true
      if (engineRef.current) {
        engineRef.current.dispose()
        engineRef.current = null
      }
    }
  }, [asset])

  // Render static physics boxes (for now, just show as wireframe boxes)
  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return
    // Remove old box meshes
    sceneRef.current.meshes.filter(m => m.name.startsWith('physbox_')).forEach(m => m.dispose())
    // Render each box
    boxes.forEach((box, i) => {
      const mesh = window.BABYLON.MeshBuilder.CreateBox('physbox_' + i, { width: box.size?.x || 1, height: box.size?.y || 1, depth: box.size?.z || 1 }, sceneRef.current)
      mesh.position = new window.BABYLON.Vector3(
        box.position?.x || 0,
        box.position?.y || 0,
        box.position?.z || 0
      )
      mesh.rotation = new window.BABYLON.Vector3(
        box.rotation?.x || 0,
        box.rotation?.y || 0,
        box.rotation?.z || 0
      )
      mesh.isPickable = false
      mesh.visibility = 0.4
      mesh.enableEdgesRendering()
      mesh.edgesWidth = 2.0
      mesh.edgesColor = new window.BABYLON.Color4(0, 1, 0, 1)
      mesh.material = new window.BABYLON.StandardMaterial('physboxmat_' + i, sceneRef.current)
      mesh.material.wireframe = true
    })
  }, [boxes, sceneReady])

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
              {part.name} <span className="text-xs text-purple-400">({part.type})</span>
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