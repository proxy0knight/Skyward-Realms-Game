import * as BABYLON from '@babylonjs/core'
import * as CANNON from 'cannon'
import '@babylonjs/loaders/glTF'

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
    
    // Performance
    this.currentFPS = 0
    this.isRunning = false
    
    // Input
    this.inputMap = {}
    
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
      
      // Enable physics with Cannon.js
      await this.setupPhysics()
      
      // Setup camera
      this.setupCamera()
      
      // Setup lighting
      this.setupLighting()
      
      // Setup input
      this.setupInput()
      
      // Create world
      await this.createWorld()
      
      // Setup rendering optimizations
      this.setupOptimizations()
      
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
   * Setup physics engine with Cannon.js
   */
  async setupPhysics() {
    console.log('BabylonGameEngine: Setting up physics...')
    
    // Enable physics
    this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin())
    this.physicsEngine = this.scene.getPhysicsEngine()
    
    console.log('✅ Physics engine enabled with gravity')
  }

  /**
   * Setup camera with advanced controls
   */
  setupCamera() {
    console.log('BabylonGameEngine: Setting up camera...')
    
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
    this.camera.attachControls(this.canvas, true)
    
    // Camera constraints
    this.camera.lowerBetaLimit = 0.1
    this.camera.upperBetaLimit = Math.PI / 2
    this.camera.lowerRadiusLimit = 3
    this.camera.upperRadiusLimit = 50
    
    // Smooth controls
    this.camera.inertia = 0.5
    this.camera.angularSensibilityX = 1000
    this.camera.angularSensibilityY = 1000
    
    console.log('✅ Camera setup complete')
  }

  /**
   * Setup advanced lighting with PBR
   */
  setupLighting() {
    console.log('BabylonGameEngine: Setting up lighting...')
    
    // Create environment
    const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData('/textures/environment.env', this.scene)
    this.scene.environmentTexture = envTexture
    this.scene.createDefaultSkybox(envTexture, true, 1000)
    
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
    
    console.log('✅ Input system ready')
  }

  /**
   * Create the game world
   */
  async createWorld() {
    console.log('BabylonGameEngine: Creating game world...')
    
    // Create terrain
    await this.createTerrain()
    
    // Create water
    await this.createWater()
    
    // Create vegetation
    await this.createVegetation()
    
    // Create player
    await this.createPlayer()
    
    console.log('✅ Game world created successfully!')
  }

  /**
   * Create advanced terrain system
   */
  async createTerrain() {
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
    
    // Create terrain mesh
    const terrain = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
      'terrain',
      '/textures/heightmap.png',
      {
        width: 400,
        height: 400,
        subdivisions: 200,
        minHeight: 0,
        maxHeight: 20,
        onReady: (groundMesh) => {
          // Create PBR material
          const terrainMaterial = new BABYLON.PBRMaterial('terrainMaterial', this.scene)
          terrainMaterial.baseTexture = new BABYLON.Texture('/textures/grass_diffuse.jpg', this.scene)
          terrainMaterial.normalTexture = new BABYLON.Texture('/textures/grass_normal.jpg', this.scene)
          terrainMaterial.metallicTexture = new BABYLON.Texture('/textures/grass_metallic.jpg', this.scene)
          terrainMaterial.baseTexture.uOffset = 0
          terrainMaterial.baseTexture.vOffset = 0
          terrainMaterial.baseTexture.uScale = 20
          terrainMaterial.baseTexture.vScale = 20
          terrainMaterial.roughness = 0.8
          terrainMaterial.metallic = 0.1
          
          groundMesh.material = terrainMaterial
          groundMesh.receiveShadows = true
          
          // Add physics
          groundMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            groundMesh,
            BABYLON.PhysicsImpostor.HeightmapImpostor,
            { mass: 0, restitution: 0.3, friction: 0.8 },
            this.scene
          )
          
          console.log('✅ Terrain created with PBR materials and physics')
        }
      },
      this.scene
    )
    
    // Fallback simple terrain if heightmap fails
    if (!terrain) {
      const simpleTerrain = BABYLON.MeshBuilder.CreateGround('simpleTerrain', {
        width: 400,
        height: 400,
        subdivisions: 100
      }, this.scene)
      
      const terrainMaterial = new BABYLON.StandardMaterial('terrainMaterial', this.scene)
      terrainMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2)
      simpleTerrain.material = terrainMaterial
      simpleTerrain.receiveShadows = true
      
      simpleTerrain.physicsImpostor = new BABYLON.PhysicsImpostor(
        simpleTerrain,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.3, friction: 0.8 },
        this.scene
      )
    }
  }

  /**
   * Create advanced water system
   */
  async createWater() {
    console.log('BabylonGameEngine: Creating water system...')
    
    // Create water mesh
    const waterMesh = BABYLON.MeshBuilder.CreateGround('water', {
      width: 50,
      height: 50,
      subdivisions: 32
    }, this.scene)
    
    // Advanced water material
    const waterMaterial = new BABYLON.WaterMaterial('waterMaterial', this.scene)
    waterMaterial.bumpTexture = new BABYLON.Texture('/textures/normalMap.jpg', this.scene)
    waterMaterial.windForce = -5
    waterMaterial.waveHeight = 0.3
    waterMaterial.windDirection = new BABYLON.Vector2(1, 1)
    waterMaterial.waterColor = new BABYLON.Color3(0, 0.3, 0.6)
    waterMaterial.colorBlendFactor = 0.3
    waterMaterial.bumpHeight = 0.1
    waterMaterial.waveLength = 0.1
    
    // Add reflections
    waterMaterial.addToRenderList(this.scene.meshes[0]) // Terrain
    
    waterMaterial.reflectionTexture.renderList.push(this.scene.meshes[0])
    
    waterMesh.material = waterMaterial
    waterMesh.position.y = 2
    
    // Water physics (trigger zone)
    waterMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      waterMesh,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0, friction: 0 },
      this.scene
    )
    
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
      
      // Add physics
      treeInstance.physicsImpostor = new BABYLON.PhysicsImpostor(
        treeInstance,
        BABYLON.PhysicsImpostor.CylinderImpostor,
        { mass: 0, restitution: 0.1, friction: 0.9 },
        this.scene
      )
      
      treePositions.push(treeInstance)
    }
    
    // Hide original
    treeMesh.setEnabled(false)
    
    console.log(`✅ Created ${treePositions.length} instanced trees with physics`)
  }

  /**
   * Create player with physics
   */
  async createPlayer() {
    console.log('BabylonGameEngine: Creating player...')
    
    // Create player mesh
    const playerMesh = BABYLON.MeshBuilder.CreateCapsule('player', {
      radius: 0.5,
      height: 2
    }, this.scene)
    
    // Player material
    const playerMaterial = new BABYLON.PBRMaterial('playerMaterial', this.scene)
    playerMaterial.baseColor = new BABYLON.Color3(0.2, 0.5, 1)
    playerMaterial.metallic = 0.1
    playerMaterial.roughness = 0.6
    playerMesh.material = playerMaterial
    
    // Position player
    playerMesh.position = new BABYLON.Vector3(0, 5, 0)
    
    // Add physics
    playerMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      playerMesh,
      BABYLON.PhysicsImpostor.CapsuleImpostor,
      { mass: 1, restitution: 0.1, friction: 0.8 },
      this.scene
    )
    
    // Enable shadows
    this.shadowGenerator.addShadowCaster(playerMesh)
    
    // Set as player
    this.player = playerMesh
    
    // Update camera target
    this.camera.setTarget(this.player.position)
    
    console.log('✅ Player created with physics')
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
    if (!this.player) return
    
    switch (event.code) {
      case 'Space':
        // Jump
        this.player.physicsImpostor.setLinearVelocity(
          this.player.physicsImpostor.getLinearVelocity().add(new BABYLON.Vector3(0, 8, 0))
        )
        break
    }
  }

  /**
   * Update player movement
   */
  updateMovement() {
    if (!this.player) return
    
    const moveSpeed = 5
    const moveVector = new BABYLON.Vector3()
    
    // Get camera direction
    const cameraDirection = this.camera.getTarget().subtract(this.camera.position).normalize()
    const cameraRight = BABYLON.Vector3.Cross(cameraDirection, BABYLON.Vector3.Up()).normalize()
    
    // Calculate movement
    if (this.inputMap['KeyW']) {
      moveVector.addInPlace(cameraDirection.scale(moveSpeed))
    }
    if (this.inputMap['KeyS']) {
      moveVector.addInPlace(cameraDirection.scale(-moveSpeed))
    }
    if (this.inputMap['KeyA']) {
      moveVector.addInPlace(cameraRight.scale(-moveSpeed))
    }
    if (this.inputMap['KeyD']) {
      moveVector.addInPlace(cameraRight.scale(moveSpeed))
    }
    
    // Apply movement
    if (moveVector.length() > 0) {
      this.player.physicsImpostor.setLinearVelocity(
        new BABYLON.Vector3(moveVector.x, this.player.physicsImpostor.getLinearVelocity().y, moveVector.z)
      )
    }
    
    // Update camera target
    this.camera.setTarget(this.player.position)
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
}

export default BabylonGameEngine