import * as THREE from 'three'
import { Character3D } from './Character3D.js'
import { Model3D } from './Model3D.js'

export class GameEngine {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.player = null
    this.gameObjects = new Map()
    this.isRunning = false
    this.clock = new THREE.Clock()
    this.deltaTime = 0
    this.lastFrameTime = 0
    this.frameCount = 0
    this.lastFPSUpdate = 0
    this.currentFPS = 0
    
    // Game state
    this.gameState = {
      isPaused: false,
      gameTime: 0,
      dayNightCycle: 0, // 0-1 (0 = midnight, 0.5 = noon)
      weather: 'clear', // clear, rain, storm, snow
      pvpEnabled: true,
      xpMultiplier: 1.0
    }
    
    // Physics settings
    this.physics = {
      gravity: -9.81,
      groundLevel: 0,
      collisionDetection: true
    }
    
    // Event system
    this.eventListeners = new Map()
    
    // 3D Systems
    this.character3D = null
    this.model3D = null
  }

  // Initialize the game engine
  init(container) {
    console.log('GameEngine: Starting initialization...')
    
    // Setup renderer first (needed for camera aspect ratio)
    if (!this.setupRenderer(container)) {
      console.error('GameEngine: Failed to setup renderer')
      return false
    }
    
    // Setup camera with correct aspect ratio
    if (!this.setupCamera()) {
      console.error('GameEngine: Failed to setup camera')
      return false
    }
    
    // Setup scene
    if (!this.setupScene()) {
      console.error('GameEngine: Failed to setup scene')
      return false
    }
    
    // Setup lighting
    if (!this.setupLighting()) {
      console.error('GameEngine: Failed to setup lighting')
      return false
    }
    
    // Setup physics
    if (!this.setupPhysics()) {
      console.error('GameEngine: Failed to setup physics')
      return false
    }
    
    // Initialize 3D systems
    this.character3D = new Character3D(this)
    this.model3D = new Model3D(this)
    
    // Setup event listeners
    this.setupEventListeners()
    
    console.log('GameEngine: Initialization complete')
    return true
  }

  // Setup 3D scene
  setupScene() {
    try {
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x87CEEB) // Sky blue background
      this.scene.fog = new THREE.Fog(0x87CEEB, 100, 300) // Lighter fog
      
      // Add a test cube to verify rendering
      const testCubeGeometry = new THREE.BoxGeometry(2, 2, 2)
      const testCubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
      const testCube = new THREE.Mesh(testCubeGeometry, testCubeMaterial)
      testCube.position.set(5, 1, 0)
      testCube.castShadow = true
      testCube.receiveShadow = true
      testCube.userData = {
        type: 'test_cube',
        update: (deltaTime) => {
          testCube.rotation.y += deltaTime * 0.5
        }
      }
      this.scene.add(testCube)
      this.gameObjects.set('test_cube', testCube)
      
      // Reduced particle count for better performance
      const particleCount = 200 // Reduced from 1000
      const particles = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200 // Reduced range
        positions[i + 1] = Math.random() * 50 // Reduced height
        positions[i + 2] = (Math.random() - 0.5) * 200 // Reduced range
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.0, // Slightly larger particles
        transparent: true,
        opacity: 0.4
      })
      
      const particleSystem = new THREE.Points(particles, particleMaterial)
      this.scene.add(particleSystem)
      this.gameObjects.set('particles', particleSystem)
      
      console.log('GameEngine: Scene setup complete with test cube')
    } catch (error) {
      console.error('Failed to setup scene:', error)
      return false
    }
    return true
  }

  // Setup camera
  setupCamera() {
    try {
      // Get container dimensions for aspect ratio
      const container = this.renderer?.domElement?.parentElement
      const width = container?.clientWidth || window.innerWidth
      const height = container?.clientHeight || window.innerHeight
      const aspect = width / height
      
      console.log('GameEngine: Camera aspect ratio:', aspect)
      
      this.camera = new THREE.PerspectiveCamera(
        75,
        aspect,
        0.1,
        1000
      )
      this.camera.position.set(0, 8, 15)
      this.camera.lookAt(0, 0, 0)
      
      // Add camera controls for better debugging
      this.camera.userData = {
        target: new THREE.Vector3(0, 0, 0),
        distance: 15,
        height: 8
      }
      
      console.log('GameEngine: Camera setup complete')
    } catch (error) {
      console.error('Failed to setup camera:', error)
      return false
    }
    return true
  }

  // Setup renderer
  setupRenderer(container) {
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      })
      
      // Get container dimensions
      const containerRect = container.getBoundingClientRect()
      const width = containerRect.width || window.innerWidth
      const height = containerRect.height || window.innerHeight
      
      console.log('GameEngine: Container dimensions:', { width, height })
      
      this.renderer.setSize(width, height)
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.outputColorSpace = THREE.SRGBColorSpace
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping
      this.renderer.toneMappingExposure = 1.5
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      
      // Performance optimizations
      this.renderer.sortObjects = false
      this.renderer.autoClear = true
      
      if (container) {
        // Clear any existing content
        container.innerHTML = ''
        container.appendChild(this.renderer.domElement)
        
        // Set canvas styles
        this.renderer.domElement.style.width = '100%'
        this.renderer.domElement.style.height = '100%'
        this.renderer.domElement.style.display = 'block'
      }
      
      console.log('GameEngine: Renderer setup complete')
    } catch (error) {
      console.error('Failed to setup renderer:', error)
      return false
    }
    return true
  }

  // Setup lighting system
  setupLighting() {
    try {
      // Ambient light - much brighter
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
      this.scene.add(ambientLight)

      // Directional light (sun) - brighter and better positioned
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
      directionalLight.position.set(50, 50, 25)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      directionalLight.shadow.camera.near = 0.5
      directionalLight.shadow.camera.far = 200
      directionalLight.shadow.camera.left = -50
      directionalLight.shadow.camera.right = 50
      directionalLight.shadow.camera.top = 50
      directionalLight.shadow.camera.bottom = -50
      directionalLight.shadow.bias = -0.0001
      
      this.scene.add(directionalLight)
      this.gameObjects.set('sunLight', directionalLight)

      // Add bright point lights for better visibility
      const pointLight1 = new THREE.PointLight(0xffffff, 1.0, 100)
      pointLight1.position.set(30, 20, 30)
      this.scene.add(pointLight1)
      this.gameObjects.set('pointLight1', pointLight1)

      const pointLight2 = new THREE.PointLight(0xffffff, 1.0, 100)
      pointLight2.position.set(-30, 20, -30)
      this.scene.add(pointLight2)
      this.gameObjects.set('pointLight2', pointLight2)
      
      // Add a bright overhead light
      const overheadLight = new THREE.PointLight(0xffffff, 0.8, 150)
      overheadLight.position.set(0, 50, 0)
      this.scene.add(overheadLight)
      this.gameObjects.set('overheadLight', overheadLight)
      
      console.log('GameEngine: Lighting setup complete - bright environment')
    } catch (error) {
      console.error('Failed to setup lighting:', error)
      return false
    }
    return true
  }

  // Setup basic physics
  setupPhysics() {
    try {
      // Create ground with better texture
      const groundGeometry = new THREE.PlaneGeometry(400, 400, 32, 32)
      const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2d5a27,
        transparent: true,
        opacity: 0.9
      })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      ground.userData = { type: 'ground', solid: true }
      
      this.scene.add(ground)
      this.gameObjects.set('ground', ground)

      // Add some decorative elements
      this.createDecorativeElements()
      
    } catch (error) {
      console.error('Failed to setup physics:', error)
      return false
    }
    return true
  }

  // Create decorative elements
  createDecorativeElements() {
    // Add some rocks - reduced count for performance
    for (let i = 0; i < 10; i++) { // Reduced from 20
      const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5) // Smaller rocks
      const rockMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x666666,
        transparent: true,
        opacity: 0.9
      })
      const rock = new THREE.Mesh(rockGeometry, rockMaterial)
      
      rock.position.set(
        (Math.random() - 0.5) * 100, // Reduced range
        0.5,
        (Math.random() - 0.5) * 100  // Reduced range
      )
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      rock.castShadow = true
      rock.receiveShadow = true
      
      this.scene.add(rock)
      this.gameObjects.set(`rock_${i}`, rock)
    }

    // Add some trees - reduced count for performance
    for (let i = 0; i < 8; i++) { // Reduced from 15
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4)
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
      
      const leavesGeometry = new THREE.SphereGeometry(2)
      const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 })
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
      leaves.position.y = 3
      
      const tree = new THREE.Group()
      tree.add(trunk)
      tree.add(leaves)
      
      tree.position.set(
        (Math.random() - 0.5) * 100, // Reduced range
        0,
        (Math.random() - 0.5) * 100  // Reduced range
      )
      tree.castShadow = true
      tree.receiveShadow = true
      
      this.scene.add(tree)
      this.gameObjects.set(`tree_${i}`, tree)
    }
    
    console.log('GameEngine: Decorative elements created - optimized for performance')
  }

  // Setup event listeners
  setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this))
    
    // Keyboard controls
    this.keys = {}
    window.addEventListener('keydown', (event) => {
      this.keys[event.code] = true
      this.emit('keydown', event)
    })
    
    window.addEventListener('keyup', (event) => {
      this.keys[event.code] = false
      this.emit('keyup', event)
    })
    
    // Mouse controls for camera
    this.mouse = {
      x: 0,
      y: 0,
      isLocked: false,
      sensitivity: 0.002
    }
    
    // Mouse movement for camera control
    window.addEventListener('mousemove', (event) => {
      if (this.mouse.isLocked) {
        // Use movementX/Y for relative movement
        this.mouse.x = event.movementX || 0
        this.mouse.y = event.movementY || 0
        
        // Only update camera if there's actual movement
        if (this.mouse.x !== 0 || this.mouse.y !== 0) {
          this.updateCameraRotation()
        }
      }
      this.emit('mousemove', event)
    })
    
    // Mouse click to lock pointer - only on canvas
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.addEventListener('mousedown', (event) => {
        // Check if clicking on UI elements
        const target = event.target
        const isUIElement = target.closest('[data-ui-element]') || 
                           target.closest('button') || 
                           target.closest('[role="button"]') ||
                           target.closest('.ui-panel') ||
                           target.closest('[class*="ui-"]')
        
        if (isUIElement) {
          // Don't lock pointer if clicking on UI
          return
        }
        
        if (event.button === 0) { // Left click
          try {
            this.lockPointer()
          } catch (error) {
            console.warn('Failed to handle mouse click for pointer lock:', error.message)
          }
        }
        this.emit('mousedown', event)
      })
    }
    
    // Escape to unlock pointer
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') {
        this.unlockPointer()
      }
    })
    
    // Pointer lock change events
    document.addEventListener('pointerlockchange', () => {
      try {
        this.mouse.isLocked = document.pointerLockElement !== null
        if (!this.mouse.isLocked) {
          this.mouse.x = 0
          this.mouse.y = 0
          
          // Don't clear orbit control state - keep current camera position
        }
      } catch (error) {
        console.warn('Error in pointer lock change handler:', error.message)
      }
    })
  }
  
  // Lock mouse pointer for camera control
  lockPointer() {
    try {
      if (this.renderer && this.renderer.domElement && document.contains(this.renderer.domElement)) {
        this.renderer.domElement.requestPointerLock()
        
        // Only initialize orbit control if it doesn't exist
        if (this.camera && this.player && !this.camera.userData.orbitControl) {
          this.camera.userData.orbitControl = {
            distance: 10,
            height: 5,
            rotationY: 0,
            rotationX: 0,
            target: new THREE.Vector3()
          }
        }
      } else {
        console.warn('Cannot lock pointer: renderer or canvas not available')
      }
    } catch (error) {
      console.warn('Failed to lock pointer:', error.message)
    }
  }
  
  // Unlock mouse pointer
  unlockPointer() {
    try {
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
      
      // Don't clear orbit control state - keep current camera position
      // Reset mouse state
      this.mouse.x = 0
      this.mouse.y = 0
    } catch (error) {
      console.warn('Failed to unlock pointer:', error.message)
    }
  }
  
  // Update camera rotation based on mouse movement
  updateCameraRotation() {
    if (!this.camera || !this.player) return
    
    // Only update if there's actual mouse movement
    if (this.mouse.x === 0 && this.mouse.y === 0) return
    
    // Initialize camera orbit system if not exists
    if (!this.camera.userData.orbitControl) {
      this.camera.userData.orbitControl = {
        distance: 10,
        height: 5,
        rotationY: 0,
        rotationX: 0,
        target: new THREE.Vector3()
      }
    }
    
    const orbit = this.camera.userData.orbitControl
    const rotationSpeed = this.mouse.sensitivity
    
    // Accumulate rotation angles (don't reset)
    orbit.rotationY += this.mouse.x * rotationSpeed  // Fixed: + for natural left/right
    orbit.rotationX -= this.mouse.y * rotationSpeed  // Keep - for natural up/down
    
    // Clamp vertical rotation to prevent looking under ground
    orbit.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/6, orbit.rotationX))  // -60° to +30°
    
    try {
      // Calculate camera position relative to player
      const offset = new THREE.Vector3(0, orbit.height, orbit.distance)
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbit.rotationY)
      offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), orbit.rotationX)
      
      // Set camera position
      this.camera.position.copy(this.player.position).add(offset)
      this.camera.lookAt(this.player.position)
    } catch (error) {
      console.warn('Error updating camera rotation:', error.message)
      // Reset to safe position if error occurs
      this.camera.position.set(0, 8, 15)
      this.camera.lookAt(0, 0, 0)
    }
    
    // Reset mouse movement for next frame
    this.mouse.x = 0
    this.mouse.y = 0
  }

  // Window resize handler
  onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
  }

  // Create player
  createPlayer(playerData) {
    try {
      // Use the new Character3D system
      if (this.character3D) {
        const playerCharacter = this.character3D.createPlayerModel(playerData)
        if (playerCharacter) {
          playerCharacter.position.set(0, 0, 0)
          this.scene.add(playerCharacter)
          this.player = playerCharacter
          this.gameObjects.set('player', playerCharacter)
          return playerCharacter
        }
      }
      
      // Fallback to old method if Character3D is not available
      const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8)
      let playerColor = 0x888888
      
      if (playerData.element) {
        switch (playerData.element.id) {
          case 'fire':
            playerColor = 0xff4500
            break
          case 'water':
            playerColor = 0x1e90ff
            break
          case 'earth':
            playerColor = 0x8b4513
            break
          case 'air':
            playerColor = 0xe6e6fa
            break
        }
      }

      const playerMaterial = new THREE.MeshLambertMaterial({ 
        color: playerColor,
        transparent: true,
        opacity: 0.9
      })
      const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial)
      playerMesh.position.set(0, 1.5, 0)
      playerMesh.castShadow = true
      playerMesh.receiveShadow = true
      playerMesh.userData = { 
        type: 'player',
        health: playerData.health || 100,
        maxHealth: playerData.maxHealth || 100,
        mana: playerData.mana || 100,
        maxMana: playerData.maxMana || 100,
        element: playerData.element,
        velocity: new THREE.Vector3(0, 0, 0),
        isGrounded: false,
        speed: 8
      }
      
      this.scene.add(playerMesh)
      this.player = playerMesh
      this.gameObjects.set('player', playerMesh)
      
      // Add player aura effect
      this.createPlayerAura(playerMesh, playerData.element)
      
      return playerMesh
    } catch (error) {
      console.error('Failed to create player:', error)
      return null
    }
  }

  // Create player aura effect
  createPlayerAura(playerMesh, element) {
    if (!element) return
    
    const auraGeometry = new THREE.SphereGeometry(1.2, 16, 16)
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: element.color || 0xffffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    })
    
    const aura = new THREE.Mesh(auraGeometry, auraMaterial)
    aura.position.copy(playerMesh.position)
    aura.userData = {
      type: 'player_aura',
      update: (deltaTime) => {
        aura.rotation.y += deltaTime * 0.5
        aura.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.1)
      }
    }
    
    this.scene.add(aura)
    this.gameObjects.set('player_aura', aura)
  }

  // Add game object
  addGameObject(id, object, userData = {}) {
    object.userData = { ...object.userData, ...userData }
    this.scene.add(object)
    this.gameObjects.set(id, object)
    return object
  }

  // Remove game object
  removeGameObject(id) {
    const object = this.gameObjects.get(id)
    if (object) {
      this.scene.remove(object)
      this.gameObjects.delete(id)
      
      // Dispose of geometry and materials
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    }
  }

  // Update game state
  update() {
    if (!this.isRunning || this.gameState.isPaused) return
    
    // Calculate FPS using a simpler method
    this.frameCount++
    const currentTime = performance.now()
    if (currentTime - this.lastFPSUpdate >= 1000) {
      this.currentFPS = this.frameCount
      this.frameCount = 0
      this.lastFPSUpdate = currentTime
    }
    
    this.gameState.gameTime += this.deltaTime
    
    // Update day/night cycle
    this.updateDayNightCycle()
    
    // Update player
    if (this.player) {
      this.updatePlayer()
    }
    
    // Update 3D systems
    if (this.character3D) {
      this.character3D.updateCharacterAnimations(this.deltaTime)
    }
    if (this.model3D) {
      this.model3D.updateModelAnimations(this.deltaTime)
    }
    
    // Update all game objects
    this.gameObjects.forEach((object, id) => {
      if (object.userData.update) {
        object.userData.update(this.deltaTime)
      }
    })
    
    // Emit update event
    this.emit('update', this.deltaTime)
  }

  // Update day/night cycle
  updateDayNightCycle() {
    // Complete cycle every 10 minutes (600 seconds) - slower for stability
    const cycleSpeed = 1 / 1200 // Slower cycle
    this.gameState.dayNightCycle = (this.gameState.dayNightCycle + cycleSpeed * this.deltaTime) % 1
    
    // Update lighting based on time of day with smoother transitions
    const sunLight = this.gameObjects.get('sunLight')
    if (sunLight) {
      // Smoother intensity calculation
      const intensity = Math.max(0.3, Math.sin(this.gameState.dayNightCycle * Math.PI * 2) * 0.6 + 0.7)
      sunLight.intensity = intensity
      
      // Smoother color transitions
      const time = this.gameState.dayNightCycle
      if (time < 0.25 || time > 0.75) {
        // Night - blue tint
        sunLight.color.setHex(0x4444ff)
      } else if (time < 0.3 || time > 0.7) {
        // Dawn/Dusk - orange tint
        sunLight.color.setHex(0xff8844)
      } else {
        // Day - white light
        sunLight.color.setHex(0xffffff)
      }
    }
  }

  // Update player
  updatePlayer() {
    if (!this.player) return
    
    const userData = this.player.userData
    const position = this.player.position
    const velocity = userData.velocity
    
    // Handle input
    let moveX = 0
    let moveZ = 0
    
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1
    
    // Normalize movement
    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
      moveX /= length
      moveZ /= length
    }
    
    // Calculate camera-relative movement direction
    let moveDirection = new THREE.Vector3(moveX, 0, moveZ)
    
    if (this.camera && this.mouse.isLocked && this.camera.userData.orbitControl) {
      // Get camera's forward direction (ignoring Y component)
      const cameraForward = new THREE.Vector3(0, 0, -1)
      cameraForward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.userData.orbitControl.rotationY)
      
      // Create rotation matrix from camera direction
      const cameraRotation = new THREE.Matrix4()
      cameraRotation.lookAt(new THREE.Vector3(), cameraForward, new THREE.Vector3(0, 1, 0))
      
      // Apply camera rotation to movement direction
      moveDirection.applyMatrix4(cameraRotation)
    }
    
    // Apply movement with fixed time step
    const moveSpeed = userData.speed || 8
    velocity.x = moveDirection.x * moveSpeed
    velocity.z = moveDirection.z * moveSpeed
    
    // Apply gravity with fixed time step
    if (!userData.isGrounded) {
      velocity.y += this.physics.gravity * this.deltaTime
    }
    
    // Update position with fixed time step
    position.x += velocity.x * this.deltaTime
    position.y += velocity.y * this.deltaTime
    position.z += velocity.z * this.deltaTime
    
    // Ground collision with stable positioning
    if (position.y <= this.physics.groundLevel + 1) {
      position.y = this.physics.groundLevel + 1
      velocity.y = 0
      userData.isGrounded = true
    } else {
      userData.isGrounded = false
    }
    
    // Jumping
    if (this.keys['Space'] && userData.isGrounded) {
      velocity.y = 8
      userData.isGrounded = false
    }
    
    // Update camera to follow player - only when needed
    if (this.camera) {
      // Initialize orbit control if needed
      if (!this.camera.userData.orbitControl) {
        this.camera.userData.orbitControl = {
          distance: 10,
          height: 5,
          rotationY: 0,
          rotationX: 0,
          target: new THREE.Vector3()
        }
      }
      
      // Check if player has moved or camera needs updating
      const playerHasMoved = velocity.x !== 0 || velocity.z !== 0 || velocity.y !== 0
      const mouseHasMoved = this.mouse.x !== 0 || this.mouse.y !== 0
      
      // Only update camera if player moved, mouse moved, or camera is not positioned correctly
      if (playerHasMoved || mouseHasMoved || !this.camera.userData.lastPlayerPosition) {
        const orbit = this.camera.userData.orbitControl
        const offset = new THREE.Vector3(0, orbit.height, orbit.distance)
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbit.rotationY)
        offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), orbit.rotationX)
        
        // Update camera position to follow player
        this.camera.position.copy(position).add(offset)
        this.camera.lookAt(position)
        
        // Store last player position for comparison
        this.camera.userData.lastPlayerPosition = position.clone()
      }
    }
    
    // Update player aura position
    const aura = this.gameObjects.get('player_aura')
    if (aura) {
      aura.position.copy(position)
    }
  }

  // Main game loop
  gameLoop() {
    if (!this.isRunning) return
    
    try {
      // Use simple delta time calculation for smooth rendering
      this.deltaTime = this.clock.getDelta()
      
      // Cap delta time to prevent large jumps
      if (this.deltaTime > 0.1) {
        this.deltaTime = 0.1
      }
      
      this.update()
      this.render()
      
      requestAnimationFrame(() => this.gameLoop())
    } catch (error) {
      console.error('Error in game loop:', error)
      this.stop()
    }
  }

  // Render the scene
  render() {
    if (this.renderer && this.scene && this.camera) {
      try {
        this.renderer.render(this.scene, this.camera)
      } catch (error) {
        console.error('Error rendering scene:', error)
      }
    }
  }

  // Start the game
  start() {
    this.isRunning = true
    this.gameLoop()
    console.log('Game started')
  }

  // Stop the game
  stop() {
    this.isRunning = false
    console.log('Game stopped')
  }

  // Pause/unpause the game
  pause() {
    this.gameState.isPaused = !this.gameState.isPaused
    console.log('Game', this.gameState.isPaused ? 'paused' : 'resumed')
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        callback(data)
      })
    }
  }

  // Cleanup
  dispose() {
    this.stop()
    
    // Dispose of all game objects
    this.gameObjects.forEach((object, id) => {
      this.removeGameObject(id)
    })
    
    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose()
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize.bind(this))
    this.eventListeners.clear()
    
    console.log('Game Engine disposed')
  }
}

export default GameEngine

