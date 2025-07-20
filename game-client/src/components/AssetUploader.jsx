import React, { useState, useRef } from 'react'

const AssetUploader = ({ onAssetUpload, onSwitchTab }) => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const supportedFormats = {
    models: ['.glb', '.gltf', '.obj', '.fbx'],
    textures: ['.jpg', '.jpeg', '.png', '.webp', '.bmp'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a']
  }

  const getFileType = (fileName) => {
    const extension = '.' + fileName.split('.').pop().toLowerCase()
    
    if (supportedFormats.models.includes(extension)) return 'model'
    if (supportedFormats.textures.includes(extension)) return 'texture'
    if (supportedFormats.audio.includes(extension)) return 'audio'
    return 'unknown'
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'model': return '🎭'
      case 'texture': return '🖼️'
      case 'audio': return '🎵'
      default: return '📄'
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const processFile = async (file) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Convert file to base64 for storage
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })

      const asset = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        fileName: file.name,
        type: getFileType(file.name),
        size: file.size,
        data: base64,
        uploadDate: new Date().toISOString(),
        loaded: false,
        optimized: false
      }

      onAssetUpload(asset)
      
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        alert(`✅ Asset "${asset.name}" uploaded successfully!`)
        onSwitchTab()
      }, 500)

    } catch (error) {
      console.error('Upload failed:', error)
      alert('❌ Upload failed: ' + error.message)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      const type = getFileType(file.name)
      if (type === 'unknown') {
        alert(`❌ Unsupported file format: ${file.name}`)
        return false
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert(`❌ File too large: ${file.name} (max 50MB)`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      validFiles.forEach(processFile)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <h2 className="text-xl font-bold text-white mb-4">⬆️ Upload Assets</h2>
        
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragOver
              ? 'border-purple-400 bg-purple-500/10'
              : 'border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/5'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".glb,.gltf,.obj,.fbx,.jpg,.jpeg,.png,.webp,.bmp,.mp3,.wav,.ogg,.m4a"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="text-4xl">⏳</div>
              <div className="text-white font-semibold">Uploading...</div>
              <div className="w-full bg-purple-900/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-purple-300 text-sm">{uploadProgress}%</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">{dragOver ? '📥' : '📤'}</div>
              <div className="text-white font-semibold text-lg">
                {dragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
              </div>
              <div className="text-purple-300 text-sm">
                Supports 3D models, textures, and audio files
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supported Formats */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Supported Formats</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 3D Models */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">🎭</span>
              <span className="text-white font-semibold">3D Models</span>
            </div>
            <div className="space-y-1 text-sm">
              {supportedFormats.models.map(format => (
                <div key={format} className="text-purple-300">{format.toUpperCase()}</div>
              ))}
            </div>
            <div className="text-xs text-purple-400 mt-2">
              Recommended: GLB/GLTF for best compatibility
            </div>
          </div>

          {/* Textures */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">🖼️</span>
              <span className="text-white font-semibold">Textures</span>
            </div>
            <div className="space-y-1 text-sm">
              {supportedFormats.textures.map(format => (
                <div key={format} className="text-purple-300">{format.toUpperCase()}</div>
              ))}
            </div>
            <div className="text-xs text-purple-400 mt-2">
              Recommended: PNG for transparency, JPG for performance
            </div>
          </div>

          {/* Audio */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">🎵</span>
              <span className="text-white font-semibold">Audio</span>
            </div>
            <div className="space-y-1 text-sm">
              {supportedFormats.audio.map(format => (
                <div key={format} className="text-purple-300">{format.toUpperCase()}</div>
              ))}
            </div>
            <div className="text-xs text-purple-400 mt-2">
              Recommended: MP3 for music, WAV for effects
            </div>
          </div>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💡 Upload Guidelines</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="text-white font-medium">File Size Limit</div>
              <div className="text-purple-300">Maximum 50MB per file for optimal performance</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="text-white font-medium">3D Model Optimization</div>
              <div className="text-purple-300">Use low-poly models (&lt;10k triangles) for better performance</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="text-white font-medium">Texture Resolution</div>
              <div className="text-purple-300">Recommended: 512x512 to 2048x2048 for balance of quality and performance</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="text-white font-medium">Audio Quality</div>
              <div className="text-purple-300">Use compressed formats (MP3/OGG) to reduce loading times</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">⚡ Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onSwitchTab()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>📂</span>
            <span>Browse Uploaded Assets</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>📁</span>
            <span>Select Files</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssetUploader