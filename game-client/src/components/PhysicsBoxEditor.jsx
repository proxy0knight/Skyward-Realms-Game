import React, { useEffect, useRef, useState } from 'react'
import { get, set } from 'idb-keyval'

const PHYSICS_BOXES_KEY = 'skyward_physics_boxes_'
const snapValue = (val, step) => Math.round(val / step) * step

function randomColor() {
  const colors = ['#e57373','#f06292','#ba68c8','#64b5f6','#4db6ac','#81c784','#ffd54f','#ffb74d','#a1887f','#90a4ae']
  return colors[Math.floor(Math.random()*colors.length)]
}

const PhysicsBoxEditor = ({ asset, onClose }) => {
  const canvasRef = useRef(null)
  const [hierarchy, setHierarchy] = useState([])
  const [boxes, setBoxes] = useState([])
  const [selectedPart, setSelectedPart] = useState(null)
  const [selectedBox, setSelectedBox] = useState(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [showBoxes, setShowBoxes] = useState(true)
  const [wireframe, setWireframe] = useState(true)
  const [snapping, setSnapping] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
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
      const base64 = await get(asset.id)
      if (!base64) return
      window.BABYLON.SceneLoader.ImportMesh('', '', base64, scene, (meshes) => {
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
    if (!showBoxes) return
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
      mesh.visibility = box.visible === false ? 0 : 0.4
      mesh.enableEdgesRendering()
      mesh.edgesWidth = 2.0
      mesh.edgesColor = new window.BABYLON.Color4(...(box.color ? hexToRgbNorm(box.color) : [0,1,0,1]))
      mesh.material = new window.BABYLON.StandardMaterial('physboxmat_' + box.id, sceneRef.current)
      mesh.material.wireframe = wireframe
      if (box.color) mesh.material.diffuseColor = new window.BABYLON.Color3(...hexToRgbNorm(box.color).slice(0,3))
      boxMeshMap.current[box.id] = mesh
      mesh.actionManager = new window.BABYLON.ActionManager(sceneRef.current)
      mesh.actionManager.registerAction(new window.BABYLON.ExecuteCodeAction(window.BABYLON.ActionManager.OnPickTrigger, () => {
        setSelectedBox(box)
      }))
    })
  }, [boxes, sceneReady, showBoxes, wireframe])

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
          position: {
            x: snapping ? snapValue(mesh.position.x, 0.25) : mesh.position.x,
            y: snapping ? snapValue(mesh.position.y, 0.25) : mesh.position.y,
            z: snapping ? snapValue(mesh.position.z, 0.25) : mesh.position.z
          },
          rotation: {
            x: snapping ? snapValue(mesh.rotation.x, Math.PI/12) : mesh.rotation.x,
            y: snapping ? snapValue(mesh.rotation.y, Math.PI/12) : mesh.rotation.y,
            z: snapping ? snapValue(mesh.rotation.z, Math.PI/12) : mesh.rotation.z
          },
          size: {
            x: snapping ? snapValue(mesh.scaling.x, 0.1) : mesh.scaling.x,
            y: snapping ? snapValue(mesh.scaling.y, 0.1) : mesh.scaling.y,
            z: snapping ? snapValue(mesh.scaling.z, 0.1) : mesh.scaling.z
          }
        } : b))
      })
    }
    return () => {
      if (gizmoManagerRef.current) {
        gizmoManagerRef.current.attachToMesh(null)
      }
    }
  }, [selectedBox, sceneReady, snapping])

  // Add new box
  const handleAddBox = () => {
    const id = Date.now() + '_' + Math.random().toString(36).substr(2, 6)
    const part = selectedPart ? selectedPart.name : null
    pushUndo()
    setBoxes(prev => ([
      ...prev,
      {
        id,
        meshName: part,
        position: { x: 0, y: 0, z: 0 },
        size: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        color: randomColor(),
        label: '',
        visible: true,
        relative: true
      }
    ]))
  }

  // Remove selected box
  const handleRemoveBox = () => {
    if (!selectedBox) return
    pushUndo()
    setBoxes(prev => prev.filter(b => b.id !== selectedBox.id))
    setSelectedBox(null)
  }

  // Duplicate selected box
  const handleDuplicateBox = () => {
    if (!selectedBox) return
    pushUndo()
    const id = Date.now() + '_' + Math.random().toString(36).substr(2, 6)
    setBoxes(prev => ([
      ...prev,
      { ...selectedBox, id }
    ]))
  }

  // Change part/mesh attachment for a box
  const handleChangeBoxPart = (boxId, meshName) => {
    pushUndo()
    setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, meshName } : b))
  }

  // Numeric input for transforms
  const handleBoxTransformInput = (boxId, field, axis, value) => {
    pushUndo()
    setBoxes(prev => prev.map(b => b.id === boxId ? {
      ...b,
      [field]: { ...b[field], [axis]: parseFloat(value) }
    } : b))
  }

  // Change color/label/visibility/relative
  const handleBoxMetaInput = (boxId, field, value) => {
    pushUndo()
    setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, [field]: value } : b))
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

  // Import/export JSON
  const handleExport = () => {
    const data = JSON.stringify(boxes, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${asset.name || 'asset'}_physics_boxes.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result)
        if (Array.isArray(data)) setBoxes(data)
        else alert('Invalid file format')
      } catch {
        alert('Failed to parse file')
      }
    }
    reader.readAsText(file)
  }

  // Undo/Redo logic
  const pushUndo = () => {
    setUndoStack(prev => [...prev, boxes.map(b => ({ ...b, position: { ...b.position }, size: { ...b.size }, rotation: { ...b.rotation } }))])
    setRedoStack([])
  }
  const handleUndo = () => {
    if (undoStack.length === 0) return
    setRedoStack(prev => [boxes, ...prev])
    setBoxes(undoStack[undoStack.length - 1])
    setUndoStack(prev => prev.slice(0, -1))
  }
  const handleRedo = () => {
    if (redoStack.length === 0) return
    setUndoStack(prev => [...prev, boxes])
    setBoxes(redoStack[0])
    setRedoStack(prev => prev.slice(1))
  }

  function hexToRgbNorm(hex) {
    hex = hex.replace('#','')
    if (hex.length === 3) hex = hex.split('').map(x=>x+x).join('')
    const num = parseInt(hex, 16)
    return [((num>>16)&255)/255, ((num>>8)&255)/255, (num&255)/255, 1]
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
              <div className="flex items-center gap-2">
                <span style={{background:box.color, width:16, height:16, borderRadius:4, display:'inline-block', border:'1px solid #333'}}></span>
                <span>{box.label || `Box ${box.id.slice(-6)}`}</span>
                <button className="ml-auto text-xs px-1 py-0.5 rounded bg-gray-700 text-white" onClick={e => {e.stopPropagation(); handleBoxMetaInput(box.id, 'visible', !box.visible)}}>{box.visible === false ? 'Show' : 'Hide'}</button>
              </div>
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
              {selectedBox?.id === box.id && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 items-center text-xs">
                    <span>Label:</span>
                    <input type="text" value={box.label || ''} onChange={e => handleBoxMetaInput(box.id, 'label', e.target.value)} className="w-24 px-1 rounded bg-black/40 border border-purple-700 text-purple-200" />
                  </div>
                  <div className="flex gap-1 items-center text-xs">
                    <span>Color:</span>
                    <input type="color" value={box.color || '#00ff00'} onChange={e => handleBoxMetaInput(box.id, 'color', e.target.value)} className="w-8 h-6 border border-purple-700 rounded" />
                  </div>
                  <div className="flex gap-1 items-center text-xs">
                    <span>Pos:</span>
                    {['x','y','z'].map(axis => (
                      <input key={axis} type="number" step="0.01" value={box.position?.[axis] || 0} onChange={e => handleBoxTransformInput(box.id, 'position', axis, e.target.value)} className="w-12 px-1 rounded bg-black/40 border border-purple-700 text-purple-200" />
                    ))}
                  </div>
                  <div className="flex gap-1 items-center text-xs">
                    <span>Size:</span>
                    {['x','y','z'].map(axis => (
                      <input key={axis} type="number" step="0.01" value={box.size?.[axis] || 1} onChange={e => handleBoxTransformInput(box.id, 'size', axis, e.target.value)} className="w-12 px-1 rounded bg-black/40 border border-purple-700 text-purple-200" />
                    ))}
                  </div>
                  <div className="flex gap-1 items-center text-xs">
                    <span>Rot:</span>
                    {['x','y','z'].map(axis => (
                      <input key={axis} type="number" step="0.01" value={box.rotation?.[axis] || 0} onChange={e => handleBoxTransformInput(box.id, 'rotation', axis, e.target.value)} className="w-12 px-1 rounded bg-black/40 border border-purple-700 text-purple-200" />
                    ))}
                  </div>
                  <div className="flex gap-1 items-center text-xs">
                    <span>Relative:</span>
                    <input type="checkbox" checked={box.relative !== false} onChange={e => handleBoxMetaInput(box.id, 'relative', e.target.checked)} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={handleAddBox}>+ Add Box</button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded" onClick={handleDuplicateBox} disabled={!selectedBox}>Duplicate</button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={handleRemoveBox} disabled={!selectedBox}>- Remove</button>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={handleSaveBoxes}>Save</button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded" onClick={handleLoadBoxes}>Load</button>
          <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded" onClick={handleUndo} disabled={undoStack.length === 0}>Undo</button>
          <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded" onClick={handleRedo} disabled={redoStack.length === 0}>Redo</button>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button className={`px-3 py-1 rounded ${showBoxes ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setShowBoxes(v => !v)}>{showBoxes ? 'Hide Boxes' : 'Show Boxes'}</button>
          <button className={`px-3 py-1 rounded ${wireframe ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setWireframe(v => !v)}>{wireframe ? 'Wireframe' : 'Solid'}</button>
          <button className={`px-3 py-1 rounded ${snapping ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setSnapping(v => !v)}>{snapping ? 'Snapping On' : 'Snapping Off'}</button>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1 rounded" onClick={handleExport}>Export</button>
          <label className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1 rounded cursor-pointer">
            Import
            <input type="file" accept=".json" style={{display:'none'}} onChange={handleImport} />
          </label>
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