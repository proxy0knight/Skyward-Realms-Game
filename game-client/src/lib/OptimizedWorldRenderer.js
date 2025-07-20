import * as THREE from 'three'
import AssetManager from './AssetManager.js'

/**
 * Optimized World Renderer with external models and performance optimizations
 */
class OptimizedWorldRenderer {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    
    // Asset management
    this.assetManager = new AssetManager()
    
    // Performance optimization
    this.instancedMeshes = new Map()
    this.lodObjects = new Map()
    this.culledObjects = new Set()
    
    // Frustum culling
    this.frustum = new THREE.Frustum()
    this.cameraMatrix = new THREE.Matrix4()
    
    // Performance settings
    this.settings = {
      maxDrawDistance: 500,
      lodDistances: [50, 150, 300],
      instanceBatchSize: 100,
      cullingEnabled: true,
      lodEnabled: true
    }
    
    // World chunks for streaming
    this.worldChunks = new Map()
    this.chunkSize = 100
    this.loadedChunks = new Set()
    
    console.log('OptimizedWorldRenderer: Initialized')
  }

  /**
   * Initialize the optimized world renderer
   */
  async init() {
    console.log('OptimizedWorldRenderer: Loading essential assets...')
    
    try {
      // Preload essential assets
      await this.assetManager.preloadEssentials()
      
      // Create optimized materials
      this.createOptimizedMaterials()
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring()
      
      console.log('OptimizedWorldRenderer: Ready!')
      return true
    } catch (error) {
      console.error('OptimizedWorldRenderer: Failed to initialize:', error)
      return false
    }
  }

  /**
   * Create optimized materials with texture atlases
   */
  createOptimizedMaterials() {
    // Environment material with atlas
    this.environmentMaterial = new THREE.MeshLambertMaterial({
      map: this.assetManager.cache.get('env_atlas'),
      transparent: false,
      alphaTest: 0.5
    })
    
    // Vegetation material (for trees, grass)
    this.vegetationMaterial = new THREE.MeshLambertMaterial({
      map: this.assetManager.cache.get('env_atlas'),
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide
    })
    
    // Character material
    this.characterMaterial = new THREE.MeshLambertMaterial({
      map: this.assetManager.cache.get('char_atlas')
    })
  }

  /**
   * Create optimized forest using instanced rendering
   */
  async createOptimizedForest(positions) {
    console.log('OptimizedWorldRenderer: Creating optimized forest...')
    
    // Get tree model from cache
    const treeModel = this.assetManager.cache.get('tree_oak')
    if (!treeModel) {
      console.warn('OptimizedWorldRenderer: Tree model not found, using fallback')
      return this.createFallbackForest(positions)
    }
    
    // Create instanced mesh for trees
    const treeCount = Math.min(positions.length, 200) // Limit for performance
    const instancedTrees = new THREE.InstancedMesh(
      treeModel.geometries[0],
      this.vegetationMaterial.clone(),
      treeCount
    )
    
    // Set up tree positions with some variation
    const matrix = new THREE.Matrix4()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    
    for (let i = 0; i < treeCount; i++) {
      const position = positions[i] || { x: 0, y: 0, z: 0 }
      
      // Add variation to scale and rotation
      const scaleVariation = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
      scale.set(scaleVariation, scaleVariation, scaleVariation)
      
      // Random Y rotation
      quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2)
      
      // Set matrix
      matrix.compose(
        new THREE.Vector3(position.x, position.y, position.z),
        quaternion,
        scale
      )
      
      instancedTrees.setMatrixAt(i, matrix)
    }
    
    instancedTrees.instanceMatrix.needsUpdate = true
    instancedTrees.castShadow = true
    instancedTrees.receiveShadow = true
    
    this.scene.add(instancedTrees)
    this.instancedMeshes.set('trees', instancedTrees)
    
    console.log(`OptimizedWorldRenderer: Created ${treeCount} instanced trees`)
    return instancedTrees
  }

  /**
   * Create fallback forest if models fail to load
   */
  createFallbackForest(positions) {
    const treeGroup = new THREE.Group()
    
    // Simple procedural trees as fallback
    positions.slice(0, 100).forEach(pos => {
      const tree = this.createSimpleTree()
      tree.position.set(pos.x, pos.y, pos.z)
      tree.rotation.y = Math.random() * Math.PI * 2
      tree.scale.setScalar(0.8 + Math.random() * 0.4)
      treeGroup.add(tree)
    })
    
    this.scene.add(treeGroup)
    return treeGroup
  }

  /**
   * Create simple procedural tree for fallback
   */
  createSimpleTree() {
    const tree = new THREE.Group()
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8)
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 1.5
    tree.add(trunk)
    
    // Canopy
    const canopyGeometry = new THREE.SphereGeometry(2, 8, 6)
    const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 })
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial)
    canopy.position.y = 4
    canopy.scale.y = 0.8
    tree.add(canopy)
    
    return tree
  }

  /**
   * Create optimized terrain using model chunks
   */
  async createOptimizedTerrain(size = 200) {
    console.log('OptimizedWorldRenderer: Creating optimized terrain...')
    
    // Create terrain using multiple smaller chunks for better culling
    const chunkCount = 4
    const chunkSize = size / chunkCount
    
    for (let x = 0; x < chunkCount; x++) {
      for (let z = 0; z < chunkCount; z++) {
        const chunkX = (x - chunkCount / 2) * chunkSize
        const chunkZ = (z - chunkCount / 2) * chunkSize
        
        const terrainChunk = await this.createTerrainChunk(chunkX, chunkZ, chunkSize)
        this.scene.add(terrainChunk)
        
        // Store chunk for potential streaming
        const chunkKey = `${x}_${z}`
        this.worldChunks.set(chunkKey, terrainChunk)
      }
    }
  }

  /**
   * Create a single terrain chunk
   */
  async createTerrainChunk(x, z, size) {
    // Try to load terrain model, fallback to procedural
    const grassModel = this.assetManager.cache.get('grass')
    
    if (grassModel) {
      // Use model-based terrain
      const chunk = grassModel.scene.clone()
      chunk.position.set(x, 0, z)
      chunk.scale.set(size / 10, 1, size / 10) // Scale to fit chunk size
      return chunk
    } else {
      // Fallback to procedural terrain
      return this.createProceduralTerrainChunk(x, z, size)
    }
  }

  /**
   * Create procedural terrain chunk as fallback
   */
  createProceduralTerrainChunk(x, z, size) {
    const geometry = new THREE.PlaneGeometry(size, size, 32, 32)
    const material = new THREE.MeshLambertMaterial({ color: 0x4a5d23 })
    
    // Add some height variation
    const positions = geometry.attributes.position.array
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] = Math.random() * 2 // Y coordinate
    }
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    
    const chunk = new THREE.Mesh(geometry, material)
    chunk.rotation.x = -Math.PI / 2
    chunk.position.set(x, 0, z)
    chunk.receiveShadow = true
    
    return chunk
  }

  /**
   * Update performance optimizations each frame
   */
  update(deltaTime) {
    if (this.settings.cullingEnabled) {
      this.performFrustumCulling()
    }
    
    if (this.settings.lodEnabled) {
      this.updateLOD()
    }
    
    // Update world streaming
    this.updateWorldStreaming()
  }

  /**
   * Perform frustum culling to hide objects outside camera view
   */
  performFrustumCulling() {
    // Update frustum
    this.cameraMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    )
    this.frustum.setFromProjectionMatrix(this.cameraMatrix)
    
    // Check instanced meshes
    this.instancedMeshes.forEach((mesh, key) => {
      // For instanced meshes, we can't cull individual instances easily
      // So we check the entire mesh bounds
      if (mesh.geometry.boundingSphere) {
        const sphere = mesh.geometry.boundingSphere.clone()
        sphere.applyMatrix4(mesh.matrixWorld)
        
        if (!this.frustum.intersectsSphere(sphere)) {
          mesh.visible = false
          this.culledObjects.add(key)
        } else {
          mesh.visible = true
          this.culledObjects.delete(key)
        }
      }
    })
  }

  /**
   * Update Level of Detail based on distance
   */
  updateLOD() {
    const cameraPosition = this.camera.position
    
    // Update LOD for objects that support it
    this.lodObjects.forEach((lodData, objectId) => {
      const distance = cameraPosition.distanceTo(lodData.position)
      
      let targetLOD = 0
      if (distance > this.settings.lodDistances[2]) {
        targetLOD = 3 // Invisible or very low detail
      } else if (distance > this.settings.lodDistances[1]) {
        targetLOD = 2 // Low detail
      } else if (distance > this.settings.lodDistances[0]) {
        targetLOD = 1 // Medium detail
      }
      
      if (lodData.currentLOD !== targetLOD) {
        this.switchLOD(objectId, targetLOD)
      }
    })
  }

  /**
   * Switch object to different LOD level
   */
  switchLOD(objectId, lodLevel) {
    const lodData = this.lodObjects.get(objectId)
    if (!lodData) return
    
    // Hide current LOD
    if (lodData.currentMesh) {
      lodData.currentMesh.visible = false
    }
    
    // Show target LOD (if exists)
    if (lodData.lodMeshes[lodLevel]) {
      lodData.lodMeshes[lodLevel].visible = true
      lodData.currentMesh = lodData.lodMeshes[lodLevel]
      lodData.currentLOD = lodLevel
    }
  }

  /**
   * Update world streaming based on camera position
   */
  updateWorldStreaming() {
    const cameraPosition = this.camera.position
    const currentChunkX = Math.floor(cameraPosition.x / this.chunkSize)
    const currentChunkZ = Math.floor(cameraPosition.z / this.chunkSize)
    
    // Load chunks around player
    const loadRadius = 2
    for (let x = currentChunkX - loadRadius; x <= currentChunkX + loadRadius; x++) {
      for (let z = currentChunkZ - loadRadius; z <= currentChunkZ + loadRadius; z++) {
        const chunkKey = `${x}_${z}`
        
        if (!this.loadedChunks.has(chunkKey)) {
          this.loadChunk(x, z)
        }
      }
    }
    
    // Unload distant chunks
    this.loadedChunks.forEach(chunkKey => {
      const [x, z] = chunkKey.split('_').map(Number)
      const distance = Math.max(Math.abs(x - currentChunkX), Math.abs(z - currentChunkZ))
      
      if (distance > loadRadius + 1) {
        this.unloadChunk(x, z)
      }
    })
  }

  /**
   * Load a world chunk
   */
  async loadChunk(chunkX, chunkZ) {
    const chunkKey = `${chunkX}_${chunkZ}`
    
    if (this.loadedChunks.has(chunkKey)) return
    
    console.log(`OptimizedWorldRenderer: Loading chunk ${chunkKey}`)
    
    // Create chunk content
    const chunk = await this.createTerrainChunk(
      chunkX * this.chunkSize,
      chunkZ * this.chunkSize,
      this.chunkSize
    )
    
    this.scene.add(chunk)
    this.worldChunks.set(chunkKey, chunk)
    this.loadedChunks.add(chunkKey)
  }

  /**
   * Unload a world chunk
   */
  unloadChunk(chunkX, chunkZ) {
    const chunkKey = `${chunkX}_${chunkZ}`
    const chunk = this.worldChunks.get(chunkKey)
    
    if (chunk) {
      this.scene.remove(chunk)
      this.worldChunks.delete(chunkKey)
      this.loadedChunks.delete(chunkKey)
      
      // Dispose of geometry and materials to free memory
      chunk.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      
      console.log(`OptimizedWorldRenderer: Unloaded chunk ${chunkKey}`)
    }
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    this.performanceStats = {
      drawCalls: 0,
      triangles: 0,
      memoryUsage: 0,
      fps: 0
    }
    
    // Monitor draw calls
    const originalRender = this.renderer.render.bind(this.renderer)
    this.renderer.render = (scene, camera) => {
      this.performanceStats.drawCalls = this.renderer.info.render.calls
      this.performanceStats.triangles = this.renderer.info.render.triangles
      return originalRender(scene, camera)
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return {
      ...this.performanceStats,
      culledObjects: this.culledObjects.size,
      loadedChunks: this.loadedChunks.size,
      instancedMeshes: this.instancedMeshes.size
    }
  }

  /**
   * Dispose of resources
   */
  dispose() {
    // Dispose of instanced meshes
    this.instancedMeshes.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) mesh.material.dispose()
    })
    
    // Dispose of world chunks
    this.worldChunks.forEach(chunk => {
      chunk.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    })
    
    // Dispose of asset manager
    this.assetManager.dispose()
    
    console.log('OptimizedWorldRenderer: Disposed')
  }
}

export default OptimizedWorldRenderer