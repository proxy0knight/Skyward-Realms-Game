import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Modern Asset Manager for 3D Models and Textures
 * Handles caching, loading optimization, and memory management
 */
class AssetManager {
  constructor() {
    this.cache = new Map()
    this.loadingPromises = new Map()
    this.loadingManager = new THREE.LoadingManager()
    
    // Setup loaders
    this.gltfLoader = new GLTFLoader(this.loadingManager)
    this.textureLoader = new THREE.TextureLoader(this.loadingManager)
    
    // Setup DRACO decoder for compressed models
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    this.gltfLoader.setDRACOLoader(dracoLoader)
    
    // Loading statistics
    this.stats = {
      loaded: 0,
      total: 0,
      errors: 0
    }
    
    // Model presets for different quality levels
    this.qualityPresets = {
      low: { maxTriangles: 1000, textureSize: 512 },
      medium: { maxTriangles: 5000, textureSize: 1024 },
      high: { maxTriangles: 20000, textureSize: 2048 }
    }
    
    this.setupLoadingManager()
  }

  setupLoadingManager() {
    this.loadingManager.onLoad = () => {
      console.log('AssetManager: All assets loaded successfully')
    }
    
    this.loadingManager.onProgress = (url, loaded, total) => {
      this.stats.loaded = loaded
      this.stats.total = total
      console.log(`AssetManager: Loading progress ${loaded}/${total} - ${url}`)
    }
    
    this.loadingManager.onError = (url) => {
      this.stats.errors++
      console.error(`AssetManager: Failed to load ${url}`)
    }
  }

  /**
   * Load a 3D model with caching
   * @param {string} path - Path to the model file
   * @param {Object} options - Loading options
   * @returns {Promise<Object>} Loaded model data
   */
  async loadModel(path, options = {}) {
    const cacheKey = `model_${path}_${JSON.stringify(options)}`
    
    // Return cached version if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    // Return existing loading promise if in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }
    
    // Start loading
    const loadingPromise = this.loadModelInternal(path, options)
    this.loadingPromises.set(cacheKey, loadingPromise)
    
    try {
      const result = await loadingPromise
      this.cache.set(cacheKey, result)
      this.loadingPromises.delete(cacheKey)
      return result
    } catch (error) {
      this.loadingPromises.delete(cacheKey)
      throw error
    }
  }

  async loadModelInternal(path, options) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const processedModel = this.processModel(gltf, options)
          resolve(processedModel)
        },
        (progress) => {
          // Progress callback
        },
        (error) => {
          console.error(`AssetManager: Failed to load model ${path}:`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * Process loaded model for optimization
   * @param {Object} gltf - Loaded GLTF data
   * @param {Object} options - Processing options
   * @returns {Object} Processed model
   */
  processModel(gltf, options = {}) {
    const { optimize = true, castShadows = true, receiveShadows = true } = options
    
    const model = {
      scene: gltf.scene,
      animations: gltf.animations,
      geometries: [],
      materials: [],
      mixer: null
    }
    
    // Setup animations if present
    if (gltf.animations.length > 0) {
      model.mixer = new THREE.AnimationMixer(gltf.scene)
      model.actions = {}
      
      gltf.animations.forEach(clip => {
        model.actions[clip.name] = model.mixer.clipAction(clip)
      })
    }
    
    // Process meshes
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // Setup shadows
        child.castShadow = castShadows
        child.receiveShadow = receiveShadows
        
        // Store geometry and material references
        if (!model.geometries.includes(child.geometry)) {
          model.geometries.push(child.geometry)
        }
        if (!model.materials.includes(child.material)) {
          model.materials.push(child.material)
        }
        
        // Optimize geometry if requested
        if (optimize) {
          this.optimizeGeometry(child.geometry)
        }
      }
    })
    
    return model
  }

  /**
   * Optimize geometry for better performance
   * @param {THREE.BufferGeometry} geometry 
   */
  optimizeGeometry(geometry) {
    // Merge vertices
    geometry.mergeVertices()
    
    // Compute normals if missing
    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals()
    }
    
    // Compute bounding box/sphere for frustum culling
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
  }

  /**
   * Load texture with caching
   * @param {string} path - Path to texture
   * @param {Object} options - Texture options
   * @returns {Promise<THREE.Texture>} Loaded texture
   */
  async loadTexture(path, options = {}) {
    const cacheKey = `texture_${path}_${JSON.stringify(options)}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }
    
    const loadingPromise = new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          this.processTexture(texture, options)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
    
    this.loadingPromises.set(cacheKey, loadingPromise)
    
    try {
      const texture = await loadingPromise
      this.cache.set(cacheKey, texture)
      this.loadingPromises.delete(cacheKey)
      return texture
    } catch (error) {
      this.loadingPromises.delete(cacheKey)
      throw error
    }
  }

  /**
   * Process texture for optimization
   * @param {THREE.Texture} texture 
   * @param {Object} options 
   */
  processTexture(texture, options = {}) {
    const { 
      wrapS = THREE.RepeatWrapping, 
      wrapT = THREE.RepeatWrapping,
      minFilter = THREE.LinearMipmapLinearFilter,
      magFilter = THREE.LinearFilter,
      generateMipmaps = true
    } = options
    
    texture.wrapS = wrapS
    texture.wrapT = wrapT
    texture.minFilter = minFilter
    texture.magFilter = magFilter
    texture.generateMipmaps = generateMipmaps
  }

  /**
   * Preload essential assets for the game
   * @returns {Promise<void>}
   */
  async preloadEssentials() {
    // Skip asset loading for now - use pure procedural fallbacks for optimal performance
    const essentialAssets = []
    
    console.log('AssetManager: Preloading essential assets...')
    
    const loadPromises = essentialAssets.map(async (asset) => {
      try {
        if (asset.type === 'model') {
          const model = await this.loadModel(asset.path)
          this.cache.set(asset.key, model)
        } else if (asset.type === 'texture') {
          const texture = await this.loadTexture(asset.path)
          this.cache.set(asset.key, texture)
        }
        console.log(`AssetManager: Loaded ${asset.key}`)
      } catch (error) {
        console.warn(`AssetManager: Failed to preload ${asset.key}:`, error)
      }
    })
    
    await Promise.allSettled(loadPromises)
    console.log('AssetManager: Essential assets preloaded (procedural fallbacks ready!)')
  }

  /**
   * Create an instanced mesh from a cached model
   * @param {string} modelKey - Cache key for the model
   * @param {number} count - Number of instances
   * @param {Array} positions - Array of Vector3 positions
   * @returns {THREE.InstancedMesh|null} Instanced mesh
   */
  createInstancedMesh(modelKey, count, positions = []) {
    const model = this.cache.get(modelKey)
    if (!model || !model.geometries[0] || !model.materials[0]) {
      console.error(`AssetManager: Model ${modelKey} not found or invalid`)
      return null
    }
    
    const instancedMesh = new THREE.InstancedMesh(
      model.geometries[0],
      model.materials[0],
      count
    )
    
    // Set positions if provided
    const matrix = new THREE.Matrix4()
    positions.forEach((position, index) => {
      if (index < count) {
        matrix.setPosition(position.x || 0, position.y || 0, position.z || 0)
        instancedMesh.setMatrixAt(index, matrix)
      }
    })
    
    if (positions.length > 0) {
      instancedMesh.instanceMatrix.needsUpdate = true
    }
    
    return instancedMesh
  }

  /**
   * Get loading progress
   * @returns {Object} Loading statistics
   */
  getLoadingProgress() {
    return {
      loaded: this.stats.loaded,
      total: this.stats.total,
      progress: this.stats.total > 0 ? this.stats.loaded / this.stats.total : 0,
      errors: this.stats.errors
    }
  }

  /**
   * Clear cache and free memory
   */
  dispose() {
    // Dispose of geometries and materials
    this.cache.forEach((asset, key) => {
      if (asset.geometries) {
        asset.geometries.forEach(geometry => geometry.dispose())
      }
      if (asset.materials) {
        asset.materials.forEach(material => {
          if (material.map) material.map.dispose()
          if (material.normalMap) material.normalMap.dispose()
          if (material.roughnessMap) material.roughnessMap.dispose()
          material.dispose()
        })
      }
      if (asset.dispose) {
        asset.dispose()
      }
    })
    
    this.cache.clear()
    this.loadingPromises.clear()
    console.log('AssetManager: Cache cleared and memory freed')
  }
}

export default AssetManager 