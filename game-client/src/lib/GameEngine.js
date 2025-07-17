import * as THREE from 'three'

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
  }

  // Initialize the game engine
  init(container) {
    this.setupScene()
    this.setupCamera()
    this.setupRenderer(container)
    this.setupLighting()
    this.setupPhysics()
    this.setupEventListeners()
    
    console.log('Game Engine initialized')
    return true
  }

  // Setup 3D scene
  setupScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a2e)
    this.scene.fog = new THREE.Fog(0x1a1a2e, 50, 200)
  }

  // Setup camera
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 5, 10)
  }

  // Setup renderer
  setupRenderer(container) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    
    if (container) {
      container.appendChild(this.renderer.domElement)
    }
  }

  // Setup lighting system
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    
    this.scene.add(directionalLight)
    this.gameObjects.set('sunLight', directionalLight)
  }

  // Setup basic physics
  setupPhysics() {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200)
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2d5a27,
      transparent: true,
      opacity: 0.8
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.userData = { type: 'ground', solid: true }
    
    this.scene.add(ground)
    this.gameObjects.set('ground', ground)
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
    
    // Mouse controls
    window.addEventListener('mousedown', (event) => {
      this.emit('mousedown', event)
    })
    
    window.addEventListener('mouseup', (event) => {
      this.emit('mouseup', event)
    })
    
    window.addEventListener('mousemove', (event) => {
      this.emit('mousemove', event)
    })
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
    const playerGeometry = new THREE.BoxGeometry(1, 2, 1)
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

    const playerMaterial = new THREE.MeshLambertMaterial({ color: playerColor })
    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial)
    playerMesh.position.set(0, 1, 0)
    playerMesh.castShadow = true
    playerMesh.userData = { 
      type: 'player',
      health: playerData.health || 100,
      maxHealth: playerData.maxHealth || 100,
      mana: playerData.mana || 100,
      maxMana: playerData.maxMana || 100,
      element: playerData.element,
      velocity: new THREE.Vector3(0, 0, 0),
      isGrounded: false,
      speed: 5
    }
    
    this.scene.add(playerMesh)
    this.player = playerMesh
    this.gameObjects.set('player', playerMesh)
    
    return playerMesh
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
    
    this.deltaTime = this.clock.getDelta()
    this.gameState.gameTime += this.deltaTime
    
    // Update day/night cycle
    this.updateDayNightCycle()
    
    // Update player
    if (this.player) {
      this.updatePlayer()
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
    // Complete cycle every 10 minutes (600 seconds)
    const cycleSpeed = 1 / 600
    this.gameState.dayNightCycle = (this.gameState.dayNightCycle + cycleSpeed * this.deltaTime) % 1
    
    // Update lighting based on time of day
    const sunLight = this.gameObjects.get('sunLight')
    if (sunLight) {
      const intensity = Math.max(0.2, Math.sin(this.gameState.dayNightCycle * Math.PI * 2) * 0.8 + 0.4)
      sunLight.intensity = intensity
      
      // Change color based on time
      if (this.gameState.dayNightCycle < 0.25 || this.gameState.dayNightCycle > 0.75) {
        // Night - blue tint
        sunLight.color.setHex(0x4444ff)
      } else if (this.gameState.dayNightCycle < 0.3 || this.gameState.dayNightCycle > 0.7) {
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
    
    // Apply movement
    velocity.x = moveX * userData.speed
    velocity.z = moveZ * userData.speed
    
    // Apply gravity
    if (!userData.isGrounded) {
      velocity.y += this.physics.gravity * this.deltaTime
    }
    
    // Update position
    position.x += velocity.x * this.deltaTime
    position.y += velocity.y * this.deltaTime
    position.z += velocity.z * this.deltaTime
    
    // Ground collision
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
    
    // Update camera to follow player
    if (this.camera) {
      const cameraOffset = new THREE.Vector3(0, 5, 10)
      const desiredPosition = position.clone().add(cameraOffset)
      this.camera.position.lerp(desiredPosition, 2 * this.deltaTime)
      this.camera.lookAt(position)
    }
  }

  // Render the scene
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  // Main game loop
  gameLoop() {
    if (!this.isRunning) return
    
    this.update()
    this.render()
    
    requestAnimationFrame(() => this.gameLoop())
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

