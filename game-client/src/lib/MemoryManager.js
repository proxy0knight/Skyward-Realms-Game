/**
 * Advanced Memory Manager for Babylon.js 3D Models
 * Prevents memory leaks and optimizes memory allocation for 3D assets
 */

import * as BABYLON from '@babylonjs/core'

class MemoryManager {
  constructor(scene, options = {}) {
    this.scene = scene
    this.options = {
      maxMemoryMB: options.maxMemoryMB || 512, // Maximum memory usage in MB
      maxModels: options.maxModels || 50, // Maximum number of loaded models
      gcInterval: options.gcInterval || 30000, // Garbage collection interval (30s)
      enableLOD: options.enableLOD !== false, // Enable Level of Detail
      enableInstancing: options.enableInstancing !== false, // Enable mesh instancing
      enableCompression: options.enableCompression !== false, // Enable texture compression
      debugMode: options.debugMode || false,
      ...options
    }

    // Memory tracking
    this.loadedModels = new Map() // modelId -> ModelInfo
    this.textureCache = new Map() // textureUrl -> Texture
    this.geometryCache = new Map() // geometryId -> Geometry
    this.materialCache = new Map() // materialId -> Material
    this.instancedMeshes = new Map() // meshId -> InstancedMesh[]
    
    // Memory statistics
    this.memoryStats = {
      totalMemoryMB: 0,
      modelsMemoryMB: 0,
      texturesMemoryMB: 0,
      geometryMemoryMB: 0,
      lastGC: Date.now(),
      gcCount: 0
    }

    // Performance monitoring
    this.performanceMonitor = {
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      fps: 60
    }

    // Initialize systems
    this.initializeGarbageCollection()
    this.initializePerformanceMonitoring()
    
    if (this.options.debugMode) {
      this.initializeDebugUI()
    }

    console.log('MemoryManager: Initialized with options:', this.options)
  }

  /**
   * Load a 3D model with memory optimization
   */
  async loadModel(modelId, modelPath, options = {}) {
    try {
      // Check if model is already loaded
      if (this.loadedModels.has(modelId)) {
        const modelInfo = this.loadedModels.get(modelId)
        modelInfo.lastUsed = Date.now()
        modelInfo.useCount++
        
        if (this.options.debugMode) {
          console.log(`MemoryManager: Reusing cached model ${modelId}`)
        }
        
        return this.cloneModel(modelInfo.rootMesh, options)
      }

      // Check memory limits before loading
      await this.checkMemoryLimits()

      // Load the model
      const startTime = performance.now()
      const result = await this.loadModelInternal(modelPath, options)
      const loadTime = performance.now() - startTime

      if (!result || !result.meshes || result.meshes.length === 0) {
        throw new Error(`No valid meshes found in model: ${modelPath}`)
      }

      // Find the root mesh
      const rootMesh = result.meshes.find(m => 
        m && m instanceof BABYLON.Mesh && m.getTotalVertices && m.getTotalVertices() > 0
      ) || result.meshes[0]

      if (!rootMesh) {
        throw new Error(`No valid root mesh found in model: ${modelPath}`)
      }

      // Optimize the loaded model
      await this.optimizeModel(result, options)

      // Calculate memory usage
      const memoryUsage = this.calculateModelMemoryUsage(result)

      // Store model info
      const modelInfo = {
        modelId,
        rootMesh,
        meshes: result.meshes,
        materials: result.materials || [],
        textures: result.textures || [],
        animationGroups: result.animationGroups || [],
        memoryUsageMB: memoryUsage,
        loadTime,
        lastUsed: Date.now(),
        useCount: 1,
        isOptimized: true
      }

      this.loadedModels.set(modelId, modelInfo)
      this.updateMemoryStats()

      if (this.options.debugMode) {
        console.log(`MemoryManager: Loaded model ${modelId} (${memoryUsage.toFixed(2)}MB, ${loadTime.toFixed(2)}ms)`)
      }

      return this.cloneModel(rootMesh, options)

    } catch (error) {
      console.error(`MemoryManager: Failed to load model ${modelId}:`, error)
      throw error
    }
  }

  /**
   * Internal model loading with error handling
   */
  async loadModelInternal(modelPath, options) {
    // Support different loading methods
    if (typeof modelPath === 'string' && modelPath.startsWith('data:')) {
      // Base64 data
      return await BABYLON.SceneLoader.ImportMeshAsync('', '', modelPath, this.scene)
    } else if (typeof modelPath === 'string') {
      // File path
      const fileName = modelPath.split('/').pop()
      const rootUrl = modelPath.replace(fileName, '')
      return await BABYLON.SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene)
    } else {
      throw new Error('Invalid model path format')
    }
  }

  /**
   * Optimize loaded model for memory and performance
   */
  async optimizeModel(result, options = {}) {
    const { meshes, materials, textures } = result

    // Optimize meshes
    if (meshes) {
      for (const mesh of meshes) {
        if (mesh && mesh instanceof BABYLON.Mesh) {
          await this.optimizeMesh(mesh, options)
        }
      }
    }

    // Optimize materials
    if (materials) {
      for (const material of materials) {
        if (material) {
          await this.optimizeMaterial(material, options)
        }
      }
    }

    // Optimize textures
    if (textures) {
      for (const texture of textures) {
        if (texture) {
          await this.optimizeTexture(texture, options)
        }
      }
    }
  }

  /**
   * Optimize individual mesh
   */
  async optimizeMesh(mesh, options = {}) {
    if (!mesh || !mesh.geometry) return

    try {
      // Enable mesh optimization
      if (this.options.enableLOD && !mesh.hasLODLevels) {
        this.createLODLevels(mesh)
      }

      // Optimize geometry
      if (mesh.geometry && !mesh.geometry._isOptimized) {
        mesh.geometry.optimize()
        mesh.geometry._isOptimized = true
      }

      // Enable instancing for repeated meshes
      if (this.options.enableInstancing) {
        this.enableMeshInstancing(mesh)
      }

      // Freeze mesh if it won't change
      if (options.freeze !== false && !mesh.isFrozen) {
        mesh.freezeWorldMatrix()
      }

      // Enable frustum culling
      mesh.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY

    } catch (error) {
      console.warn(`MemoryManager: Failed to optimize mesh ${mesh.name}:`, error)
    }
  }

  /**
   * Optimize material
   */
  async optimizeMaterial(material, options = {}) {
    if (!material) return

    try {
      // Cache material if not already cached
      const materialId = material.name || material.id
      if (!this.materialCache.has(materialId)) {
        this.materialCache.set(materialId, material)
      }

      // Freeze material if it won't change
      if (options.freeze !== false && !material.isFrozen) {
        material.freeze()
      }

    } catch (error) {
      console.warn(`MemoryManager: Failed to optimize material ${material.name}:`, error)
    }
  }

  /**
   * Optimize texture
   */
  async optimizeTexture(texture, options = {}) {
    if (!texture || !texture.url) return

    try {
      // Cache texture
      if (!this.textureCache.has(texture.url)) {
        this.textureCache.set(texture.url, texture)
      }

      // Enable texture compression if supported
      if (this.options.enableCompression && this.scene.getEngine().getCaps().s3tc) {
        if (texture.format === BABYLON.Engine.TEXTUREFORMAT_RGBA) {
          texture.format = BABYLON.Engine.TEXTUREFORMAT_COMPRESSED_RGBA_S3TC_DXT5
        }
      }

      // Optimize texture size based on distance
      if (options.maxTextureSize) {
        const maxSize = Math.min(options.maxTextureSize, 2048)
        if (texture.getSize().width > maxSize) {
          texture.updateSize(maxSize, maxSize)
        }
      }

    } catch (error) {
      console.warn(`MemoryManager: Failed to optimize texture ${texture.url}:`, error)
    }
  }

  /**
   * Create Level of Detail (LOD) levels for mesh
   */
  createLODLevels(mesh) {
    if (!mesh || mesh.hasLODLevels) return

    try {
      // Create simplified versions at different distances
      const distances = [25, 50, 100]
      const simplificationRatios = [0.7, 0.4, 0.1]

      for (let i = 0; i < distances.length; i++) {
        const lodMesh = mesh.clone(`${mesh.name}_LOD${i}`)
        if (lodMesh && lodMesh.simplify) {
          lodMesh.simplify([{
            quality: simplificationRatios[i],
            distance: distances[i]
          }])
          mesh.addLODLevel(distances[i], lodMesh)
        }
      }

      // Add null LOD for very far distances
      mesh.addLODLevel(200, null)

    } catch (error) {
      console.warn(`MemoryManager: Failed to create LOD for mesh ${mesh.name}:`, error)
    }
  }

  /**
   * Enable mesh instancing for repeated objects
   */
  enableMeshInstancing(mesh) {
    if (!mesh || mesh.instances) return

    const meshId = mesh.name || mesh.id
    if (!this.instancedMeshes.has(meshId)) {
      this.instancedMeshes.set(meshId, [])
    }

    // Store reference for potential instancing
    this.instancedMeshes.get(meshId).push(mesh)
  }

  /**
   * Clone a model efficiently
   */
  cloneModel(rootMesh, options = {}) {
    if (!rootMesh) return null

    try {
      const clonedMesh = rootMesh.clone(`${rootMesh.name}_clone_${Date.now()}`)
      
      // Apply any specific options to the clone
      if (options.position) {
        clonedMesh.position = options.position.clone()
      }
      if (options.rotation) {
        clonedMesh.rotation = options.rotation.clone()
      }
      if (options.scaling) {
        clonedMesh.scaling = options.scaling.clone()
      }

      return clonedMesh

    } catch (error) {
      console.error('MemoryManager: Failed to clone model:', error)
      return null
    }
  }

  /**
   * Check memory limits and free memory if needed
   */
  async checkMemoryLimits() {
    this.updateMemoryStats()

    // Check if we're approaching memory limits
    if (this.memoryStats.totalMemoryMB > this.options.maxMemoryMB * 0.8) {
      console.warn(`MemoryManager: Approaching memory limit (${this.memoryStats.totalMemoryMB}MB/${this.options.maxMemoryMB}MB)`)
      await this.freeUnusedMemory()
    }

    // Check model count limit
    if (this.loadedModels.size > this.options.maxModels) {
      console.warn(`MemoryManager: Too many models loaded (${this.loadedModels.size}/${this.options.maxModels})`)
      await this.freeOldestModels()
    }
  }

  /**
   * Free unused memory
   */
  async freeUnusedMemory() {
    const now = Date.now()
    const unusedThreshold = 60000 // 1 minute

    let freedMemory = 0

    // Free unused models
    for (const [modelId, modelInfo] of this.loadedModels.entries()) {
      if (now - modelInfo.lastUsed > unusedThreshold) {
        freedMemory += modelInfo.memoryUsageMB
        this.disposeModel(modelId)
      }
    }

    // Free unused textures
    for (const [url, texture] of this.textureCache.entries()) {
      if (texture.isReady() && texture.getInternalTexture() && 
          texture.getInternalTexture().references <= 1) {
        texture.dispose()
        this.textureCache.delete(url)
      }
    }

    // Run garbage collection
    await this.runGarbageCollection()

    if (this.options.debugMode && freedMemory > 0) {
      console.log(`MemoryManager: Freed ${freedMemory.toFixed(2)}MB of unused memory`)
    }
  }

  /**
   * Free oldest models when limit is reached
   */
  async freeOldestModels() {
    const modelsArray = Array.from(this.loadedModels.entries())
    modelsArray.sort((a, b) => a[1].lastUsed - b[1].lastUsed)

    const modelsToRemove = Math.ceil(this.loadedModels.size * 0.2) // Remove 20%
    
    for (let i = 0; i < modelsToRemove && i < modelsArray.length; i++) {
      const [modelId] = modelsArray[i]
      this.disposeModel(modelId)
    }

    await this.runGarbageCollection()
  }

  /**
   * Dispose a specific model and free its memory
   */
  disposeModel(modelId) {
    const modelInfo = this.loadedModels.get(modelId)
    if (!modelInfo) return

    try {
      // Dispose meshes
      if (modelInfo.meshes) {
        modelInfo.meshes.forEach(mesh => {
          if (mesh && mesh.dispose) {
            mesh.dispose()
          }
        })
      }

      // Dispose materials
      if (modelInfo.materials) {
        modelInfo.materials.forEach(material => {
          if (material && material.dispose) {
            material.dispose()
          }
        })
      }

      // Dispose textures
      if (modelInfo.textures) {
        modelInfo.textures.forEach(texture => {
          if (texture && texture.dispose) {
            texture.dispose()
          }
        })
      }

      // Dispose animation groups
      if (modelInfo.animationGroups) {
        modelInfo.animationGroups.forEach(animGroup => {
          if (animGroup && animGroup.dispose) {
            animGroup.dispose()
          }
        })
      }

      this.loadedModels.delete(modelId)

      if (this.options.debugMode) {
        console.log(`MemoryManager: Disposed model ${modelId} (${modelInfo.memoryUsageMB.toFixed(2)}MB freed)`)
      }

    } catch (error) {
      console.error(`MemoryManager: Error disposing model ${modelId}:`, error)
    }
  }

  /**
   * Calculate memory usage of a loaded model
   */
  calculateModelMemoryUsage(result) {
    let totalMemory = 0

    try {
      // Calculate mesh memory
      if (result.meshes) {
        result.meshes.forEach(mesh => {
          if (mesh && mesh.getTotalVertices) {
            const vertices = mesh.getTotalVertices()
            const indices = mesh.getTotalIndices ? mesh.getTotalIndices() : vertices
            // Rough calculation: vertices * 32 bytes + indices * 4 bytes
            totalMemory += (vertices * 32 + indices * 4) / (1024 * 1024)
          }
        })
      }

      // Calculate texture memory
      if (result.textures) {
        result.textures.forEach(texture => {
          if (texture && texture.getSize) {
            const size = texture.getSize()
            // Rough calculation: width * height * 4 bytes (RGBA)
            totalMemory += (size.width * size.height * 4) / (1024 * 1024)
          }
        })
      }

    } catch (error) {
      console.warn('MemoryManager: Error calculating memory usage:', error)
    }

    return totalMemory
  }

  /**
   * Update memory statistics
   */
  updateMemoryStats() {
    let totalMemory = 0
    let modelsMemory = 0

    // Calculate models memory
    for (const modelInfo of this.loadedModels.values()) {
      modelsMemory += modelInfo.memoryUsageMB
    }

    totalMemory = modelsMemory

    // Update stats
    this.memoryStats.totalMemoryMB = totalMemory
    this.memoryStats.modelsMemoryMB = modelsMemory

    // Get browser memory info if available
    if (performance.memory) {
      this.memoryStats.browserMemoryMB = performance.memory.usedJSHeapSize / (1024 * 1024)
    }
  }

  /**
   * Initialize garbage collection system
   */
  initializeGarbageCollection() {
    setInterval(async () => {
      await this.runGarbageCollection()
    }, this.options.gcInterval)
  }

  /**
   * Run garbage collection
   */
  async runGarbageCollection() {
    const startTime = performance.now()

    try {
      // Force browser garbage collection if available
      if (window.gc) {
        window.gc()
      }

      // Clean up Babylon.js internal caches
      if (this.scene.getEngine()) {
        this.scene.getEngine().wipeCaches(true)
      }

      // Update statistics
      this.memoryStats.lastGC = Date.now()
      this.memoryStats.gcCount++

      const gcTime = performance.now() - startTime

      if (this.options.debugMode) {
        console.log(`MemoryManager: Garbage collection completed in ${gcTime.toFixed(2)}ms`)
      }

    } catch (error) {
      console.error('MemoryManager: Error during garbage collection:', error)
    }
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring() {
    setInterval(() => {
      if (this.scene && this.scene.getEngine()) {
        this.performanceMonitor.fps = this.scene.getEngine().getFps()
        this.performanceMonitor.drawCalls = this.scene.getActiveMeshes().length
        
        // Calculate total triangles
        this.performanceMonitor.triangles = this.scene.getActiveMeshes().reduce((total, mesh) => {
          return total + (mesh.getTotalVertices ? Math.floor(mesh.getTotalVertices() / 3) : 0)
        }, 0)
      }
    }, 1000)
  }

  /**
   * Initialize debug UI
   */
  initializeDebugUI() {
    // Create debug info element
    const debugElement = document.createElement('div')
    debugElement.id = 'memory-manager-debug'
    debugElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
    `
    document.body.appendChild(debugElement)

    // Update debug info
    setInterval(() => {
      this.updateMemoryStats()
      debugElement.innerHTML = `
        <strong>Memory Manager Debug</strong><br>
        Models: ${this.loadedModels.size}/${this.options.maxModels}<br>
        Memory: ${this.memoryStats.totalMemoryMB.toFixed(1)}MB/${this.options.maxMemoryMB}MB<br>
        FPS: ${this.performanceMonitor.fps.toFixed(1)}<br>
        Draw Calls: ${this.performanceMonitor.drawCalls}<br>
        Triangles: ${this.performanceMonitor.triangles.toLocaleString()}<br>
        GC Count: ${this.memoryStats.gcCount}<br>
        Last GC: ${new Date(this.memoryStats.lastGC).toLocaleTimeString()}
      `
    }, 1000)
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats() {
    this.updateMemoryStats()
    return {
      ...this.memoryStats,
      loadedModels: this.loadedModels.size,
      cachedTextures: this.textureCache.size,
      cachedMaterials: this.materialCache.size,
      performance: this.performanceMonitor
    }
  }

  /**
   * Dispose the memory manager
   */
  dispose() {
    // Dispose all loaded models
    for (const modelId of this.loadedModels.keys()) {
      this.disposeModel(modelId)
    }

    // Clear caches
    this.textureCache.clear()
    this.materialCache.clear()
    this.geometryCache.clear()
    this.instancedMeshes.clear()

    // Remove debug UI
    const debugElement = document.getElementById('memory-manager-debug')
    if (debugElement) {
      debugElement.remove()
    }

    console.log('MemoryManager: Disposed')
  }
}

export default MemoryManager