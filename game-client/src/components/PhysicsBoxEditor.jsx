import React, { useEffect, useRef, useState } from 'react'
import { get, set } from 'idb-keyval'

const PHYSICS_BOXES_KEY = 'skyward_physics_boxes_' // + asset.id

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
  const gizmoManagerRef = useRef(null)
  const boxMeshMap = useRef({})

  // Load asset in Babylon.js scene and extract hierarchy
  useEffect(() => {
    let engine, scene, camera, light
    let disposed = false
    async function setupScene() {
      if (!canvasRef.current || !asset.id) return
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
        const flat = meshes.map(m => ({ name: m.name, id: m.id, type: m.getClassName?.() || 'Node' }))
        setHierarchy(flat)
        setSceneReady(true)
      })
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

  // Load saved boxes from IndexedDB/localStorage
  useEffect(() => {
    async function loadBoxes() {
      const saved = await get(PHYSICS_BOXES_KEY + asset.id)
      if (saved && Array.isArray(saved)) setBoxes(saved)
      else setBoxes([])
    }
    loadBoxes()
  }, [asset])

  // Render and update physics boxes
  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return
    Object.values(boxMeshMap.current).forEach(m => m.dispose())
    boxMeshMap.current = {}
    boxes.forEach((box, i) => {
      const mesh = window.BABYLON.MeshBuilder.CreateBox('physbox_' + box.id, { width: box.size?.x || 1, height: box.size?.y || 1, depth: box.size?.z || 1 }, sceneRef.current)
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
      mesh.isPickable = true
      mesh.visibility = 0.4
      mesh.enableEdgesRendering()
      mesh.edgesWidth = 2.0
      mesh.edgesColor = new window.BABYLON.Color4(0, 1, 0, 1)
      mesh.material = new window.BABYLON.StandardMaterial('physboxmat_' + box.id, sceneRef.current)
      mesh.material.wireframe = true
      boxMeshMap.current[box.id] = mesh
      mesh.actionManager = new window.BABYLON.ActionManager(sceneRef.current)
      mesh.actionManager.registerAction(new window.BABYLON.ExecuteCodeAction(window.BABYLON.ActionManager.OnPickTrigger, () => {
        setSelectedBox(box)
      }))
    })
  }, [boxes, sceneReady])

  // GizmoManager for selected box
  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return
    if (!window.BABYLON.GizmoManager) return
    if (!selectedBox) {
      if (gizmoManagerRef.current) {
        gizmoManagerRef.current.attachToMesh(null)
      }
      return
    }
    if (!gizmoManagerRef.current) {
      gizmoManagerRef.current = new window.BABYLON.GizmoManager(sceneRef.current)
      gizmoManagerRef.current.positionGizmoEnabled = true
      gizmoManagerRef.current.rotationGizmoEnabled = true
      gizmoManagerRef.current.scaleGizmoEnabled = true
    }
    const mesh = boxMeshMap.current[selectedBox.id]
    if (mesh) {
      gizmoManagerRef.current.attachToMesh(mesh)
      mesh.onAfterWorldMatrixUpdateObservable.add(() => {
        setBoxes(prev => prev.map(b => b.id === selectedBox.id ? {
          ...b,
          position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
          rotation: { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z },
          size: { x: mesh.scaling.x, y: mesh.scaling.y, z: mesh.scaling.z }
        } : b))
      })
    }
    return () => {
      if (gizmoManagerRef.current) {
        gizmoManagerRef.current.attachToMesh(null)
      }
    }
  }, [selectedBox, sceneReady])

  // Add new box
  const handleAddBox = () => {
    const id = Date.now() + '_' + Math.random().toString(36).substr(2, 6)
    const part = selectedPart ? selectedPart.name : null
    setBoxes(prev => ([
      ...prev,
      {
        id,
        meshName: part,
        position: { x: 0, y: 0, z: 0 },
        size: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 }
      }
    ]))
  }

  // Remove selected box
  const handleRemoveBox = () => {
    if (!selectedBox) return
    setBoxes(prev => prev.filter(b => b.id !== selectedBox.id))
    setSelectedBox(null)
  }

  // Change part/mesh attachment for a box
  const handleChangeBoxPart = (boxId, meshName) => {
    setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, meshName } : b))
  }

  // Save boxes to IndexedDB/localStorage
  const handleSaveBoxes = async () => {
    await set(PHYSICS_BOXES_KEY + asset.id, boxes)
    alert('Physics boxes saved!')
  }

  // Load boxes (manual reload)
  const handleLoadBoxes = async () => {
    const saved = await get(PHYSICS_BOXES_KEY + asset.id)
    if (saved && Array.isArray(saved)) setBoxes(saved)
    else setBoxes([])
    alert('Physics boxes loaded!')
  }

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
              Box {box.id.slice(-6)}
              <div className="text-xs text-purple-400 mt-1">
                <span>Part: </span>
                <select
                  value={box.meshName || ''}
                  onChange={e => handleChangeBoxPart(box.id, e.target.value)}
                  className="bg-black/40 border border-purple-700 rounded px-1 py-0.5 text-xs text-purple-200"
                >
                  <option value="">(root/origin)</option>
                  {hierarchy.map(part => (
                    <option key={part.id} value={part.name}>{part.name}</option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={handleAddBox}>+ Add Box</button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={handleRemoveBox} disabled={!selectedBox}>- Remove</button>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={handleSaveBoxes}>Save</button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded" onClick={handleLoadBoxes}>Load</button>
        </div>
        <button className="mt-6 bg-purple-800 hover:bg-purple-900 text-white px-3 py-1 rounded" onClick={onClose}>Close</button>
      </div>
      {/* 3D Preview */}
      <div className="flex-1 relative bg-black">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  )
}

export default PhysicsBoxEditor