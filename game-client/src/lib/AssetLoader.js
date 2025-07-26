/**
 * Enhanced Asset Loader with Memory Management for Babylon.js
 * Handles 3D model loading with advanced memory optimization
 */

import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import MemoryManager from './MemoryManager.js'
import { get as idbGet } from 'idb-keyval'

class AssetLoader {
  constructor(scene, options = {}) {
    this.scene = scene
    this.options = {
      enableMemoryManagement: options.enableMemoryManagement !== false,
      enableProgressiveLoading: options.enableProgressiveLoading !== false,
      enableAssetStreaming: options.enableAssetStreaming !== false,
      maxConcurrentLoads: options.maxConcurrentLoads || 3,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
      debugMode: options.debugMode || false,
      ...options
    }

    // Initialize memory manager
    if (this.options.enableMemoryManagement) {
      this.memoryManager = new MemoryManager(scene, {
        maxMemoryMB: options.maxMemoryMB || 512,
        maxModels: options.maxModels || 50,
        debugMode: this.options.debugMode
      })
    }

    // Loading queue and state
    this.loadingQueue = []
    this.activeLoads = new Set()
    this.loadedAssets = new Map()
    this.failedAssets = new Set()

    // Progressive loading
    this.lodLevels = new Map() // assetId -> LOD levels
    this.streamingAssets = new Map() // assetId -> streaming info

    // Performance tracking
    this.loadingStats = {
      totalLoaded: 0,
      totalFailed: 0,
      averageLoadTime: 0,
      totalLoadTime: 0
    }

    console.log('AssetLoader: Initialized with options:', this.options)
  }

  /**
   * Load a 3D model with advanced optimization
   */
  async loadModel(assetId, modelPath, options = {}) {
    try {
      // Check if already loaded
      if (this.loadedAssets.has(assetId)) {
        const asset = this.loadedAssets.get(assetId)
        if (this.options.debugMode) {
          console.log(`AssetLoader: Returning cached asset ${assetId}`)
        }
        return this.cloneAsset(asset, options)
      }

      // Check if currently loading
      if (this.activeLoads.has(assetId)) {
        return await this.waitForLoad(assetId)
      }

      // Check if previously failed
      if (this.failedAssets.has(assetId)) {
        throw new Error(`Asset ${assetId} previously failed to load`)
      }

      // Add to active loads
      this.activeLoads.add(assetId)

      // Load with memory management if enabled
      let result
      if (this.memoryManager) {
        result = await this.memoryManager.loadModel(assetId, modelPath, options)
      } else {
        result = await this.loadModelDirect(modelPath, options)
      }

      // Store the loaded asset
      this.loadedAssets.set(assetId, {
        mesh: result,
        loadTime: Date.now(),
        options: { ...options }
      })

      // Update stats
      this.updateLoadingStats(true)

      // Remove from active loads
      this.activeLoads.delete(assetId)

      if (this.options.debugMode) {
        console.log(`AssetLoader: Successfully loaded asset ${assetId}`)
      }

      return result

    } catch (error) {
      // Handle loading failure
      this.activeLoads.delete(assetId)
      this.failedAssets.add(assetId)
      this.updateLoadingStats(false)

      console.error(`AssetLoader: Failed to load asset ${assetId}:`, error)
      throw error
    }
  }

  /**
   * Load model directly without memory management
   */
  async loadModelDirect(modelPath, options = {}) {
    const startTime = performance.now()

    try {
      let result
      
      // Handle different model path types
      if (typeof modelPath === 'string' && modelPath.startsWith('data:')) {
        // Base64 data
        result = await BABYLON.SceneLoader.ImportMeshAsync('', '', modelPath, this.scene)
      } else if (typeof modelPath === 'string') {
        // File path
        const fileName = modelPath.split('/').pop()
        const rootUrl = modelPath.replace(fileName, '')
        result = await BABYLON.SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene)
      } else {
        throw new Error('Invalid model path format')
      }

      if (!result || !result.meshes || result.meshes.length === 0) {
        throw new Error('No valid meshes found in model')
      }

      // Find the root mesh
      const rootMesh = result.meshes.find(m => 
        m && m instanceof BABYLON.Mesh && m.getTotalVertices && m.getTotalVertices() > 0
      ) || result.meshes[0]

      if (!rootMesh) {
        throw new Error('No valid root mesh found')
      }

      // Apply basic optimizations
      await this.applyBasicOptimizations(result, options)

      const loadTime = performance.now() - startTime
      if (this.options.debugMode) {
        console.log(`AssetLoader: Direct load completed in ${loadTime.toFixed(2)}ms`)
      }

      return rootMesh

    } catch (error) {
      console.error('AssetLoader: Direct load failed:', error)
      throw error
    }
  }

  /**
   * Apply basic optimizations to loaded model
   */
  async applyBasicOptimizations(result, options = {}) {
    const { meshes, materials, textures } = result

    // Optimize meshes
    if (meshes) {
      for (const mesh of meshes) {
        if (mesh && mesh instanceof BABYLON.Mesh) {
          // Enable frustum culling
          mesh.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY
          
          // Freeze if requested
          if (options.freeze !== false) {
            mesh.freezeWorldMatrix()
          }

          // Optimize geometry
          if (mesh.geometry && !mesh.geometry._isOptimized) {
            mesh.geometry.optimize()
            mesh.geometry._isOptimized = true
          }
        }
      }
    }

    // Freeze materials
    if (materials && options.freeze !== false) {
      materials.forEach(material => {
        if (material && !material.isFrozen) {
          material.freeze()
        }
      })
    }
  }

  /**
   * Load character model with fallback support
   */
  async loadCharacterModel(element, playerData = {}) {
    const elementId = element.id || element
    const assetId = `character_${elementId}`

    try {
      // Try loading custom model from IndexedDB first
      const modelId = playerData.modelId || (playerData.element && playerData.element.modelId)
      if (modelId) {
        try {
          const base64Data = await idbGet(modelId)
          if (base64Data) {
            return await this.loadModel(assetId, base64Data, {
              type: 'character',
              element: elementId
            })
          }
        } catch (error) {
          console.warn(`AssetLoader: Failed to load custom model ${modelId}:`, error)
        }
      }

      // Try loading from public assets
      const modelPaths = [
        `/assets/models/characters/${elementId}.glb`,
        `/assets/models/characters/${elementId}_character.glb`,
        `/assets/models/${elementId}.glb`
      ]

      for (const modelPath of modelPaths) {
        try {
          if (await this.checkFileExists(modelPath)) {
            return await this.loadModel(assetId, modelPath, {
              type: 'character',
              element: elementId
            })
          }
        } catch (error) {
          console.warn(`AssetLoader: Failed to load ${modelPath}:`, error)
        }
      }

      // If all loading attempts fail, return null for fallback handling
      console.warn(`AssetLoader: No 3D model found for element ${elementId}, will use procedural fallback`)
      return null

    } catch (error) {
      console.error(`AssetLoader: Failed to load character model for ${elementId}:`, error)
      return null
    }
  }

  /**
   * Load environment assets
   */
  async loadEnvironmentAssets() {
    const environmentPaths = [
      '/textures/environment.env',
      '/textures/environment.hdr',
      '/textures/skybox.env',
      '/textures/world.env'
    ]

    for (const envPath of environmentPaths) {
      try {
        if (await this.checkFileExists(envPath)) {
          const texture = new BABYLON.CubeTexture(envPath, this.scene)
          this.scene.environmentTexture = texture
          
          if (this.options.debugMode) {
            console.log(`AssetLoader: Loaded environment texture: ${envPath}`)
          }
          
          return texture
        }
      } catch (error) {
        console.warn(`AssetLoader: Failed to load environment ${envPath}:`, error)
      }
    }

    // Create procedural environment if no texture found
    return this.createProceduralEnvironment()
  }

  /**
   * Create procedural environment
   */
  createProceduralEnvironment() {
    try {
      // Create a simple gradient skybox
      const skybox = BABYLON.MeshBuilder.CreateSphere('skybox', { diameter: 1000 }, this.scene)
      const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', this.scene)
      
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1.0)
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
      skyboxMaterial.backFaceCulling = false
      
      skybox.material = skyboxMaterial
      skybox.infiniteDistance = true

      // Add basic lighting
      const light = new BABYLON.HemisphericLight('envLight', new BABYLON.Vector3(0, 1, 0), this.scene)
      light.intensity = 0.7

      if (this.options.debugMode) {
        console.log('AssetLoader: Created procedural environment')
      }

      return skybox

    } catch (error) {
      console.error('AssetLoader: Failed to create procedural environment:', error)
      return null
    }
  }

  /**
   * Progressive loading for large assets
   */
  async loadProgressively(assetId, modelPath, options = {}) {
    if (!this.options.enableProgressiveLoading) {
      return await this.loadModel(assetId, modelPath, options)
    }

    try {
      // Load low-quality version first
      const lowQualityOptions = {
        ...options,
        quality: 'low',
        maxTextureSize: 512
      }

      const lowQualityMesh = await this.loadModel(`${assetId}_low`, modelPath, lowQualityOptions)

      // Load high-quality version in background
      setTimeout(async () => {
        try {
          const highQualityMesh = await this.loadModel(assetId, modelPath, options)
          
          // Replace low-quality with high-quality
          if (lowQualityMesh && highQualityMesh) {
            lowQualityMesh.dispose()
            this.loadedAssets.delete(`${assetId}_low`)
          }
        } catch (error) {
          console.warn(`AssetLoader: Failed to load high-quality version of ${assetId}:`, error)
        }
      }, 100)

      return lowQualityMesh

    } catch (error) {
      console.error(`AssetLoader: Progressive loading failed for ${assetId}:`, error)
      throw error
    }
  }

  /**
   * Check if file exists
   */
  async checkFileExists(filePath) {
    try {
      const response = await fetch(filePath, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Clone an asset efficiently
   */
  cloneAsset(asset, options = {}) {
    if (!asset || !asset.mesh) return null

    try {
      const clonedMesh = asset.mesh.clone(`${asset.mesh.name}_clone_${Date.now()}`)
      
      // Apply position, rotation, scaling
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
      console.error('AssetLoader: Failed to clone asset:', error)
      return null
    }
  }

  /**
   * Wait for an asset to finish loading
   */
  async waitForLoad(assetId, timeout = 30000) {
    const startTime = Date.now()
    
    while (this.activeLoads.has(assetId)) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Timeout waiting for asset ${assetId} to load`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (this.loadedAssets.has(assetId)) {
      return this.loadedAssets.get(assetId).mesh
    } else {
      throw new Error(`Asset ${assetId} failed to load`)
    }
  }

  /**
   * Update loading statistics
   */
  updateLoadingStats(success) {
    if (success) {
      this.loadingStats.totalLoaded++
    } else {
      this.loadingStats.totalFailed++
    }

    // Calculate average load time
    const total = this.loadingStats.totalLoaded + this.loadingStats.totalFailed
    if (total > 0) {
      this.loadingStats.averageLoadTime = this.loadingStats.totalLoadTime / total
    }
  }

  /**
   * Preload assets
   */
  async preloadAssets(assetList) {
    const loadPromises = assetList.map(async (asset) => {
      try {
        await this.loadModel(asset.id, asset.path, asset.options || {})
      } catch (error) {
        console.warn(`AssetLoader: Failed to preload ${asset.id}:`, error)
      }
    })

    await Promise.allSettled(loadPromises)
    
    if (this.options.debugMode) {
      console.log(`AssetLoader: Preloaded ${assetList.length} assets`)
    }
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      ...this.loadingStats,
      loadedAssets: this.loadedAssets.size,
      activeLoads: this.activeLoads.size,
      failedAssets: this.failedAssets.size,
      memoryStats: this.memoryManager ? this.memoryManager.getMemoryStats() : null
    }
  }

  /**
   * Clear cache and free memory
   */
  clearCache() {
    // Dispose loaded assets
    for (const [assetId, asset] of this.loadedAssets.entries()) {
      if (asset.mesh && asset.mesh.dispose) {
        asset.mesh.dispose()
      }
    }

    this.loadedAssets.clear()
    this.failedAssets.clear()
    this.activeLoads.clear()

    // Clear memory manager cache
    if (this.memoryManager) {
      this.memoryManager.dispose()
    }

    if (this.options.debugMode) {
      console.log('AssetLoader: Cache cleared')
    }
  }

  /**
   * Dispose the asset loader
   */
  dispose() {
    this.clearCache()
    
    if (this.memoryManager) {
      this.memoryManager.dispose()
    }

    console.log('AssetLoader: Disposed')
  }
}

export default AssetLoader