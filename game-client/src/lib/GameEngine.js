import * as THREE from 'three'

class GameEngine {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.player = null
    this.mouse = { isLocked: false }
    this.currentFPS = 0
    this.clock = new THREE.Clock()
    this.eventListeners = {}
    this.isRunning = false
    this.animationId = null
    
    // Player physics
    this.playerVelocity = new THREE.Vector3()
    this.playerOnGround = true
    this.gravity = -0.02
    this.jumpForce = 0.3
    this.moveSpeed = 0.1
    this.keysPressed = new Set()
  }

  init(container) {
    try {
      console.log('GameEngine: Initializing...')
      
      // Create scene
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x87CEEB) // Sky blue
      
      // Create camera
      this.camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      )
      this.camera.position.set(0, 5, 10)
      
      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(container.clientWidth, container.clientHeight)
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      container.appendChild(this.renderer.domElement)
      
      // Add lighting
      this.setupLighting()
      
      // Add ground
      this.createGround()
      
      // Setup camera controls
      this.setupCameraControls()
      
      // Setup mouse controls
      this.setupMouseControls()
      
      console.log('GameEngine: Initialized successfully')
      return true
    } catch (error) {
      console.error('GameEngine: Failed to initialize:', error)
      return false
    }
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)
  }

  createGround() {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x90EE90,
      side: THREE.DoubleSide
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)
    
    // Add some decorative elements
    this.addDecorativeElements()
  }

  addDecorativeElements() {
    // Add some trees
    for (let i = 0; i < 10; i++) {
      const treeGeometry = new THREE.ConeGeometry(1, 3, 8)
      const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 })
      const tree = new THREE.Mesh(treeGeometry, treeMaterial)
      tree.position.set(
        (Math.random() - 0.5) * 80,
        1.5,
        (Math.random() - 0.5) * 80
      )
      tree.castShadow = true
      this.scene.add(tree)
    }
    
    // Add some rocks
    for (let i = 0; i < 5; i++) {
      const rockGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 8, 6)
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 })
      const rock = new THREE.Mesh(rockGeometry, rockMaterial)
      rock.position.set(
        (Math.random() - 0.5) * 60,
        0.25,
        (Math.random() - 0.5) * 60
      )
      rock.castShadow = true
      this.scene.add(rock)
    }
  }

  setupCameraControls() {
    // Third-person camera controls
    this.camera.userData.orbitControl = {
      distance: 8,
      height: 3,
      rotationY: 0,
      rotationX: 0.2, // Slight downward angle
      target: new THREE.Vector3(0, 1, 0)
    }
  }

  setupMouseControls() {
    const canvas = this.renderer.domElement
    
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock()
    })
    
    document.addEventListener('pointerlockchange', () => {
      this.mouse.isLocked = document.pointerLockElement === canvas
    })
    
    document.addEventListener('mousemove', (event) => {
      if (this.mouse.isLocked) {
        const orbit = this.camera.userData.orbitControl
        orbit.rotationY -= event.movementX * 0.003
        orbit.rotationX -= event.movementY * 0.003
        // Limit vertical rotation for better gameplay
        orbit.rotationX = Math.max(-0.5, Math.min(0.8, orbit.rotationX))
      }
    })
  }

  createPlayer(playerData) {
    // Create a simple player representation
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8)
    const playerMaterial = new THREE.MeshLambertMaterial({ 
      color: this.getElementColor(playerData.element?.id || 'fire')
    })
    this.player = new THREE.Mesh(playerGeometry, playerMaterial)
    this.player.position.set(0, 1, 0)
    this.player.castShadow = true
    this.scene.add(this.player)
    
    console.log('GameEngine: Player created:', this.player)
    return this.player
  }

  getElementColor(elementId) {
    const colors = {
      fire: 0xFF4500,
      water: 0x1E90FF,
      earth: 0x8B4513,
      air: 0xE6E6FA
    }
    return colors[elementId] || 0xFF4500
  }

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data))
    }
  }

  handleKeyDown(event) {
    if (!this.player) return
    
    this.keysPressed.add(event.code)
    
    switch (event.code) {
      case 'Space':
        if (this.playerOnGround) {
          this.playerVelocity.y = this.jumpForce
          this.playerOnGround = false
        }
        break
    }
    
    // Emit keydown event
    this.emit('keydown', event)
  }

  updatePlayerPhysics() {
    if (!this.player) return
    
    // Get camera direction for relative movement
    const cameraDirection = this.getCameraDirection()
    
    // Handle continuous movement relative to camera
    const moveVector = new THREE.Vector3()
    
    if (this.keysPressed.has('KeyW')) {
      // Move forward relative to camera
      moveVector.add(cameraDirection.clone().multiplyScalar(-this.moveSpeed))
    }
    if (this.keysPressed.has('KeyS')) {
      // Move backward relative to camera
      moveVector.add(cameraDirection.clone().multiplyScalar(this.moveSpeed))
    }
    if (this.keysPressed.has('KeyA')) {
      // Move left relative to camera
      moveVector.add(cameraDirection.clone().cross(new THREE.Vector3(0, 1, 0)).multiplyScalar(-this.moveSpeed))
    }
    if (this.keysPressed.has('KeyD')) {
      // Move right relative to camera
      moveVector.add(cameraDirection.clone().cross(new THREE.Vector3(0, 1, 0)).multiplyScalar(this.moveSpeed))
    }
    
    // Apply horizontal movement
    this.playerVelocity.x = moveVector.x
    this.playerVelocity.z = moveVector.z
    
    // Make player face movement direction
    if (moveVector.length() > 0) {
      const moveDirection = moveVector.clone().normalize()
      this.player.rotation.y = Math.atan2(moveDirection.x, moveDirection.z)
    }
    
    // Apply gravity
    this.playerVelocity.y += this.gravity
    
    // Apply velocity to position
    this.player.position.add(this.playerVelocity)
    
    // Ground collision
    if (this.player.position.y <= 1) {
      this.player.position.y = 1
      this.playerVelocity.y = 0
      this.playerOnGround = true
    }
    
    // Update camera target to follow player
    if (this.camera.userData.orbitControl) {
      this.camera.userData.orbitControl.target.copy(this.player.position)
    }
  }

  updateCamera() {
    if (this.camera.userData.orbitControl) {
      const orbit = this.camera.userData.orbitControl
      const target = orbit.target
      
      // Calculate camera position with both horizontal and vertical rotation
      const horizontalDistance = orbit.distance * Math.cos(orbit.rotationX)
      const cameraX = target.x + horizontalDistance * Math.sin(orbit.rotationY)
      const cameraY = target.y + orbit.height + orbit.distance * Math.sin(orbit.rotationX)
      const cameraZ = target.z + horizontalDistance * Math.cos(orbit.rotationY)
      
      this.camera.position.set(cameraX, cameraY, cameraZ)
      this.camera.lookAt(target)
    }
  }

  animate() {
    if (!this.isRunning) return
    
    this.animationId = requestAnimationFrame(() => this.animate())
    
    const deltaTime = this.clock.getDelta()
    this.currentFPS = 1 / deltaTime
    
    // Update player physics
    this.updatePlayerPhysics()
    
    // Update camera
    this.updateCamera()
    
    // Emit update event
    this.emit('update', deltaTime)
    
    // Render
    this.renderer.render(this.scene, this.camera)
  }

  start() {
    console.log('GameEngine: Starting...')
    this.isRunning = true
    this.clock.start()
    this.animate()
    
    // Add keyboard event listeners
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event)
    })
    
    document.addEventListener('keyup', (event) => {
      this.keysPressed.delete(event.code)
    })
    
    console.log('GameEngine: Started successfully')
  }

  stop() {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.clock.stop()
  }

  addGameObject(objectId, object) {
    // Handle case where only object is passed (backward compatibility)
    if (object === undefined) {
      object = objectId
      objectId = null
    }
    
    if (this.scene) {
      this.scene.add(object)
      return object
    }
    return null
  }

  removeGameObject(object) {
    if (this.scene && object) {
      this.scene.remove(object)
    }
  }

  getScene() {
    return this.scene
  }

  getCamera() {
    return this.camera
  }

  getRenderer() {
    return this.renderer
  }

  getPlayer() {
    return this.player
  }

  getCameraDirection() {
    if (!this.camera || !this.camera.userData.orbitControl) {
      return new THREE.Vector3(0, 0, -1)
    }
    
    const orbit = this.camera.userData.orbitControl
    const direction = new THREE.Vector3(
      Math.sin(orbit.rotationY),
      0,
      Math.cos(orbit.rotationY)
    )
    
    return direction.normalize()
  }

  dispose() {
    this.destroy()
  }

  destroy() {
    this.stop()
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove()
    }
  }
}

export default GameEngine 