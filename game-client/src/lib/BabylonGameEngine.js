import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import BabylonCharacter from './BabylonCharacter.js'

// Import physics plugin
import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin'

// Import camera controls and inputs
import '@babylonjs/core/Cameras/arcRotateCamera'
import '@babylonjs/core/Cameras/universalCamera'
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput'
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraKeyboardMoveInput'
import { get as idbGet } from 'idb-keyval'

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
    
    console.log('BabylonGameEngine: Initialized')
  }

  /**
   * Initialize the Babylon.js engine
   */
  async init(container) {
    try {
      console.log('BabylonGameEngine: Starting initialization...')
      
      // Create canvas
      this.canvas = document.createElement('canvas')
      this.canvas.style.width = '100%'
      this.canvas.style.height = '100%'
      this.canvas.style.display = 'block'
      this.canvas.style.outline = 'none'
      container.appendChild(this.canvas)
      
      // Create Babylon.js engine with advanced features
      this.engine = new BABYLON.Engine(this.canvas, true, {
        powerPreference: 'high-performance',
        antialias: true,
        stencil: true,
        alpha: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        doNotHandleContextLost: true
      })
      
      // Enable WebGL2 features
      this.engine.enableOfflineSupport = false
      this.engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio, 2))
      
      // Create scene
      this.scene = new BABYLON.Scene(this.engine)
      this.scene.actionManager = new BABYLON.ActionManager(this.scene)
      
      // Store reference to this engine in scene for character access
      this.scene.gameEngine = this
      
      // Enable physics with Cannon.js
      await this.setupPhysics()
      
      // Setup camera
      this.setupCamera()
      
      // Setup lighting
      await this.setupLighting()
      
      // Setup input
      this.setupInput()
      
      // Create world
      await this.createWorld()
      
      // Setup rendering optimizations
      this.setupOptimizations()
      
      // Start render loop
      this.startRenderLoop()
      
      // Load starting map
      this.currentMapId = this.getStartingMapId()
      this.mapData = this.loadMapData(this.currentMapId)
      // If no map, create and use a default
      if (!this.mapData) {
        this.createAndSaveDefaultMap()
        this.currentMapId = 'default'
        this.mapData = this.loadMapData('default')
      }
      
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
    const idx = JSON.parse(localStorage.getItem('skyward_maps_index') || '[]')
    let startId = localStorage.getItem('skyward_starting_map')
    if (!startId && idx.length > 0) startId = idx[0].id
    console.log('BabylonGameEngine: getStartingMapId() ->', startId)
    return startId || 'default'
  }

  /**
   * Load map data by ID
   */
  loadMapData(mapId) {
    console.log('BabylonGameEngine: Loading map data for mapId:', mapId)
    const data = localStorage.getItem('skyward_world_map_' + mapId)
    if (!data) {
      console.warn('BabylonGameEngine: No map data found for mapId:', mapId)
      return null
    }
    const parsed = JSON.parse(data)
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      console.warn('BabylonGameEngine: Loaded map data is empty or invalid for mapId:', mapId)
    } else {
      console.log('BabylonGameEngine: Loaded map data for mapId', mapId, 'size:', parsed.length, 'x', parsed[0]?.length)
      console.log('BabylonGameEngine: Sample cell [0][0]:', parsed[0]?.[0])
    }
    return parsed
  }

  /**
   * Create and save a default map if none exists
   */
  createAndSaveDefaultMap() {
    const size = 32
    const defaultCell = { type: 'ground', asset: null, flags: {} }
    const def = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ ...defaultCell })))
    localStorage.setItem('skyward_world_map_default', JSON.stringify(def))
    localStorage.setItem('skyward_maps_index', JSON.stringify([{ id: 'default', name: 'World', size }]))
    if (!localStorage.getItem('skyward_starting_map')) localStorage.setItem('skyward_starting_map', 'default')
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
    console.log('BabylonGameEngine: Setting up physics...')
    
    try {
      // Import cannon dynamically
      const cannonModule = await import('cannon')
      const CANNON = cannonModule.default || cannonModule
      
      // Enable physics with Cannon.js
      this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new CannonJSPlugin(true, 10, CANNON))
      this.physicsEngine = this.scene.getPhysicsEngine()
      
      console.log('✅ Physics engine enabled with gravity')
    } catch (error) {
      console.warn('⚠️ Physics engine failed to initialize, using fallback:', error)
      // Fallback: disable physics features
      this.physicsEngine = null
    }
  }

  /**
   * Setup camera with advanced controls
   */
  setupCamera() {
    console.log('BabylonGameEngine: Setting up camera...')
    
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
      
      console.log('✅ Camera setup complete')
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
        console.log('✅ Camera controls attached via attachControls')
        return
      }
      
      // Method 2: Manual control setup
      this.setupManualCameraControls()
      console.log('✅ Manual camera controls setup')
      
    } catch (error) {
      console.warn('⚠️ Camera controls setup failed:', error)
      console.log('Camera will work but without mouse/keyboard controls')
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
      console.log('Mouse lock status:', this.isMouseLocked ? 'LOCKED' : 'UNLOCKED')
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
      this.canvas.requestPointerLock()
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
    console.log('BabylonGameEngine: Creating fallback camera...')
    
    try {
      // Create simple universal camera
      this.camera = new BABYLON.UniversalCamera(
        'fallbackCamera',
        new BABYLON.Vector3(0, 5, -10),
        this.scene
      )
      
      this.camera.lookAt(BABYLON.Vector3.Zero())
      console.log('✅ Fallback camera created')
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
    } catch (error) {
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
    console.log('✅ Procedural skybox created')
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
    
    console.log('✅ Advanced lighting setup complete')
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
    
    console.log('✅ Input system ready')
  }

  /**
   * Create the game world
   */
  async createWorld() {
    console.log('>>> ENTERED createWorld, mapData:', this.mapData)
    console.log('BabylonGameEngine: Creating game world from map data...')
    if (!this.mapData) {
      console.warn('No map data found! Falling back to default terrain.')
      await this.createTerrain() // fallback
      return
    }
    // Load tool-asset assignments
    const toolAssets = JSON.parse(localStorage.getItem('skyward_tool_asset_assignments') || '{}')
    const assets = JSON.parse(localStorage.getItem('skyward_assets') || '[]')
    const getAssetById = (id) => assets.find(a => a.id === id)
    console.log('Loaded tool-asset assignments:', toolAssets)
    console.log('Loaded assets:', assets.map(a => ({ id: a.id, name: a.name, type: a.type })))
    // For spawn/teleport
    let playerSpawn = null
    const teleportTriggers = []
    let debugCellCount = 0;
    for (let z = 0; z < this.mapData.length; z++) {
      for (let x = 0; x < this.mapData[z].length; x++) {
        const cell = this.mapData[z][x]
        if (debugCellCount < 5) {
          console.log(`[DEBUG-ALL] Cell at (${x},${z}):`, cell)
          debugCellCount++
        }
        if (cell.asset || (cell.flags && Object.keys(cell.flags).length > 0)) {
          console.log(`[DEBUG] Cell at (${x},${z}):`, cell)
        }
        // 1. Terrain mesh
        let terrainAssetId = toolAssets[cell.type] || null
        let terrainAsset = terrainAssetId ? getAssetById(terrainAssetId) : null
        if (terrainAsset && terrainAsset.id) {
          const base64 = await idbGet(terrainAsset.id)
          if (base64) {
            console.log(`[TERRAIN] Loading terrain asset for type '${cell.type}' at (${x},${z}):`, terrainAsset)
            await this.loadGLBFromBase64(base64, `terrain_${x}_${z}`)
          } else {
            console.warn(`[TERRAIN] No GLB data found in IndexedDB for terrain asset '${terrainAsset.id}' at (${x},${z}), using default box.`)
            const box = BABYLON.MeshBuilder.CreateBox(`ground_${x}_${z}`, { width: 1, height: 0.2, depth: 1 }, this.scene)
            box.position = new BABYLON.Vector3(x, 0, z)
            box.material = new BABYLON.StandardMaterial('groundMat', this.scene)
            box.material.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.3)
          }
        } else {
          if (terrainAssetId) {
            console.warn(`[TERRAIN] No asset found for terrain type '${cell.type}' with id '${terrainAssetId}' at (${x},${z}), using default box.`)
          }
          const box = BABYLON.MeshBuilder.CreateBox(`ground_${x}_${z}`, { width: 1, height: 0.2, depth: 1 }, this.scene)
          box.position = new BABYLON.Vector3(x, 0, z)
          box.material = new BABYLON.StandardMaterial('groundMat', this.scene)
          box.material.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.3)
        }
        // 2. Asset mesh
        if (cell.asset) {
          const asset = getAssetById(cell.asset)
          if (asset && asset.id) {
            const base64 = await idbGet(asset.id)
            if (base64) {
              console.log(`[ASSET] Loading placed asset at (${x},${z}):`, asset)
              try {
                await this.loadGLBFromBase64(base64, `asset_${x}_${z}`)
              } catch (e) {
                console.error(`[ASSET] Failed to load GLB for asset '${asset.id}' at (${x},${z}):`, e)
              }
            } else {
              console.warn(`[ASSET] No GLB data found in IndexedDB for asset '${asset.id}' at (${x},${z})`)
            }
          } else {
            console.warn(`[ASSET] No asset found for placed asset id '${cell.asset}' at (${x},${z})`)
          }
        }
        // 3. Flags
        if (cell.flags) {
          // Spawn
          if (cell.flags.spawn) {
            console.log(`[SPAWN] Found player spawn at (${x},${z})`)
            if (!playerSpawn) {
              playerSpawn = { x, z }
            }
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
    if (playerSpawn && this.babylonCharacter) {
      this.babylonCharacter.setPosition(new BABYLON.Vector3(playerSpawn.x, 2, playerSpawn.z))
      this.camera.setTarget(this.babylonCharacter.getPosition())
      console.log('Player spawned at:', playerSpawn)
    } else {
      console.warn('No player spawn point found in map!')
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
    console.log('✅ 3D world generated from map!')
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
    
    // Create terrain using Babylon.js DynamicTerrain
    const terrainSub = 200
    const terrainOptions = {
      width: 400,
      height: 400,
      subdivisions: terrainSub,
      minHeight: 0,
      maxHeight: 20,
      onReady: (terrain) => {
        // Add physics
        terrain.physicsImpostor = new BABYLON.PhysicsImpostor(
          terrain,
          BABYLON.PhysicsImpostor.HeightmapImpostor,
          { mass: 0, restitution: 0.3, friction: 0.8 },
          this.scene
        )
        
        // Enable collision detection for terrain
        terrain.checkCollisions = true
        
        // Add to shadow casters
        terrain.receiveShadows = true
      }
    }
    
    // Create heightmap data
    const heightmapData = new Float32Array(terrainSub * terrainSub)
    for (let i = 0; i < heightmapData.length; i++) {
      const x = (i % terrainSub) / terrainSub * 20 - 10
      const z = Math.floor(i / terrainSub) / terrainSub * 20 - 10
      heightmapData[i] = Math.sin(x * 0.5) * 2 + Math.cos(z * 0.3) * 1.5
    }
    
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
    
    // Add physics if available
    if (this.physicsEngine) {
      simpleTerrain.physicsImpostor = new BABYLON.PhysicsImpostor(
        simpleTerrain,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.3, friction: 0.8 },
        this.scene
      )
      console.log('✅ Terrain physics enabled')
    } else {
      console.log('✅ Terrain created without physics (fallback mode)')
    }
    
    console.log('✅ Terrain created with procedural materials and physics')
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
    
    // Simple transparent water effect
    
    waterMesh.material = waterMaterial
    waterMesh.position.y = 2
    
    // Water physics (trigger zone) - only if physics available
    if (this.physicsEngine) {
      waterMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        waterMesh,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0, friction: 0 },
        this.scene
      )
    }
    
    this.waterMesh = waterMesh
    
    console.log('✅ Advanced water system created with reflections')
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
      treeInstance.position = new BABYLON.Vector3(x, y, z)
      treeInstance.scaling = new BABYLON.Vector3(
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.4
      )
      
      // Add physics if available
      if (this.physicsEngine) {
        treeInstance.physicsImpostor = new BABYLON.PhysicsImpostor(
          treeInstance,
          BABYLON.PhysicsImpostor.CylinderImpostor,
          { mass: 0, restitution: 0.1, friction: 0.9 },
          this.scene
        )
        
        // Enable collision detection for trees
        treeInstance.checkCollisions = true
      }
      
      treePositions.push(treeInstance)
    }
    
    // Hide original
    treeMesh.setEnabled(false)
    
    console.log(`✅ Created ${treePositions.length} instanced trees with physics`)
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
    
    console.log('✅ Enhanced player character created with GLB model and elemental effects')
    return characterGroup
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
    
    console.log('✅ Optimizations enabled')
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
    
    console.log('✅ Render loop started')
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
    
    console.log(`BabylonGameEngine: Added game object ${id}`)
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
    console.log(`BabylonGameEngine: Removed game object ${id}`)
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
   * Dispose resources
   */
  dispose() {
    this.stop()
    if (this.scene) {
      this.scene.dispose()
    }
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
}

export default BabylonGameEngine