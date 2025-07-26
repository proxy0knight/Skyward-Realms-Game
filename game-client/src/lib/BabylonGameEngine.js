// Minimal memory footprint - lazy imports
let BABYLON = null
let BabylonCharacter = null
let CannonJSPlugin = null
let idbGet = null

// Lightweight caches with size limits
const assetCache = new Map()
const modelCache = new Map()
const MAX_CACHE_SIZE = 10 // Limit cache size

// Memory monitoring
const memoryStats = {
  meshCount: 0,
  textureCount: 0,
  materialCount: 0
}

// Lazy import function with minimal modules
async function loadBabylonModules() {
  if (!BABYLON) {
    console.log('BabylonGameEngine: Loading minimal Babylon.js modules...')
    
    // Load only core modules
    BABYLON = await import('@babylonjs/core/Engines/engine')
    const sceneModule = await import('@babylonjs/core/scene')
    BABYLON.Scene = sceneModule.Scene
    
    const vectorModule = await import('@babylonjs/core/Maths/math.vector')
    BABYLON.Vector3 = vectorModule.Vector3
    BABYLON.Color3 = vectorModule.Color3
    BABYLON.Color4 = vectorModule.Color4
    
    const meshModule = await import('@babylonjs/core/Meshes/mesh')
    BABYLON.Mesh = meshModule.Mesh
    
    const meshBuilderModule = await import('@babylonjs/core/Meshes/meshBuilder')
    BABYLON.MeshBuilder = meshBuilderModule.MeshBuilder
    
    const cameraModule = await import('@babylonjs/core/Cameras/arcRotateCamera')
    BABYLON.ArcRotateCamera = cameraModule.ArcRotateCamera
    
    const lightModule = await import('@babylonjs/core/Lights/hemisphericLight')
    BABYLON.HemisphericLight = lightModule.HemisphericLight
    
    const materialModule = await import('@babylonjs/core/Materials/standardMaterial')
    BABYLON.StandardMaterial = materialModule.StandardMaterial
    
    // Import character after minimal Babylon is loaded
    const characterModule = await import('./BabylonCharacter.js')
    BabylonCharacter = characterModule.default
    
    console.log('BabylonGameEngine: Minimal Babylon.js modules loaded')
  }
  return BABYLON
}

// Cache management with size limits
function addToCache(cache, key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  cache.set(key, value)
}

// Memory cleanup helper
function forceGarbageCollection() {
  if (window.gc) {
    window.gc()
  }
  
  // Clear caches if memory is high
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize / 1024 / 1024 // MB
    if (used > 100) { // If using more than 100MB
      assetCache.clear()
      modelCache.clear()
      console.log('BabylonGameEngine: Cleared caches due to high memory usage')
    }
  }
}

const PHYSICS_BOXES_KEY = 'skyward_physics_boxes_'

class BabylonGameEngine {
  constructor() {
    this.engine = null
    this.scene = null
    this.camera = null
    this.canvas = null
    this.player = null
    
    // Physics
    this.physicsEngine = null
    
    // Systems
    this.waterSystem = null
    this.terrainSystem = null
    this.characterSystem = null
    this.audioSystem = null
    
    // Character
    this.babylonCharacter = null
    
    // Performance
    this.currentFPS = 0
    this.isRunning = false
    
    // Input
    this.inputMap = {}
    
    // Event system for compatibility with CombatSystem
    this.eventListeners = new Map()
    
  }

  /**
   * Initialize the Babylon.js engine
   */
  async init(container) {
    try {
      console.log('BabylonGameEngine: Starting initialization...')
      
      // Lazy load Babylon.js modules
      await loadBabylonModules()
      
      // Create canvas
      this.canvas = document.createElement('canvas')
      this.canvas.style.width = '100%'
      this.canvas.style.height = '100%'
      this.canvas.style.display = 'block'
      this.canvas.style.outline = 'none'
      container.appendChild(this.canvas)
      
      // Create minimal Babylon.js engine for low memory usage
      this.engine = new BABYLON.Engine(this.canvas, false, {
        powerPreference: 'low-power', // Prioritize low power consumption
        antialias: false, // No antialiasing
        stencil: false, // No stencil buffer
        alpha: false, // No alpha channel
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        doNotHandleContextLost: true,
        adaptToDeviceRatio: false, // Fixed ratio
        failIfMajorPerformanceCaveat: false // Allow low-end GPUs
      })
      
      // Aggressive memory settings
      this.engine.enableOfflineSupport = false
      this.engine.setHardwareScalingLevel(2) // Render at half resolution
      this.engine.disableManifestCheck = true
      
      // Create minimal scene
      this.scene = new BABYLON.Scene(this.engine)
      this.scene.gameEngine = this
      
      // Disable expensive features
      this.scene.fogEnabled = false
      this.scene.shadowsEnabled = false
      this.scene.particlesEnabled = false
      this.scene.spritesEnabled = false
      this.scene.skeletonsEnabled = false
      this.scene.audioEnabled = false
      
      // Setup minimal camera
      this.setupMinimalCamera()
      
      // Setup basic lighting only
      this.setupBasicLighting()
      
      // Skip physics for now to save memory
      console.log('BabylonGameEngine: Skipping physics to save memory')
      
      // Create minimal world
      await this.createMinimalWorld()

      // Setup aggressive optimizations
      this.setupAggressiveOptimizations()
      
      // Start render loop
      this.startRenderLoop()
      
      console.log('✅ BabylonGameEngine: Initialization complete!')
      return true
      
    } catch (error) {
      console.error('❌ BabylonGameEngine: Failed to initialize:', error)
      return false
    }
  }

  /**
   * Get starting map ID from localStorage
   */
  getStartingMapId() {
    // Check for MapEditor format first
    const startId = localStorage.getItem('startingMapId')
    if (startId) {
      return startId
    }
    
    // Fallback to old format
    const idx = JSON.parse(localStorage.getItem('skyward_maps_index') || '[]')
    let oldStartId = localStorage.getItem('skyward_starting_map')
    if (!oldStartId && idx.length > 0) oldStartId = idx[0].id
    
    // Check saved maps from MapEditor
    const savedMaps = JSON.parse(localStorage.getItem('savedMaps') || '[]')
    if (savedMaps.length > 0) {
      return savedMaps[0].id
    }
    
    // If no maps exist, create a default one
    if (!oldStartId || oldStartId === 'default') {
      this.ensureDefaultMapExists()
      return 'default'
    }
    
    return oldStartId
  }

  /**
   * Load map data by ID
   */
  loadMapData(mapId) {
    // Try MapEditor format first
    let data = localStorage.getItem('map_' + mapId)
    
    // Fallback to old format
    if (!data) {
      data = localStorage.getItem('skyward_world_map_' + mapId)
    }
    
    if (!data) {
      console.warn('BabylonGameEngine: No map data found for mapId:', mapId)
      
      // If it's the default map, create it
      if (mapId === 'default') {
        this.ensureDefaultMapExists()
        const defaultData = localStorage.getItem('skyward_world_map_default') || localStorage.getItem('map_default')
        if (defaultData) {
          return JSON.parse(defaultData)
        }
      }
      return null
    }
    
    const parsed = JSON.parse(data)
    
    // Handle MapEditor format (object with cells array)
    if (parsed && parsed.cells && Array.isArray(parsed.cells)) {
      console.log('BabylonGameEngine: Converting MapEditor format to engine format')
      return this.convertMapEditorFormat(parsed)
    }
    
    // Handle old engine format (direct 2D array)
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      console.warn('BabylonGameEngine: Loaded map data is empty or invalid for mapId:', mapId)
      return null
    }
    
    return parsed
  }

  /**
   * Convert MapEditor format to engine format
   */
  convertMapEditorFormat(mapData) {
    const { cells, size } = mapData
    const engineFormat = []
    
    for (let z = 0; z < size; z++) {
      engineFormat[z] = []
      for (let x = 0; x < size; x++) {
        const cell = cells[x] && cells[x][z] ? cells[x][z] : { terrain: 'grass', height: 0, objects: [], flags: {} }
        
        engineFormat[z][x] = {
          type: cell.terrain || 'grass',
          asset: null,
          flags: cell.flags || {},
          terrainHeightIndex: cell.height || 0,
          objects: (cell.objects || []).map(obj => ({
            assetId: obj.assetId,
            heightIndex: obj.heightOffset || 0
          }))
        }
        
        // Handle spawn areas
        if (cell.spawnArea) {
          engineFormat[z][x].flags.spawn = { heightIndex: 0 }
        }
      }
    }
    
    console.log('BabylonGameEngine: Converted MapEditor format, size:', size + 'x' + size)
    return engineFormat
  }

  /**
   * Ensure default map exists
   */
  ensureDefaultMapExists() {
    const existingMap = localStorage.getItem('skyward_world_map_default') || localStorage.getItem('map_default')
    if (existingMap) return
    
    console.log('BabylonGameEngine: Creating default map...')
    this.createAndSaveDefaultMap()
  }

  /**
   * Create and save a default map if none exists
   */
  createAndSaveDefaultMap() {
    const size = 16
    const defaultCell = { type: 'ground', asset: null, flags: {}, terrainHeightIndex: 0, objects: [] }
    const def = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ ...defaultCell })))
    
    // Add a spawn point at the center
    const centerX = Math.floor(size / 2)
    const centerZ = Math.floor(size / 2)
    def[centerZ][centerX].flags.spawn = { heightIndex: 0 }
    
    // Add some variety to the terrain
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        // Create a simple pattern with different terrain types
        if ((x + z) % 4 === 0) {
          def[z][x].type = 'grass'
        } else if ((x + z) % 6 === 0) {
          def[z][x].type = 'stone'
        } else {
          def[z][x].type = 'ground'
        }
      }
    }
    
    // Save in old format
    localStorage.setItem('skyward_world_map_default', JSON.stringify(def))
    
    // Also save in MapEditor format
    const mapEditorFormat = {
      id: 'default',
      name: 'Default World',
      size: size,
      cellSize: 10,
      cells: Array(size).fill(null).map((_, x) => 
        Array(size).fill(null).map((_, z) => ({
          x,
          z,
          terrain: def[z][x].type,
          height: def[z][x].terrainHeightIndex,
          objects: def[z][x].objects || [],
          flags: def[z][x].flags || {},
          spawnArea: null
        }))
      ),
      spawnPoints: [],
      teleports: [],
      createdAt: Date.now()
    }
    
    localStorage.setItem('map_default', JSON.stringify(mapEditorFormat))
    
    // Update both map indexes
    const mapsIndex = [{ id: 'default', name: 'Default World', size, isStarting: true }]
    localStorage.setItem('skyward_maps_index', JSON.stringify(mapsIndex))
    localStorage.setItem('skyward_starting_map', 'default')
    
    const savedMaps = [{ id: 'default', name: 'Default World', size }]
    localStorage.setItem('savedMaps', JSON.stringify(savedMaps))
    localStorage.setItem('startingMapId', 'default')
    
    console.log('BabylonGameEngine: Default map created with size', size + 'x' + size)
  }

  /**
   * Load world asset assignments from localStorage
   */
  loadWorldAssignments() {
    try {
      const data = localStorage.getItem('skyward_world_assignments')
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  /**
   * Load world characters from localStorage
   */
  loadWorldCharacters() {
    try {
      const data = localStorage.getItem('skyward_world_characters')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  /**
   * Get available characters for selection
   */
  getAvailableCharacters() {
    return this.worldCharacters || []
  }

  /**
   * Setup physics engine with Cannon.js
   */
  async setupPhysics() {
    try {
      // Import cannon dynamically
      const cannonModule = await import('cannon')
      const CANNON = cannonModule.default || cannonModule
      
      // Enable physics with Cannon.js
      this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new CannonJSPlugin(true, 10, CANNON))
      this.physicsEngine = this.scene.getPhysicsEngine()
      
    } catch (error) {
      console.warn('⚠️ Physics engine failed to initialize, using fallback:', error)
      // Fallback: disable physics features
      this.physicsEngine = null
    }
  }

  /**
   * Setup minimal camera
   */
  setupMinimalCamera() {
    try {
      // Create basic camera
      this.camera = new BABYLON.ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 2.5,
        10,
        BABYLON.Vector3.Zero(),
        this.scene
      )
      
      // Minimal settings
      this.camera.setTarget(BABYLON.Vector3.Zero())
      this.camera.lowerRadiusLimit = 5
      this.camera.upperRadiusLimit = 20
      
      console.log('BabylonGameEngine: Minimal camera created')
    } catch (error) {
      console.error('Camera setup failed:', error)
    }
  }

  /**
   * Setup basic lighting only
   */
  setupBasicLighting() {
    try {
      // Single hemispheric light
      const light = new BABYLON.HemisphericLight('basicLight', new BABYLON.Vector3(0, 1, 0), this.scene)
      light.intensity = 1
      console.log('BabylonGameEngine: Basic lighting created')
    } catch (error) {
      console.error('Lighting setup failed:', error)
    }
  }

  /**
   * Create minimal world
   */
  async createMinimalWorld() {
    console.log('BabylonGameEngine: Creating minimal world...')
    
    // Create simple ground plane
    try {
      const ground = BABYLON.MeshBuilder.CreateGround('ground', {
        width: 20,
        height: 20
      }, this.scene)
      
      const material = new BABYLON.StandardMaterial('groundMat', this.scene)
      material.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.3)
      ground.material = material
      
      memoryStats.meshCount++
      memoryStats.materialCount++
      
      console.log('BabylonGameEngine: Minimal ground created')
    } catch (error) {
      console.error('Failed to create minimal world:', error)
    }
  }

  /**
   * Setup aggressive optimizations
   */
  setupAggressiveOptimizations() {
    console.log('BabylonGameEngine: Applying aggressive optimizations...')
    
    if (!this.scene) return
    
    // Disable all expensive features
    this.scene.frustumCullingEnabled = true
    this.scene.occlusionQueryEnabled = false // Disable to save memory
    this.scene.cleanCachedTextureBuffer()
    
    // Set very aggressive hardware scaling
    this.engine.setHardwareScalingLevel(3) // Render at 1/3 resolution
    
    // Limit render targets
    this.scene.customRenderTargets = []
    
    console.log('BabylonGameEngine: Aggressive optimizations applied')
  }

  /**
   * Setup camera with advanced controls (LEGACY - keeping for compatibility)
   */
  setupCamera() {
    try {
      // Create arc rotate camera (third person)
      this.camera = new BABYLON.ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 2.5,
        10,
        BABYLON.Vector3.Zero(),
        this.scene
      )
      
      // Camera settings
      this.camera.setTarget(BABYLON.Vector3.Zero())
      
      // Camera constraints
      this.camera.lowerBetaLimit = 0.1
      this.camera.upperBetaLimit = Math.PI / 2
      this.camera.lowerRadiusLimit = 3
      this.camera.upperRadiusLimit = 50
      
      // Smooth controls
      this.camera.inertia = 0.5
      this.camera.angularSensibilityX = 1000
      this.camera.angularSensibilityY = 1000
      
      // Try to attach controls with multiple fallback methods
      this.attachCameraControls()
      
    } catch (error) {
      console.error('❌ Camera setup failed:', error)
      // Fallback: create simple free camera
      this.createFallbackCamera()
    }
  }

  /**
   * Attach camera controls with fallbacks
   */
  attachCameraControls() {
    try {
      // Method 1: Try attachControls if available
      if (this.camera.attachControls && typeof this.camera.attachControls === 'function') {
        this.camera.attachControls(this.canvas, true)
        return
      }
      
      // Method 2: Manual control setup
      this.setupManualCameraControls()
      
    } catch (error) {
      console.warn('⚠️ Camera controls setup failed:', error)
    }
  }

  /**
   * Setup manual camera controls as fallback
   */
  setupManualCameraControls() {
    if (!this.canvas) return
    
    let isPointerDown = false
    let lastPointerX = 0
    let lastPointerY = 0
    
    // Mouse lock state
    this.isMouseLocked = false
    
    // Click to lock mouse
    this.canvas.addEventListener('click', () => {
      if (!this.isMouseLocked) {
        this.lockMouse()
      }
    })
    
    // ESC to unlock mouse
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && this.isMouseLocked) {
        this.unlockMouse()
        event.preventDefault()
      }
    })
    
    // Pointer lock change events
    document.addEventListener('pointerlockchange', () => {
      this.isMouseLocked = document.pointerLockElement === this.canvas
    })
    
    // Mouse controls for locked mode
    document.addEventListener('mousemove', (event) => {
      if (!this.isMouseLocked) return
      
      const deltaX = event.movementX || 0
      const deltaY = event.movementY || 0
      
      this.camera.alpha -= deltaX * 0.003
      this.camera.beta -= deltaY * 0.003
      
      // Clamp beta to allow nearly full vertical range (look straight up and down)
      this.camera.beta = Math.max(0.001, Math.min(Math.PI - 0.001, this.camera.beta))
    })
    
    // Fallback: pointer events for non-locked mode
    this.canvas.addEventListener('pointerdown', (event) => {
      if (this.isMouseLocked) return
      
      isPointerDown = true
      lastPointerX = event.clientX
      lastPointerY = event.clientY
      this.canvas.setPointerCapture(event.pointerId)
    })
    
    this.canvas.addEventListener('pointerup', (event) => {
      if (this.isMouseLocked) return
      
      isPointerDown = false
      this.canvas.releasePointerCapture(event.pointerId)
    })
    
    this.canvas.addEventListener('pointermove', (event) => {
      if (this.isMouseLocked || !isPointerDown) return
      
      const deltaX = event.clientX - lastPointerX
      const deltaY = event.clientY - lastPointerY
      
      this.camera.alpha -= deltaX * 0.01
      this.camera.beta -= deltaY * 0.01
      
      // Clamp beta to allow nearly full vertical range (look straight up and down)
      this.camera.beta = Math.max(0.001, Math.min(Math.PI - 0.001, this.camera.beta))
      
      lastPointerX = event.clientX
      lastPointerY = event.clientY
    })
    
    // Wheel zoom
    this.canvas.addEventListener('wheel', (event) => {
      this.camera.radius += event.deltaY * 0.01
      this.camera.radius = Math.max(3, Math.min(50, this.camera.radius))
      event.preventDefault()
    })
  }

  /**
   * Lock mouse pointer for FPS-style camera control
   */
  lockMouse() {
    try {
      // Only call requestPointerLock in response to a user gesture
      // (This function should be called from a click event handler)
      if (document.activeElement === this.canvas) {
        this.canvas.requestPointerLock()
      }
    } catch (error) {
      console.warn('Pointer lock not supported:', error)
    }
  }

  /**
   * Unlock mouse pointer
   */
  unlockMouse() {
    try {
      document.exitPointerLock()
    } catch (error) {
      console.warn('Exit pointer lock failed:', error)
    }
  }

  /**
   * Create fallback camera if ArcRotateCamera fails
   */
  createFallbackCamera() {
    try {
      // Create simple universal camera
      this.camera = new BABYLON.UniversalCamera(
        'fallbackCamera',
        new BABYLON.Vector3(0, 5, -10),
        this.scene
      )
      
      this.camera.lookAt(BABYLON.Vector3.Zero())
    } catch (error) {
      console.error('❌ Even fallback camera failed:', error)
      // Create most basic camera
      this.camera = new BABYLON.Camera('basicCamera', BABYLON.Vector3.Zero(), this.scene)
    }
  }

  /**
   * Check if a file exists without causing warnings
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
   * Setup environment with fallback to procedural
   */
  async setupEnvironment() {
    const assigned = this.worldAssignments?.skybox
    if (assigned) {
      const asset = this.getAssetById(assigned)
      if (asset && asset.data) {
        // Try to load .env from base64 (not natively supported, but placeholder for backend integration)
        // For now, fallback to procedural skybox
        // TODO: Implement .env loading from base64 if possible
        this.createProceduralSkybox()
        return
      }
    }
    // Skip environment texture loading for now to avoid warnings
    // Future: Add proper environment texture support when files are available
    console.log('BabylonGameEngine: Using procedural skybox (environment textures disabled)')
    this.createProceduralSkybox()
    
    // TODO: Uncomment this when you want to enable environment texture loading
    /*
    const environmentPaths = [
      '/textures/environment.env',     // Babylon.js format
      '/textures/environment.hdr',     // HDR format  
      '/textures/skybox.env',         // Alternative name
      '/textures/world.env'           // Alternative name
    ]
    
    for (const envPath of environmentPaths) {
      const fileExists = await this.checkFileExists(envPath)
      if (fileExists) {
        try {
          console.log(`BabylonGameEngine: Loading environment: ${envPath}`)
          const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(envPath, this.scene)
          this.scene.environmentTexture = envTexture
          this.scene.createDefaultSkybox(envTexture, true, 1000)
          console.log(`✅ Loaded custom environment: ${envPath}`)
          return
        } catch (error) {
          console.log(`Failed to load environment ${envPath}:`, error.message)
        }
      }
    }
    
    console.log('BabylonGameEngine: No custom environment found, creating procedural skybox')
    this.createProceduralSkybox()
    */
  }

  /**
   * Create beautiful procedural skybox
   */
  createProceduralSkybox() {
    const skybox = BABYLON.MeshBuilder.CreateSphere('skyBox', {diameter:1000}, this.scene)
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene)
    skyboxMaterial.backFaceCulling = false
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1.0)
    skybox.material = skyboxMaterial
    skybox.infiniteDistance = true
    
    // Add gradient effect
    skyboxMaterial.disableLighting = true
  }

  /**
   * Setup advanced lighting with PBR
   */
  async setupLighting() {
    console.log('BabylonGameEngine: Setting up lighting...')
    
    // Try to load custom environment, fallback to procedural
    await this.setupEnvironment()
    
    // Main directional light (sun)
    const sunLight = new BABYLON.DirectionalLight('sunLight', new BABYLON.Vector3(-1, -1, -1), this.scene)
    sunLight.intensity = 1.5
    sunLight.diffuse = new BABYLON.Color3(1, 0.9, 0.8)
    sunLight.specular = new BABYLON.Color3(1, 1, 1)
    
    // Enable shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, sunLight)
    shadowGenerator.useExponentialShadowMap = true
    shadowGenerator.darkness = 0.3
    this.shadowGenerator = shadowGenerator
    
    // Hemisphere light for ambient
    const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), this.scene)
    hemiLight.intensity = 0.5
    hemiLight.diffuse = new BABYLON.Color3(0.8, 0.8, 1)
    hemiLight.groundColor = new BABYLON.Color3(0.4, 0.3, 0.2)
    
  }

  /**
   * Setup input handling
   */
  setupInput() {
    console.log('BabylonGameEngine: Setting up input...')
    
    // Keyboard input
    this.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          this.inputMap[kbInfo.event.code] = true
          this.handleKeyDown(kbInfo.event)
          break
        case BABYLON.KeyboardEventTypes.KEYUP:
          this.inputMap[kbInfo.event.code] = false
          break
      }
    })
    
    // Camera mode toggle (C key)
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyC') {
        this.toggleCameraMode()
      }
    })
    
  }

  /**
   * Create the game world
   */
  async createWorld() {
    console.log('BabylonGameEngine: Creating game world from map data...')
    if (!this.mapData) {
      console.warn('No map data found! Falling back to default terrain.')
      await this.loadEssentialAssets() // Load only essential assets
      return
    }
    // Load tool-asset assignments
    const toolAssets = JSON.parse(localStorage.getItem('skyward_tool_asset_assignments') || '{}')
    const assets = JSON.parse(localStorage.getItem('skyward_assets') || '[]')
    const getAssetById = (id) => assets.find(a => a.id === id)
    // For spawn/teleport
    let playerSpawn = null
    const teleportTriggers = []
    const heightStep = 1 // units per heightIndex
    for (let z = 0; z < this.mapData.length; z++) {
      for (let x = 0; x < this.mapData[z].length; x++) {
        const cell = this.mapData[z][x]
        // 1. Terrain mesh (with height index)
        let terrainY = (cell.terrainHeightIndex || 0) * heightStep
        let terrainAssetId = toolAssets[cell.type] || null
        let terrainAsset = terrainAssetId ? getAssetById(terrainAssetId) : null
        if (terrainAsset && terrainAsset.id) {
          const base64 = await idbGet(terrainAsset.id)
          if (base64) {
            try {
              const meshes = await this.loadGLBFromBase64(base64, `terrain_${x}_${z}`)
              // Place all meshes at correct Y
              if (meshes.length === 1 && meshes[0] instanceof BABYLON.Mesh) {
                meshes[0].position = new BABYLON.Vector3(x, terrainY, z)
                if (this.physicsEngine) {
                  meshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(
                    meshes[0],
                    BABYLON.PhysicsImpostor.BoxImpostor,
                    { mass: 0, restitution: 0.3, friction: 0.8 },
                    this.scene
                  )
                }
              } else if (meshes.length > 1) {
                // Create invisible box mesh at correct Y
                const box = BABYLON.MeshBuilder.CreateBox(`terrain_physbox_${x}_${z}`, { width: 1, height: 1, depth: 1 }, this.scene)
                box.position = new BABYLON.Vector3(x, terrainY, z)
                box.isVisible = false
                if (this.physicsEngine) {
                  box.physicsImpostor = new BABYLON.PhysicsImpostor(
                    box,
                    BABYLON.PhysicsImpostor.BoxImpostor,
                    { mass: 0, restitution: 0.3, friction: 0.8 },
                    this.scene
                  )
                }
                meshes.forEach(m => { m.parent = box; m.position = BABYLON.Vector3.Zero() })
              }
              console.log(`[Terrain] Placed ${cell.type} at (${x},${z}) height ${terrainY}`)
            } catch (e) {
              console.warn(`[createWorld] Failed to load terrain GLB for (${x},${z}):`, e)
              const box = BABYLON.MeshBuilder.CreateBox(`ground_${x}_${z}`, { width: 1, height: 0.2, depth: 1 }, this.scene)
              box.position = new BABYLON.Vector3(x, terrainY, z)
              box.material = new BABYLON.StandardMaterial('groundMat', this.scene)
              box.material.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.3)
              this.ensurePhysicsBox(box, new BABYLON.Vector3(x, terrainY, z), {width: 1, height: 0.2, depth: 1})
            }
          } else {
            console.warn(`[TERRAIN] No GLB data found in IndexedDB for terrain asset '${terrainAsset.id}' at (${x},${z}), using default box.`)
            const box = BABYLON.MeshBuilder.CreateBox(`ground_${x}_${z}`, { width: 1, height: 0.2, depth: 1 }, this.scene)
            box.position = new BABYLON.Vector3(x, terrainY, z)
            box.material = new BABYLON.StandardMaterial('groundMat', this.scene)
            box.material.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.3)
            this.ensurePhysicsBox(box, new BABYLON.Vector3(x, terrainY, z), {width: 1, height: 0.2, depth: 1})
          }
        } else {
          if (terrainAssetId) {
            console.warn(`[TERRAIN] No asset found for terrain type '${cell.type}' with id '${terrainAssetId}' at (${x},${z}), using default box.`)
          }
          const box = BABYLON.MeshBuilder.CreateBox(`ground_${x}_${z}`, { width: 1, height: 0.2, depth: 1 }, this.scene)
          box.position = new BABYLON.Vector3(x, terrainY, z)
          box.material = new BABYLON.StandardMaterial('groundMat', this.scene)
          box.material.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.3)
          this.ensurePhysicsBox(box, new BABYLON.Vector3(x, terrainY, z), {width: 1, height: 0.2, depth: 1})
        }
        // 2. Per-object asset placement
        if (cell.objects && Array.isArray(cell.objects)) {
          for (const obj of cell.objects) {
            const asset = getAssetById(obj.assetId)
            if (asset && asset.id) {
              const base64 = await idbGet(asset.id)
              if (base64) {
                try {
                  const meshes = await this.loadGLBFromBase64(base64, `asset_${x}_${z}_${obj.assetId}`)
                  const y = terrainY + (obj.heightIndex || 0) * heightStep
                  if (meshes.length === 1 && meshes[0] instanceof BABYLON.Mesh) {
                    meshes[0].position = new BABYLON.Vector3(x, y, z)
                    if (this.physicsEngine) {
                      meshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(
                        meshes[0],
                        BABYLON.PhysicsImpostor.BoxImpostor,
                        { mass: 0, restitution: 0.3, friction: 0.8 },
                        this.scene
                      )
                    }
                  } else if (meshes.length > 1) {
                    const box = BABYLON.MeshBuilder.CreateBox(`obj_physbox_${x}_${z}_${obj.assetId}`, { width: 1, height: 1, depth: 1 }, this.scene)
                    box.position = new BABYLON.Vector3(x, y, z)
                    box.isVisible = false
                    if (this.physicsEngine) {
                      box.physicsImpostor = new BABYLON.PhysicsImpostor(
                        box,
                        BABYLON.PhysicsImpostor.BoxImpostor,
                        { mass: 0, restitution: 0.3, friction: 0.8 },
                        this.scene
                      )
                    }
                    meshes.forEach(m => { m.parent = box; m.position = BABYLON.Vector3.Zero() })
                  }
                  console.log(`[Object] Placed asset ${obj.assetId} at (${x},${z}) height ${y}`)
                } catch (e) {
                  console.error(`[ASSET] Failed to load GLB for asset '${asset.id}' at (${x},${z}):`, e)
                }
              }
            }
          }
        }
        // 3. Flags (if rendering as 3D objects, use terrainY + flag.heightIndex * heightStep)
        if (cell.flags) {
          for (const flag in cell.flags) {
            const flagData = cell.flags[flag]
            if (flagData && typeof flagData.heightIndex === 'number') {

              // Example: render a flag marker at (x, fy, z) if desired
              // BABYLON.MeshBuilder.CreateBox(`flag_${flag}_${x}_${z}`, { size: 0.3 }, this.scene).position = new BABYLON.Vector3(x, fy, z)
            }
          }
          // Spawn
          if (cell.flags.spawn) {
            if (!playerSpawn) {
              playerSpawn = { x, z }
            }
          }
          // Tree spawn
          if (cell.flags.tree_spawn) {
            // If you have a tree asset, try to load it here (add your logic)
          }
          // Teleport
          if (cell.flags.teleport) {
            const trigger = BABYLON.MeshBuilder.CreateBox(`teleport_${x}_${z}`, { width: 1, height: 1, depth: 1 }, this.scene)
            trigger.position = new BABYLON.Vector3(x, 0.5, z)
            trigger.isVisible = false
            trigger.isPickable = false
            trigger.metadata = { teleport: cell.flags.teleport }
            teleportTriggers.push(trigger)
          }
        }
      }
    }
    // Place player at spawn
    if (playerSpawn) {
      console.log('BabylonGameEngine: Player spawn found at:', playerSpawn)
      if (this.babylonCharacter) {
        this.babylonCharacter.setPosition(new BABYLON.Vector3(playerSpawn.x, 2, playerSpawn.z))
        this.camera.setTarget(this.babylonCharacter.getPosition())
      }
    } else {
      console.warn('No player spawn point found in map! Using center position.')
      const mapCenter = this.mapData ? { x: Math.floor(this.mapData[0].length / 2), z: Math.floor(this.mapData.length / 2) } : { x: 0, z: 0 }
      if (this.babylonCharacter) {
        this.babylonCharacter.setPosition(new BABYLON.Vector3(mapCenter.x, 2, mapCenter.z))
        this.camera.setTarget(this.babylonCharacter.getPosition())
      }
    }
    // Teleport logic: check player collision with triggers
    this.scene.registerBeforeRender(() => {
      if (!this.babylonCharacter) return
      const pos = this.babylonCharacter.getPosition()
      for (const trigger of teleportTriggers) {
        if (BABYLON.Vector3.Distance(trigger.position, pos) < 0.7) {
          const tp = trigger.metadata.teleport
          if (tp && tp.toMapId) {
            console.log('Teleporting to map:', tp.toMapId)
            this.loadMapAndTeleport(tp.toMapId)
            break
          }
        }
      }
    })
  }

  /**
   * Load a map by ID and teleport player to first spawn or first cell
   */
  async loadMapAndTeleport(mapId) {
    this.mapData = this.loadMapData(mapId)
    if (!this.mapData) return
    // Remove all meshes from scene
    this.scene.meshes.slice().forEach(m => m.dispose())
    // Rebuild world
    await this.createWorld()
    // Place player at spawn or (0,0)
    let spawn = null
    for (let z = 0; z < this.mapData.length; z++) {
      for (let x = 0; x < this.mapData[z].length; x++) {
        if (this.mapData[z][x].flags && this.mapData[z][x].flags.spawn) {
          spawn = { x, z }
          break
        }
      }
      if (spawn) break
    }
    if (!spawn) spawn = { x: 0, z: 0 }
    if (this.babylonCharacter) {
      this.babylonCharacter.setPosition(new BABYLON.Vector3(spawn.x, 2, spawn.z))
      this.camera.setTarget(this.babylonCharacter.getPosition())
    }
  }

  /**
   * Create advanced terrain system (use assigned asset if available)
   */
  async createTerrain() {
    const assigned = this.worldAssignments?.terrain
    if (assigned) {
      // Try to load assigned terrain model from localStorage assets
      const asset = this.getAssetById(assigned)
      if (asset && asset.data) {
        await this.loadGLBFromBase64(asset.data, 'assignedTerrain')
        return
      }
    }
    console.log('BabylonGameEngine: Creating terrain...')
    // Create simple terrain (skip heightmap to avoid texture loading issues)
    const simpleTerrain = BABYLON.MeshBuilder.CreateGround('terrain', {
      width: 400,
      height: 400,
      subdivisions: 100
    }, this.scene)
    const terrainMaterial = new BABYLON.PBRMaterial('terrainMaterial', this.scene)
    terrainMaterial.baseColor = new BABYLON.Color3(0.2, 0.6, 0.2)
    terrainMaterial.roughness = 0.8
    terrainMaterial.metallic = 0.1
    simpleTerrain.material = terrainMaterial
    simpleTerrain.receiveShadows = true
    // Use ensurePhysicsBox for terrain
    this.ensurePhysicsBox(simpleTerrain, new BABYLON.Vector3(200, 0, 200), {width: 400, height: 0.2, depth: 400})
  }

  /**
   * Create water (use assigned asset if available)
   */
  async createWater() {
    const assigned = this.worldAssignments?.water
    if (assigned) {
      const asset = this.getAssetById(assigned)
      if (asset && asset.data) {
        await this.loadGLBFromBase64(asset.data, 'assignedWater')
        return
      }
    }
    console.log('BabylonGameEngine: Creating water system...')
    // Create water mesh
    const waterMesh = BABYLON.MeshBuilder.CreateGround('water', {
      width: 50,
      height: 50,
      subdivisions: 32
    }, this.scene)
    // Simple water material (avoid texture dependencies)
    const waterMaterial = new BABYLON.PBRMaterial('waterMaterial', this.scene)
    waterMaterial.baseColor = new BABYLON.Color3(0, 0.3, 0.6)
    waterMaterial.roughness = 0.1
    waterMaterial.metallic = 0.0
    waterMaterial.alpha = 0.8
    waterMesh.material = waterMaterial
    waterMesh.position.y = 2
    // Use ensurePhysicsBox for water
    this.ensurePhysicsBox(waterMesh, waterMesh.position, {width: 50, height: 0.2, depth: 50})
    this.waterMesh = waterMesh
  }

  /**
   * Create vegetation with instancing
   */
  async createVegetation() {
    console.log('BabylonGameEngine: Creating vegetation...')
    
    // Create tree template
    const treeTrunk = BABYLON.MeshBuilder.CreateCylinder('treeTrunk', {
      height: 3,
      diameterTop: 0.3,
      diameterBottom: 0.5,
      tessellation: 8
    }, this.scene)
    
    const treeCanopy = BABYLON.MeshBuilder.CreateSphere('treeCanopy', {
      diameter: 4,
      segments: 8
    }, this.scene)
    treeCanopy.position.y = 2.5
    
    // Materials
    const trunkMaterial = new BABYLON.PBRMaterial('trunkMaterial', this.scene)
    trunkMaterial.baseColor = new BABYLON.Color3(0.4, 0.2, 0.1)
    trunkMaterial.roughness = 0.9
    treeTrunk.material = trunkMaterial
    
    const canopyMaterial = new BABYLON.PBRMaterial('canopyMaterial', this.scene)
    canopyMaterial.baseColor = new BABYLON.Color3(0.1, 0.5, 0.1)
    canopyMaterial.roughness = 0.8
    treeCanopy.material = canopyMaterial
    
    // Merge into single tree mesh
    const treeMesh = BABYLON.Mesh.MergeMeshes([treeTrunk, treeCanopy], true)
    treeMesh.name = 'tree'
    
    // Enable shadows
    this.shadowGenerator.addShadowCaster(treeMesh)
    treeMesh.receiveShadows = true
    
    // Instance trees
    const treePositions = []
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 300
      const z = (Math.random() - 0.5) * 300
      const y = 1.5
      const treeInstance = treeMesh.createInstance(`tree_${i}`)
      treeInstance.scaling = new BABYLON.Vector3(
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.4
      )
      this.ensurePhysicsBox(treeInstance, new BABYLON.Vector3(x, y, z), {width: 1, height: 3, depth: 1})
      treePositions.push(treeInstance)
    }
    
    // Hide original
    treeMesh.setEnabled(false)
    
  }

  /**
   * Get terrain height at specific coordinates
   */
  getTerrainHeight(x, z) {
    if (!this.terrain) {
      return 1 // Default height if no terrain
    }
    
    // Use raycast to find terrain height
    const ray = new BABYLON.Ray(
      new BABYLON.Vector3(x, 100, z),
      new BABYLON.Vector3(0, -1, 0)
    )
    
    const hit = this.scene.pickWithRay(ray, (mesh) => {
      return mesh === this.terrain
    })
    
    if (hit && hit.hit) {
      return hit.pickedPoint.y
    }
    
    return 1 // Default safe height
  }

  /**
   * Create player with GLB character model
   */
  async createPlayer(playerData) {
    console.log('BabylonGameEngine: Creating enhanced player character...')
    
    // Create Babylon character
    this.babylonCharacter = new BabylonCharacter(this.scene, playerData)
    const characterGroup = await this.babylonCharacter.init()
    
    // Set as player
    this.player = characterGroup
    
    // Position player on terrain surface
    const terrainHeight = this.getTerrainHeight(0, 0)
    this.babylonCharacter.setPosition(new BABYLON.Vector3(0, terrainHeight + 2, 0))
    
    // Update camera target
    this.camera.setTarget(this.babylonCharacter.getPosition())
    
  }

  /**
   * Setup rendering optimizations
   */
  setupOptimizations() {
    console.log('BabylonGameEngine: Setting up optimizations...')
    
    // Enable frustum culling
    this.scene.frustumCullingEnabled = true
    
    // Enable LOD
    this.scene.lodGenerationOffset = 0.5
    this.scene.lodGenerationTransitionTime = 0.5
    
    // Enable occlusion culling
    this.scene.occlusionQueryEnabled = true
    
    // Hardware scaling
    this.engine.setHardwareScalingLevel(1)
    
    // Optimize materials
    this.scene.cleanCachedTextureBuffer()
    
  }

  /**
   * Handle keyboard input
   */
  handleKeyDown(event) {
    if (!this.babylonCharacter) return
    
    switch (event.code) {
      case 'Space':
        // Jump
        this.babylonCharacter.jump()
        break
    }
  }

  /**
   * Update player movement
   */
  updateMovement() {
    if (!this.babylonCharacter) return
    
    const moveVector = new BABYLON.Vector3()
    
    // Get camera direction
    const cameraDirection = this.camera.getTarget().subtract(this.camera.position).normalize()
    const cameraRight = BABYLON.Vector3.Cross(cameraDirection, BABYLON.Vector3.Up()).normalize()
    
    // Calculate movement
    if (this.inputMap['KeyW']) {
      moveVector.addInPlace(cameraDirection)
    }
    if (this.inputMap['KeyS']) {
      moveVector.addInPlace(cameraDirection.scale(-1))
    }
    if (this.inputMap['KeyA']) {
      moveVector.addInPlace(cameraRight.scale(-1))
    }
    if (this.inputMap['KeyD']) {
      moveVector.addInPlace(cameraRight)
    }
    
    // Running (Shift key)
    const isRunning = !!this.inputMap['ShiftLeft'] || !!this.inputMap['ShiftRight']
    
    // Apply movement
    if (moveVector.length() > 0) {
      moveVector.normalize()
      this.babylonCharacter.move(moveVector, isRunning)
    } else {
      this.babylonCharacter.move(new BABYLON.Vector3(0, 0, 0), false)
    }
    
    // Update camera target
    this.updateCameraFollow()
  }

  /**
   * Update camera follow/position based on camera mode
   */
  updateCameraFollow() {
    if (!this.babylonCharacter) return
    // Third-person: follow character
    if (this.babylonCharacter.cameraMode === 'third') {
      this.camera.setTarget(this.babylonCharacter.getPosition())
      // Show character mesh
      if (this.babylonCharacter.characterMesh) {
        this.babylonCharacter.characterMesh.isVisible = true
      }
      // (Optional: adjust camera position for third-person)
    } else if (this.babylonCharacter.cameraMode === 'first') {
      // First-person: move camera to character head position
      const pos = this.babylonCharacter.getPosition()
      // Place camera at head height, slightly forward
      const headOffset = new BABYLON.Vector3(0, 1.5, 0)
      const forward = this.camera.getTarget().subtract(this.camera.position).normalize()
      const cameraPos = pos.add(headOffset).add(forward.scale(0.2))
      this.camera.position = cameraPos
      this.camera.setTarget(pos.add(headOffset).add(forward.scale(2)))
      // Hide character mesh
      if (this.babylonCharacter.characterMesh) {
        this.babylonCharacter.characterMesh.isVisible = false
      }
    }
  }

  /**
   * Toggle camera mode (first/third person)
   */
  toggleCameraMode() {
    if (this.babylonCharacter) {
      this.babylonCharacter.toggleCameraMode()
    }
    // Camera logic handled in updateCameraFollow
  }

  /**
   * Start the render loop
   */
  startRenderLoop() {
    console.log('BabylonGameEngine: Starting render loop...')
    
    this.isRunning = true
    
    this.engine.runRenderLoop(() => {
      if (!this.isRunning) return
      
      // Update movement
      this.updateMovement()
      
      // Update FPS
      this.currentFPS = this.engine.getFps()
      
      // Render scene
      this.scene.render()
    })
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.engine.resize()
    })
    
  }

  /**
   * Get current FPS
   */
  getFPS() {
    return Math.round(this.currentFPS)
  }

  /**
   * Get mouse lock status
   */
  getMouseLockStatus() {
    return this.isMouseLocked || false
  }

  /**
   * Add game object to scene (compatibility method for WorldManager)
   */
  addGameObject(id, object) {
    // For Babylon.js, we'll add objects directly to the scene
    if (object.mesh) {
      this.scene.addMesh(object.mesh)
    }
    
    // Store reference for later removal if needed
    if (!this.gameObjects) {
      this.gameObjects = new Map()
    }
    this.gameObjects.set(id, object)
    
  }

  /**
   * Remove game object from scene
   */
  removeGameObject(id) {
    if (!this.gameObjects || !this.gameObjects.has(id)) return
    
    const object = this.gameObjects.get(id)
    if (object.mesh) {
      object.mesh.dispose()
    }
    
    this.gameObjects.delete(id)
  }

  /**
   * Add event listener (compatibility method for CombatSystem)
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) return
    
    const listeners = this.eventListeners.get(event)
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, ...args) {
    if (!this.eventListeners.has(event)) return
    
    const listeners = this.eventListeners.get(event)
    listeners.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  /**
   * Start the engine (compatibility method)
   */
  start() {
    if (!this.isRunning) {
      this.isRunning = true
      console.log('BabylonGameEngine: Started')
    }
  }

  /**
   * Stop the engine
   */
  stop() {
    this.isRunning = false
    if (this.engine) {
      this.engine.dispose()
    }
  }

  /**
   * Chunk loading for large models
   */
  async loadModelChunk(modelPath, chunkSize = 1024 * 1024) { // 1MB chunks
    if (modelCache.has(modelPath)) {
      return modelCache.get(modelPath)
    }

    try {
      const response = await fetch(modelPath)
      if (!response.ok) throw new Error(`Failed to load ${modelPath}`)
      
      const chunks = []
      const reader = response.body.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      const blob = new Blob(chunks)
      const arrayBuffer = await blob.arrayBuffer()
      
      // Cache the model data
      modelCache.set(modelPath, arrayBuffer)
      
      return arrayBuffer
    } catch (error) {
      console.warn(`Failed to load model chunk ${modelPath}:`, error)
      throw error
    }
  }

  /**
   * Unload unused assets to free memory
   */
  unloadUnusedAssets() {
    if (!this.scene) return
    
    console.log('BabylonGameEngine: Cleaning up unused assets...')
    
    // Clear texture cache
    this.scene.textures.forEach(texture => {
      if (texture.isReady() && texture.getInternalTexture()) {
        texture.dispose()
      }
    })
    
    // Clear unused meshes
    this.scene.meshes.forEach(mesh => {
      if (mesh.metadata?.temporary) {
        mesh.dispose()
      }
    })
    
    // Clear material cache
    this.scene.materials.forEach(material => {
      if (!material.isFrozen && material.getActiveTextures().length === 0) {
        material.dispose()
      }
    })
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc()
    }
    
    console.log('BabylonGameEngine: Asset cleanup completed')
  }

  /**
   * Load only essential assets
   */
  async loadEssentialAssets() {
    console.log('BabylonGameEngine: Loading essential assets only...')
    
    // Only load basic terrain and player character
    const essentialAssets = [
      'terrain',
      'player_character'
    ]
    
    for (const assetType of essentialAssets) {
      if (assetCache.has(assetType)) continue
      
      try {
        // Load asset based on type
        switch (assetType) {
          case 'terrain':
            await this.createTerrain()
            break
          case 'player_character':
            // Character will be loaded when needed
            break
        }
        
        assetCache.set(assetType, true)
      } catch (error) {
        console.warn(`Failed to load essential asset ${assetType}:`, error)
      }
    }
  }

  /**
   * Optimize rendering settings for low-end devices
   */
  optimizeForLowEnd() {
    if (!this.scene || !this.engine) return
    
    console.log('BabylonGameEngine: Applying low-end optimizations...')
    
    // Reduce hardware scaling
    this.engine.setHardwareScalingLevel(2) // Render at half resolution
    
    // Disable expensive features
    this.scene.fogEnabled = false
    this.scene.shadowsEnabled = false
    this.scene.particlesEnabled = false
    this.scene.spritesEnabled = false
    this.scene.skeletonsEnabled = false
    
    // Reduce texture quality
    this.scene.textures.forEach(texture => {
      if (texture.getSize) {
        const size = texture.getSize()
        if (size.width > 512) {
          texture.updateSamplingMode(BABYLON.Texture.NEAREST_SAMPLINGMODE)
        }
      }
    })
    
    // Optimize materials
    this.scene.materials.forEach(material => {
      if (material.freeze) {
        material.freeze()
      }
    })
    
    console.log('BabylonGameEngine: Low-end optimizations applied')
  }

  /**
   * Memory-aware asset loading
   */
  async loadAssetMemoryAware(assetId, priority = 'normal') {
    // Check available memory (if supported)
    const memoryInfo = performance.memory
    if (memoryInfo) {
      const usedMemory = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize
      
      if (usedMemory > 0.8) { // If using more than 80% memory
        console.warn('BabylonGameEngine: High memory usage, cleaning up before loading new assets')
        this.unloadUnusedAssets()
        
        // If still high memory, skip non-essential assets
        if (priority === 'low') {
          console.warn('BabylonGameEngine: Skipping low priority asset due to memory constraints')
          return null
        }
      }
    }
    
    return await this.loadAsset(assetId)
  }

  /**
   * Dispose resources with proper cleanup
   */
  dispose() {
    console.log('BabylonGameEngine: Starting disposal...')
    
    this.stop()
    
    // Clear all caches
    assetCache.clear()
    modelCache.clear()
    
    // Dispose scene properly
    if (this.scene) {
      // Dispose all meshes
      this.scene.meshes.slice().forEach(mesh => mesh.dispose())
      
      // Dispose all materials
      this.scene.materials.slice().forEach(material => material.dispose())
      
      // Dispose all textures
      this.scene.textures.slice().forEach(texture => texture.dispose())
      
      // Dispose scene
      this.scene.dispose()
      this.scene = null
    }
    
    // Dispose engine
    if (this.engine) {
      this.engine.dispose()
      this.engine = null
    }
    
    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
      this.canvas = null
    }
    
    console.log('BabylonGameEngine: Disposal completed')
  }

  /**
   * Helper: Get asset by id from localStorage assets
   */
  getAssetById(assetId) {
    try {
      const assets = JSON.parse(localStorage.getItem('skyward_assets') || '[]')
      return assets.find(a => a.id === assetId)
    } catch {
      return null
    }
  }

  /**
   * Helper: Load GLB model from base64 data
   */
  async loadGLBFromBase64(base64, meshName) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh(
        '',
        '',
        base64,
        this.scene,
        (meshes) => {
          meshes.forEach(m => { m.name = meshName; m.receiveShadows = true })
          resolve(meshes)
        },
        null,
        (error) => reject(error)
      )
    })
  }

  /**
   * Universal helper: ensure an invisible physics box for any object (mesh, group, or node)
   * - If mesh: assign impostor if not present
   * - If not mesh: create box at object's world position (if available), parent all children
   * - Always logs what is being processed
   */
  ensurePhysicsBox(meshOrMeshes, position, size = {width:1, height:1, depth:1}) {
    const meshes = Array.isArray(meshOrMeshes) ? meshOrMeshes : [meshOrMeshes]
    // Log all objects passed
    meshes.forEach((m, i) => {
      if (!m) {
        console.warn(`[PhysicsBox] [${i}] is null/undefined`)
      } else if (m instanceof BABYLON.Mesh) {
        console.log(`[PhysicsBox] [${i}] Mesh:`, m.name, 'Vertices:', m.getTotalVertices())
      } else if (m instanceof BABYLON.TransformNode) {
        console.log(`[PhysicsBox] [${i}] TransformNode:`, m.name)
      } else {
        console.log(`[PhysicsBox] [${i}] Unknown type:`, m)
      }
    })
    // Find a mesh suitable for physics
    const validMesh = meshes.find(m => m && m instanceof BABYLON.Mesh && m.getTotalVertices() > 0)
    if (validMesh && this.physicsEngine) {
      // Already suitable, assign impostor if not present
      if (!validMesh.physicsImpostor) {
        try {
          validMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            validMesh,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.3, friction: 0.8 },
            this.scene
          )
          console.log(`[PhysicsBox] Assigned impostor to mesh:`, validMesh.name)
        } catch (e) {
          console.warn(`[PhysicsBox] Failed to assign impostor to mesh:`, validMesh.name, e)
        }
      }
      return validMesh
    } else {
      // Not a mesh, or no valid mesh found: create invisible physics box
      // Try to use world position of first node if available
      let boxPos = position ? position.clone() : new BABYLON.Vector3(0,0,0)
      const firstNode = meshes.find(m => m && typeof m.getAbsolutePosition === 'function')
      if (firstNode) {
        try {
          const absPos = firstNode.getAbsolutePosition()
          if (absPos && absPos.x !== undefined) {
            boxPos = absPos.clone()
            console.log(`[PhysicsBox] Using absolute position of node for box:`, boxPos)
          }
        } catch (e) {
          console.warn(`[PhysicsBox] Could not get absolute position of node:`, e)
        }
      }
      const box = BABYLON.MeshBuilder.CreateBox('univ_physbox_' + Math.random().toString(36).substr(2,6), size, this.scene)
      box.position = boxPos
      box.isVisible = false
      if (this.physicsEngine && box && box instanceof BABYLON.Mesh) {
        try {
          box.physicsImpostor = new BABYLON.PhysicsImpostor(
            box,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.3, friction: 0.8 },
            this.scene
          )
          console.log(`[PhysicsBox] Assigned impostor to box at:`, box.position)
        } catch (e) {
          console.warn(`[PhysicsBox] Failed to assign impostor to box:`, e)
        }
      }
      // Parent all visible meshes/nodes to the box
      meshes.forEach(m => {
        if (m) {
          if (typeof m.setParent === 'function') {
            m.setParent(box)
            if (m.position) m.position = new BABYLON.Vector3(0, 0, 0)
            m.isVisible = true
            console.log(`[PhysicsBox] Parented node/mesh to box:`, m.name)
          } else if ('parent' in m) {
            m.parent = box
            if (m.position) m.position = new BABYLON.Vector3(0, 0, 0)
            m.isVisible = true
            console.log(`[PhysicsBox] Parented node/mesh to box (fallback):`, m.name)
          }
        }
      })
      return box
    }
  }

  /**
   * Update the 3D world from map editor data
   */
  async updateWorldFromMap(mapData) {
    if (!this.scene || !mapData) return

    try {
      console.log('BabylonGameEngine: Updating world from map data...')
      
      // Clear existing map-generated meshes
      this.scene.meshes.forEach(mesh => {
        if (mesh.metadata?.fromMapEditor) {
          mesh.dispose()
        }
      })

      // Recreate terrain based on map data
      if (mapData.cells && Array.isArray(mapData.cells)) {
        await this.generateTerrainFromMap(mapData)
      }

      // Place assets
      if (mapData.assets) {
        for (const asset of mapData.assets) {
          await this.loadAndPlaceAsset(asset)
        }
      }

      // Create spawn areas
      if (mapData.spawnAreas) {
        for (const spawnArea of mapData.spawnAreas) {
          await this.createSpawnArea(spawnArea)
        }
      }

      console.log('BabylonGameEngine: World updated successfully')
    } catch (error) {
      console.error('BabylonGameEngine: Error updating world from map:', error)
    }
  }

  /**
   * Generate terrain from map data
   */
  async generateTerrainFromMap(mapData) {
    const { cells, size = 32 } = mapData
    const scale = 4 // Scale factor for terrain

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const cell = cells[x]?.[z]
        if (!cell) continue

        const worldX = (x - size/2) * scale
        const worldZ = (z - size/2) * scale

        // Create terrain mesh based on cell type
        let mesh
        switch (cell.type) {
          case 'grass':
            mesh = BABYLON.MeshBuilder.CreateGround(`grass_${x}_${z}`, {
              width: scale,
              height: scale
            }, this.scene)
            break
          case 'water':
            mesh = BABYLON.MeshBuilder.CreateGround(`water_${x}_${z}`, {
              width: scale,
              height: scale
            }, this.scene)
            mesh.position.y = -0.1
            break
          case 'stone':
            mesh = BABYLON.MeshBuilder.CreateBox(`stone_${x}_${z}`, {
              width: scale,
              height: 1,
              depth: scale
            }, this.scene)
            mesh.position.y = 0.5
            break
          default:
            mesh = BABYLON.MeshBuilder.CreateGround(`terrain_${x}_${z}`, {
              width: scale,
              height: scale
            }, this.scene)
        }

        if (mesh) {
          mesh.position.x = worldX
          mesh.position.z = worldZ
          mesh.metadata = { fromMapEditor: true, cellType: cell.type }
          
          // Apply basic material
          const material = new BABYLON.StandardMaterial(`mat_${cell.type}_${x}_${z}`, this.scene)
          switch (cell.type) {
            case 'grass':
              material.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2)
              break
            case 'water':
              material.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8)
              break
            case 'stone':
              material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5)
              break
            default:
              material.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2)
          }
          mesh.material = material
        }
      }
    }
  }

  /**
   * Load and place an asset in the 3D world
   */
  async loadAndPlaceAsset(asset) {
    if (!asset || !this.scene) return null

    try {
      let mesh
      
      // Create different meshes based on asset type
      switch (asset.type) {
        case 'tree':
          mesh = await this.createTreeAsset(asset)
          break
        case 'rock':
          mesh = await this.createRockAsset(asset)
          break
        case 'structure':
          mesh = await this.createStructureAsset(asset)
          break
        default:
          // Default box for unknown assets
          mesh = BABYLON.MeshBuilder.CreateBox(asset.id || 'asset', {
            width: 1,
            height: 1,
            depth: 1
          }, this.scene)
      }

      if (mesh && asset.position) {
        mesh.position = new BABYLON.Vector3(
          asset.position.x || 0,
          asset.position.y || 0,
          asset.position.z || 0
        )
        
        if (asset.rotation) {
          mesh.rotation = new BABYLON.Vector3(
            asset.rotation.x || 0,
            asset.rotation.y || 0,
            asset.rotation.z || 0
          )
        }
        
        if (asset.scale) {
          mesh.scaling = new BABYLON.Vector3(
            asset.scale.x || 1,
            asset.scale.y || 1,
            asset.scale.z || 1
          )
        }

        mesh.metadata = { fromMapEditor: true, assetData: asset }
      }

      return mesh
    } catch (error) {
      console.error('BabylonGameEngine: Error loading asset:', error)
      return null
    }
  }

  /**
   * Create spawn area in the 3D world
   */
  async createSpawnArea(spawnAreaData) {
    if (!spawnAreaData || !this.scene) return null

    try {
      // Create visual representation of spawn area
      let areaMesh
      
      switch (spawnAreaData.shape) {
        case 'circle':
          areaMesh = BABYLON.MeshBuilder.CreateGround(`spawn_area_${spawnAreaData.id}`, {
            width: spawnAreaData.radius * 2,
            height: spawnAreaData.radius * 2
          }, this.scene)
          break
        case 'rectangle':
          areaMesh = BABYLON.MeshBuilder.CreateGround(`spawn_area_${spawnAreaData.id}`, {
            width: spawnAreaData.width || 10,
            height: spawnAreaData.height || 10
          }, this.scene)
          break
        default:
          areaMesh = BABYLON.MeshBuilder.CreateGround(`spawn_area_${spawnAreaData.id}`, {
            width: 10,
            height: 10
          }, this.scene)
      }

      if (areaMesh && spawnAreaData.position) {
        areaMesh.position = new BABYLON.Vector3(
          spawnAreaData.position.x || 0,
          0.1, // Slightly above ground
          spawnAreaData.position.z || 0
        )

        // Make it semi-transparent
        const material = new BABYLON.StandardMaterial(`spawn_area_mat_${spawnAreaData.id}`, this.scene)
        material.diffuseColor = new BABYLON.Color3(1, 1, 0) // Yellow
        material.alpha = 0.3
        areaMesh.material = material
        areaMesh.metadata = { fromMapEditor: true, spawnAreaData: spawnAreaData }
      }

      return areaMesh
    } catch (error) {
      console.error('BabylonGameEngine: Error creating spawn area:', error)
      return null
    }
  }

  /**
   * Helper method to create tree assets
   */
  async createTreeAsset(asset) {
    const treeMesh = BABYLON.MeshBuilder.CreateCylinder(`tree_${asset.id}`, {
      height: 3,
      diameter: 0.5
    }, this.scene)
    
    const material = new BABYLON.StandardMaterial(`tree_mat_${asset.id}`, this.scene)
    material.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1)
    treeMesh.material = material
    
    return treeMesh
  }

  /**
   * Helper method to create rock assets
   */
  async createRockAsset(asset) {
    const rockMesh = BABYLON.MeshBuilder.CreateSphere(`rock_${asset.id}`, {
      diameter: 1.5,
      segments: 8
    }, this.scene)
    
    const material = new BABYLON.StandardMaterial(`rock_mat_${asset.id}`, this.scene)
    material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5)
    rockMesh.material = material
    
    return rockMesh
  }

  /**
   * Helper method to create structure assets
   */
  async createStructureAsset(asset) {
    const structureMesh = BABYLON.MeshBuilder.CreateBox(`structure_${asset.id}`, {
      width: 2,
      height: 3,
      depth: 2
    }, this.scene)
    
    const material = new BABYLON.StandardMaterial(`structure_mat_${asset.id}`, this.scene)
    material.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2)
    structureMesh.material = material
    
    return structureMesh
  }
}

export default BabylonGameEngine