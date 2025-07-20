import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const AssetPreview = ({ asset, onClose }) => {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!asset) return

    if (asset.type === 'model') {
      initializeModelPreview()
    } else if (asset.type === 'texture') {
      initializeTexturePreview()
    } else if (asset.type === 'audio') {
      initializeAudioPreview()
    }

    return () => {
      cleanupPreview()
    }
  }, [asset])

  const initializeModelPreview = async () => {
    if (!canvasRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      // Create scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a1a2e)
      sceneRef.current = scene

      // Create camera
      const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000)
      camera.position.set(0, 0, 5)

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        antialias: true 
      })
      renderer.setSize(400, 300)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      rendererRef.current = renderer

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 5, 5)
      directionalLight.castShadow = true
      scene.add(directionalLight)

      // Add placeholder geometry (since we can't easily parse the base64 GLTF)
      const geometry = new THREE.BoxGeometry(2, 2, 2)
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff88,
        transparent: true,
        opacity: 0.8
      })
      const cube = new THREE.Mesh(geometry, material)
      cube.castShadow = true
      scene.add(cube)

      // Add ground plane
      const groundGeometry = new THREE.PlaneGeometry(10, 10)
      const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -2
      ground.receiveShadow = true
      scene.add(ground)

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate)
        
        cube.rotation.x += 0.01
        cube.rotation.y += 0.01
        
        renderer.render(scene, camera)
      }
      animate()

      setIsLoading(false)
    } catch (err) {
      setError('Failed to preview 3D model: ' + err.message)
      setIsLoading(false)
    }
  }

  const initializeTexturePreview = () => {
    // Texture preview will be handled by the img element
    setIsLoading(false)
  }

  const initializeAudioPreview = () => {
    setIsLoading(false)
  }

  const cleanupPreview = () => {
    if (rendererRef.current) {
      rendererRef.current.dispose()
      rendererRef.current = null
    }
    if (sceneRef.current) {
      sceneRef.current.clear()
      sceneRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setAudioPlaying(false)
  }

  const toggleAudio = () => {
    if (!audioRef.current) return

    if (audioPlaying) {
      audioRef.current.pause()
      setAudioPlaying(false)
    } else {
      audioRef.current.play()
      setAudioPlaying(true)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!asset) {
    return (
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👁️</div>
          <div className="text-white text-lg mb-2">Asset Preview</div>
          <div className="text-purple-300">Select an asset to preview it here</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">👁️ Asset Preview</h2>
            <p className="text-purple-300">Previewing: {asset.name}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Area */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Preview</h3>
            
            <div className="bg-black/20 rounded-lg border border-purple-500/30 p-4">
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-purple-300">
                    <div className="text-4xl mb-2">⏳</div>
                    <div>Loading preview...</div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-400 text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <div>{error}</div>
                  </div>
                </div>
              )}

              {!isLoading && !error && (
                <>
                  {asset.type === 'model' && (
                    <div className="space-y-4">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-64 bg-gray-900 rounded border"
                        style={{ maxWidth: '400px', maxHeight: '300px' }}
                      />
                      <div className="text-center">
                        <div className="text-purple-300 text-sm">
                          🎭 3D Model Preview
                        </div>
                        <div className="text-xs text-purple-400 mt-1">
                          Interactive preview with lighting and rotation
                        </div>
                      </div>
                    </div>
                  )}

                  {asset.type === 'texture' && (
                    <div className="space-y-4">
                      <img
                        src={asset.data}
                        alt={asset.name}
                        className="w-full h-64 object-contain bg-gray-900 rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          setError('Failed to load texture image')
                        }}
                      />
                      <div className="text-center">
                        <div className="text-purple-300 text-sm">
                          🖼️ Texture Preview
                        </div>
                        <div className="text-xs text-purple-400 mt-1">
                          Full resolution image preview
                        </div>
                      </div>
                    </div>
                  )}

                  {asset.type === 'audio' && (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center h-64 bg-gray-900 rounded border">
                        <div className="text-6xl mb-4">🎵</div>
                        <div className="text-white text-lg mb-4">{asset.name}</div>
                        
                        <audio
                          ref={audioRef}
                          src={asset.data}
                          onPlay={() => setAudioPlaying(true)}
                          onPause={() => setAudioPlaying(false)}
                          onEnded={() => setAudioPlaying(false)}
                          className="hidden"
                        />
                        
                        <button
                          onClick={toggleAudio}
                          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            audioPlaying
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {audioPlaying ? '⏸️ Pause' : '▶️ Play'}
                        </button>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-300 text-sm">
                          🎵 Audio Preview
                        </div>
                        <div className="text-xs text-purple-400 mt-1">
                          Click play to listen to the audio file
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Asset Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Asset Information</h3>
            
            <div className="bg-black/20 rounded-lg border border-purple-500/30 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Name:</span>
                <span className="text-white font-medium">{asset.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-purple-300">File Name:</span>
                <span className="text-white font-mono text-sm">{asset.fileName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Type:</span>
                <span className="text-white">{asset.type.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Size:</span>
                <span className="text-white">{formatFileSize(asset.size)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Uploaded:</span>
                <span className="text-white">{formatDate(asset.uploadDate)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Status:</span>
                <span className={asset.loaded ? 'text-green-400' : 'text-gray-400'}>
                  {asset.loaded ? '✓ Loaded in Game' : '○ Not Loaded'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Optimized:</span>
                <span className={asset.optimized ? 'text-blue-400' : 'text-gray-400'}>
                  {asset.optimized ? '⚡ Optimized' : '○ Standard'}
                </span>
              </div>
              
              <div className="border-t border-purple-500/30 pt-3">
                <div className="text-purple-300 text-sm mb-2">Asset ID:</div>
                <div className="text-white font-mono text-xs bg-black/30 p-2 rounded break-all">
                  {asset.id}
                </div>
              </div>
            </div>

            {/* Asset Actions */}
            <div className="bg-black/20 rounded-lg border border-purple-500/30 p-4">
              <h4 className="text-white font-semibold mb-3">⚡ Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(asset.id)
                    alert('Asset ID copied to clipboard!')
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  📋 Copy Asset ID
                </button>
                
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = asset.data
                    link.download = asset.fileName
                    link.click()
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  💾 Download Asset
                </button>
                
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
                      // This would trigger the delete from parent component
                      alert('Delete functionality would be handled by parent component')
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  🗑️ Delete Asset
                </button>
              </div>
            </div>

            {/* Usage Information */}
            <div className="bg-black/20 rounded-lg border border-purple-500/30 p-4">
              <h4 className="text-white font-semibold mb-3">💡 Usage Tips</h4>
              <div className="text-sm space-y-2">
                {asset.type === 'model' && (
                  <div className="text-purple-300">
                    Use GLB/GLTF models for best compatibility with the game engine. 
                    Keep triangle count under 10k for optimal performance.
                  </div>
                )}
                {asset.type === 'texture' && (
                  <div className="text-purple-300">
                    Use power-of-2 dimensions (512x512, 1024x1024) for best GPU compatibility. 
                    PNG for transparency, JPG for opaque textures.
                  </div>
                )}
                {asset.type === 'audio' && (
                  <div className="text-purple-300">
                    MP3 files work best for music and ambient sounds. 
                    WAV files are better for short sound effects.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetPreview