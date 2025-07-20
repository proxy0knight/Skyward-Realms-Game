import * as THREE from 'three'
import Enhanced3DWorld from './Enhanced3DWorld.js'
import Enhanced3DCharacter from './Enhanced3DCharacter.js'
import Enhanced3DAudio from './Enhanced3DAudio.js'
import OptimizedWorldRenderer from './OptimizedWorldRenderer.js'
import AssetManager from './AssetManager.js'
import PhysicsSystem from './PhysicsSystem.js'
import WaterSystem from './WaterSystem.js'

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
    
    // Enhanced 3D systems
    this.enhanced3DWorld = null
    this.enhanced3DCharacter = null
    this.enhanced3DAudio = null
    this.physicsSystem = null
    this.waterSystem = null
    this.optimizedWorldRenderer = null
    this.assetManager = null
    
    // Player physics
    this.playerVelocity = new THREE.Vector3()
    this.playerOnGround = true
    this.gravity = -0.02
    this.jumpForce = 0.3
    this.moveSpeed = 0.1
    this.keysPressed = new Set()
  }

  async init(container) {
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
      this.renderer.setClearColor(0x87CEEB, 1) // Sky blue background
      
      // Ensure canvas is properly styled
      this.renderer.domElement.style.width = '100%'
      this.renderer.domElement.style.height = '100%'
      this.renderer.domElement.style.display = 'block'
      
      container.appendChild(this.renderer.domElement)
      
      // Initialize physics system
      console.log('GameEngine: Initializing physics system...')
      this.physicsSystem = new PhysicsSystem(this.scene)
      
      // Initialize water system
      console.log('GameEngine: Initializing water system...')
      this.waterSystem = new WaterSystem(this.scene, this.renderer)
      
      // Initialize optimized world renderer
      console.log('GameEngine: Initializing optimized world renderer...')
      this.optimizedWorldRenderer = new OptimizedWorldRenderer(this.scene, this.camera, this.renderer)
      const optimizedInitSuccess = await this.optimizedWorldRenderer.init()
      
      if (optimizedInitSuccess) {
        console.log('GameEngine: Using optimized world renderer')
        // Create optimized world
        await this.createOptimizedWorld()
      } else {
        console.log('GameEngine: Falling back to enhanced 3D world')
        // Fallback to original system
        this.enhanced3DWorld = new Enhanced3DWorld(this.scene, this.camera, this.renderer)
        await this.enhanced3DWorld.init()
      }
      
      // Initialize enhanced 3D audio
      console.log('GameEngine: Initializing enhanced 3D audio...')
      this.enhanced3DAudio = new Enhanced3DAudio(this.camera)
      await this.enhanced3DAudio.init()
      
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

  async createOptimizedWorld() {
    console.log('GameEngine: Creating optimized fantasy world...')
    
    try {
      // Create optimized terrain with larger coverage
      await this.optimizedWorldRenderer.createOptimizedTerrain(400)
      
      // Add terrain to physics system
      this.scene.traverse((child) => {
        if (child.name && child.name.includes('TerrainChunk')) {
          this.physicsSystem.addStaticCollider(child, { type: 'plane', material: 'terrain' })
        }
      })
      
      // Create water bodies
      this.waterSystem.createWaterBodies()
      
      // Generate tree positions
      const treePositions = []
      for (let i = 0; i < 120; i++) {
        treePositions.push({
          x: (Math.random() - 0.5) * 180,
          y: 0,
          z: (Math.random() - 0.5) * 180
        })
      }
      
      // Create optimized forest using instanced rendering
      await this.optimizedWorldRenderer.createOptimizedForest(treePositions)
      
      // Add trees to physics system as static colliders
      this.scene.traverse((child) => {
        if (child.name && child.name.includes('Tree')) {
          this.physicsSystem.addStaticCollider(child, { type: 'cylinder', material: 'wood' })
        }
      })
      
      // Add rocks and other environmental elements
      const rockPositions = []
      for (let i = 0; i < 40; i++) {
        rockPositions.push({
          x: (Math.random() - 0.5) * 160,
          y: 0,
          z: (Math.random() - 0.5) * 160
        })
      }
      await this.optimizedWorldRenderer.createOptimizedRocks(rockPositions)
      
      // Add rocks to physics system as static colliders
      this.scene.traverse((child) => {
        if (child.name && child.name.includes('Rock')) {
          this.physicsSystem.addStaticCollider(child, { type: 'sphere', material: 'stone' })
        }
      })
      
      console.log('GameEngine: Optimized world created successfully!')
      console.log('✅ Physics System: Enabled with terrain, trees, and rock collisions')
      console.log('🌊 Water System: Enabled with interactive lakes, rivers, and ponds')
      console.log('🎯 OPTIMIZATION STATUS:')
      console.log('✅ Instanced Rendering: Active')
      console.log('✅ Frustum Culling: Active')  
      console.log('✅ World Streaming: Active')
      console.log('✅ Asset Optimization: Active')
      console.log('📊 Performance: Monitoring enabled')
    } catch (error) {
      console.error('GameEngine: Failed to create optimized world:', error)
      throw error
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

  async createPlayer(playerData) {
    console.log('GameEngine: Creating enhanced 3D character...')
    
    // Create enhanced 3D character
    this.enhanced3DCharacter = new Enhanced3DCharacter(this.scene, playerData)
    this.player = await this.enhanced3DCharacter.init()
    
    // Position player at spawn point
    this.enhanced3DCharacter.setPosition(0, 2, 0) // Start slightly above ground
    
    // Add physics to player
    if (this.physicsSystem && this.player) {
      this.physicsSystem.addBody(this.player, {
        type: 'dynamic',
        mass: 1.0,
        radius: 0.8,
        height: 2.0,
        restitution: 0.1,
        friction: 0.8
      })
      console.log('GameEngine: Added physics to player character')
    }
    
    console.log('GameEngine: Enhanced 3D character created:', this.player)
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
        // Use physics system for jumping
        if (this.physicsSystem && this.player) {
          if (this.physicsSystem.isOnGround(this.player)) {
            this.physicsSystem.applyForce(this.player, new THREE.Vector3(0, 15, 0), 'impulse')
          }
        } else if (this.playerOnGround) {
          this.playerVelocity.y = this.jumpForce
          this.playerOnGround = false
        }
        break
      case 'KeyQ':
        // Cast primary spell
        if (this.enhanced3DCharacter) {
          this.enhanced3DCharacter.castSpell('primary')
          // Play spell sound
          if (this.enhanced3DAudio) {
            this.enhanced3DAudio.playSpellSound('primary', this.player.position)
          }
        }
        break
      case 'KeyE':
        // Cast secondary spell
        if (this.enhanced3DCharacter) {
          this.enhanced3DCharacter.castSpell('secondary')
          // Play spell sound
          if (this.enhanced3DAudio) {
            this.enhanced3DAudio.playSpellSound('secondary', this.player.position)
          }
        }
        break
      case 'KeyR':
        // Cast ultimate spell
        if (this.enhanced3DCharacter) {
          this.enhanced3DCharacter.castSpell('ultimate')
          // Play spell sound
          if (this.enhanced3DAudio) {
            this.enhanced3DAudio.playSpellSound('ultimate', this.player.position)
          }
        }
        break
      case 'KeyF':
        // Change weather for testing
        if (this.enhanced3DWorld) {
          const weathers = ['clear', 'rain', 'snow', 'fog']
          const currentWeather = this.enhanced3DWorld.weather.type
          const nextIndex = (weathers.indexOf(currentWeather) + 1) % weathers.length
          this.enhanced3DWorld.setWeather(weathers[nextIndex], 0.7)
          console.log(`Weather changed to: ${weathers[nextIndex]}`)
        }
        break
    }
    
    // Emit keydown event
    this.emit('keydown', event)
  }

  updatePlayerPhysics() {
    if (!this.player || !this.enhanced3DCharacter) return
    
    // Get camera direction for relative movement
    const cameraDirection = this.getCameraDirection()
    
    // Handle continuous movement relative to camera
    const moveVector = new THREE.Vector3()
    let isMoving = false
    
    if (this.keysPressed.has('KeyW')) {
      // Move forward relative to camera
      moveVector.add(cameraDirection.clone().multiplyScalar(-this.moveSpeed))
      isMoving = true
    }
    if (this.keysPressed.has('KeyS')) {
      // Move backward relative to camera
      moveVector.add(cameraDirection.clone().multiplyScalar(this.moveSpeed))
      isMoving = true
    }
    if (this.keysPressed.has('KeyA')) {
      // Move left relative to camera
      moveVector.add(cameraDirection.clone().cross(new THREE.Vector3(0, 1, 0)).multiplyScalar(-this.moveSpeed))
      isMoving = true
    }
    if (this.keysPressed.has('KeyD')) {
      // Move right relative to camera
      moveVector.add(cameraDirection.clone().cross(new THREE.Vector3(0, 1, 0)).multiplyScalar(this.moveSpeed))
      isMoving = true
    }
    
    // Apply horizontal movement
    if (this.physicsSystem && this.player) {
      // Use physics system for movement
      const force = new THREE.Vector3(moveVector.x * 50, 0, moveVector.z * 50)
      this.physicsSystem.applyForce(this.player, force, 'force')
    } else {
      // Fallback to legacy movement
      this.playerVelocity.x = moveVector.x
      this.playerVelocity.z = moveVector.z
    }
    
    // Update character animation based on movement
    if (isMoving) {
      this.enhanced3DCharacter.playAnimation('walking')
      
      // Make player face movement direction
      const moveDirection = moveVector.clone().normalize()
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z)
      this.enhanced3DCharacter.setRotation(targetRotation)
    } else {
      this.enhanced3DCharacter.playAnimation('idle')
    }
    
    // Legacy physics for fallback mode only
    if (!this.physicsSystem) {
      // Apply gravity
      this.playerVelocity.y += this.gravity
      
      // Apply velocity to position
      const newPosition = this.player.position.clone().add(this.playerVelocity)
      
      // Ground collision
      const terrainHeight = this.enhanced3DWorld ? this.enhanced3DWorld.getTerrainHeight(newPosition.x, newPosition.z) : 0
      if (newPosition.y <= terrainHeight + 1) {
        newPosition.y = terrainHeight + 1
        this.playerVelocity.y = 0
        this.playerOnGround = true
      }
      
      // Update enhanced character position
      this.enhanced3DCharacter.setPosition(newPosition.x, newPosition.y, newPosition.z)
    }
    
    // Update camera target to follow player (works with both physics systems)
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
    
    // Update physics system
    if (this.physicsSystem) {
      this.physicsSystem.update(deltaTime)
      
      // Check water interaction for player
      if (this.player && this.waterSystem) {
        const waterInteraction = this.waterSystem.isInWater(this.player.position)
        if (waterInteraction.inWater) {
          this.waterSystem.applyWaterEffects(this.player, waterInteraction)
          // Update physics body water state
          if (this.player.physicsBody) {
            this.player.physicsBody.inWater = true
          }
        } else if (this.player.physicsBody) {
          this.player.physicsBody.inWater = false
        }
      }
    }
    
    // Update water system
    if (this.waterSystem) {
      this.waterSystem.update(deltaTime)
    }
    
    // Update enhanced 3D world or optimized renderer
    if (this.optimizedWorldRenderer) {
      this.optimizedWorldRenderer.update(deltaTime * 1000) // Convert to milliseconds
    } else if (this.enhanced3DWorld) {
      this.enhanced3DWorld.update(deltaTime * 1000) // Convert to milliseconds
    }
    
    // Update enhanced 3D character
    if (this.enhanced3DCharacter) {
      this.enhanced3DCharacter.update(deltaTime * 1000) // Convert to milliseconds
    }
    
    // Update enhanced 3D audio
    if (this.enhanced3DAudio && this.player && this.enhanced3DWorld) {
      this.enhanced3DAudio.updateEnvironmentalAudio(this.player.position, {
        waterBodies: [],
        magicalStructures: this.enhanced3DWorld.buildings || []
      })
      
      // Dynamic music based on time of day
      const timeOfDay = this.enhanced3DWorld.timeOfDay
      if (timeOfDay < 0.2 || timeOfDay > 0.8) {
        this.enhanced3DAudio.setMusicBasedOnContext('night')
      } else {
        this.enhanced3DAudio.setMusicBasedOnContext('exploration')
      }
    }
    
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
    
          // Debug scene content
      setTimeout(() => {
        console.log('GameEngine: Scene debug info:', {
          sceneChildren: this.scene.children.length,
          cameraPosition: this.camera.position,
          cameraTarget: this.camera.getWorldDirection(new THREE.Vector3()),
          rendererSize: this.renderer.getSize(new THREE.Vector2()),
          isRunning: this.isRunning
        })
        
        // Add a test cube to verify rendering is working
        if (this.scene.children.length > 0) {
          const testGeometry = new THREE.BoxGeometry(2, 2, 2)
          const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
          const testCube = new THREE.Mesh(testGeometry, testMaterial)
          testCube.position.set(0, 5, 0) // Position it above ground
          this.scene.add(testCube)
          console.log('GameEngine: Added red test cube at (0, 5, 0)')
        }
      }, 1000)
    
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
    
    // Clean up physics system
    if (this.physicsSystem) {
      this.physicsSystem.dispose()
    }
    
    // Clean up water system
    if (this.waterSystem) {
      this.waterSystem.dispose()
    }
    
    // Clean up other systems
    if (this.optimizedWorldRenderer) {
      this.optimizedWorldRenderer.dispose()
    }
    
    if (this.enhanced3DCharacter) {
      this.enhanced3DCharacter.dispose()
    }
    
    if (this.enhanced3DAudio) {
      this.enhanced3DAudio.dispose()
    }
    
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove()
    }
  }
}

export default GameEngine 