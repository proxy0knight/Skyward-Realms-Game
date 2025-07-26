import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import { get as idbGet } from 'idb-keyval'

class BabylonCharacter {
  constructor(scene, playerData) {
    this.scene = scene
    this.playerData = playerData
    this.gameEngine = scene.gameEngine // Store reference to game engine

    // Character components
    this.characterMesh = null
    this.characterGroup = null
    this.elementalEffects = []

    // Animation
    this.animationGroups = []
    this.currentAnimation = null

    // Movement
    this.moveSpeed = 5
    this.runSpeed = 10 // New: running speed
    this.acceleration = 30 // New: acceleration rate
    this.deceleration = 40 // New: deceleration rate
    this.velocity = new BABYLON.Vector3(0, 0, 0) // New: current velocity
    this.isRunning = false // New: running state
    this.isGrounded = false // New: grounded state
    this.lastGroundedTime = 0 // New: last time on ground
    this.groundCheckRayLength = 1.2 // New: ray length for ground check
    this.cameraMode = 'third' // New: camera mode (third/first)
    this.position = BABYLON.Vector3.Zero()

    // Element system
    this.element = playerData.element || { id: 'fire', name: 'النار', color: '#FF4500' }

    console.log('BabylonCharacter: Initialized for element:', this.element.name)
  }

  /**
   * Initialize minimal character
   */
  async init() {
    console.log('BabylonCharacter: Creating minimal character...')

    // Skip model loading to save memory - go straight to procedural
    console.log('BabylonCharacter: Using procedural character to save memory')
    return await this.createMinimalCharacter()
  }

  /**
   * Create ultra-minimal character
   */
  async createMinimalCharacter() {
    console.log('BabylonCharacter: Creating ultra-minimal character...')

    try {
      // Create minimal character group
      this.characterGroup = new BABYLON.TransformNode('minimalCharacterGroup', this.scene)
      
      // Simple capsule body only
      this.characterMesh = BABYLON.MeshBuilder.CreateCapsule('minimalBody', {
        radius: 0.5,
        height: 2
      }, this.scene)

      // Ultra-simple material
      const material = new BABYLON.StandardMaterial('minimalMaterial', this.scene)
      material.diffuseColor = BABYLON.Color3.FromHexString(this.element.color || '#FF4500')
      this.characterMesh.material = material

      // Parent to group
      this.characterMesh.parent = this.characterGroup

      // Position at origin
      this.characterGroup.position = new BABYLON.Vector3(0, 1, 0)

      console.log('BabylonCharacter: Minimal character created successfully')
      return this.characterGroup

    } catch (error) {
      console.error('BabylonCharacter: Failed to create minimal character:', error)
      return null
    }
  }

  /**
   * Check if a file exists without causing errors
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
   * Load GLB character model based on element (optimized)
   */
  async loadCharacterModel() {
    // Check memory before loading
    if (performance.memory) {
      const memoryInfo = performance.memory
      const usedMemory = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize
      
      if (usedMemory > 0.7) {
        console.warn('BabylonCharacter: High memory usage, using lightweight character')
        throw new Error('Memory constrained - using procedural character')
      }
    }

    // Support modelId at both playerData.modelId and playerData.element.modelId
    const modelId = this.playerData.modelId || (this.playerData.element && this.playerData.element.modelId)
    if (modelId) {
      console.log('BabylonCharacter: Attempting to load custom model from IndexedDB with modelId:', modelId)
      try {
        const base64 = await idbGet(modelId)
        if (base64) {
          const result = await BABYLON.SceneLoader.ImportMeshAsync('', '', base64, this.scene)
          // Find first valid mesh
          const validMesh = result.meshes.find(m => m && m instanceof BABYLON.Mesh && m.getTotalVertices && m.getTotalVertices() > 0)
          if (validMesh) {
            console.log('BabylonCharacter: Successfully loaded custom model from IndexedDB:', modelId, 'Mesh:', validMesh.name)
            return validMesh
          }
        }
      } catch (e) {
        console.warn('BabylonCharacter: Failed to load custom model from IndexedDB:', e)
      }
    }

    // Only try the most likely path to reduce failed requests
    const primaryPath = `/character/${this.element.id}.glb`
    
    try {
      console.log(`BabylonCharacter: Attempting to load model: ${primaryPath}`)
      const characterMesh = await this.loadSingleModel(primaryPath)
      console.log(`✅ Loaded character model: ${primaryPath}`)
      return characterMesh
    } catch (error) {
      console.log(`Failed to load ${primaryPath}:`, error.message)
      
      // Try one fallback path
      try {
        const fallbackPath = `/assets/models/character/${this.element.id}.glb`
        console.log(`BabylonCharacter: Trying fallback: ${fallbackPath}`)
        const characterMesh = await this.loadSingleModel(fallbackPath)
        console.log(`✅ Loaded fallback character model: ${fallbackPath}`)
        return characterMesh
      } catch (fallbackError) {
        console.log(`Fallback also failed: ${fallbackError.message}`)
      }
    }

    // If we get here, no models were found - this will trigger fallback creation
    console.log('BabylonCharacter: No 3D models found, will use procedural character')
    throw new Error(`No character models found for element: ${this.element.id}`)
  }

  /**
   * Load a single model file
   */
  async loadSingleModel(modelPath) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh(
        '',
        '',
        modelPath,
        this.scene,
        (meshes, particleSystems, skeletons, animationGroups) => {

          // Get the main character mesh (usually the first or root mesh)
          let characterMesh = meshes[0]

          // If multiple meshes, merge them into one
          if (meshes.length > 1) {
            characterMesh = BABYLON.Mesh.MergeMeshes(meshes.filter(mesh => mesh.material), true, true)
            characterMesh.name = `${this.element.id}_character`
          }

          // Scale and position
          characterMesh.scaling = new BABYLON.Vector3(2, 2, 2)
          characterMesh.position = new BABYLON.Vector3(0, 0, 0)

          // Apply element-based material modifications
          this.applyElementalMaterials(characterMesh)

          // Enable shadows
          characterMesh.receiveShadows = true
          if (this.scene.lights && this.scene.lights[0] && this.scene.lights[0].getShadowGenerator) {
            const shadowGenerator = this.scene.lights[0].getShadowGenerator()
            if (shadowGenerator) {
              shadowGenerator.addShadowCaster(characterMesh)
            }
          }

          // Store animation groups
          this.animationGroups = animationGroups

          resolve(characterMesh)
        },
        (progress) => {
          console.log('BabylonCharacter: Loading progress:', (progress.loaded / progress.total * 100).toFixed(1) + '%')
        },
        (error) => {
          console.error('BabylonCharacter: Failed to load model:', error)
          reject(error)
        }
      )
    })
  }

  /**
   * Apply element-based material modifications
   */
  applyElementalMaterials(mesh) {
    const elementColors = this.getElementColors()

    mesh.getChildMeshes().forEach(childMesh => {
      if (childMesh.material) {
        // Clone material to avoid affecting other instances
        const material = childMesh.material.clone(`${childMesh.name}_${this.element.id}_material`)

        // Apply element-based modifications
        if (material.diffuseTexture) {
          // Add color tinting
          material.diffuseColor = BABYLON.Color3.FromHexString(elementColors.primary)
        }

        // Add emissive glow
        material.emissiveColor = BABYLON.Color3.FromHexString(elementColors.glow)
        material.emissiveIntensity = 0.1

        childMesh.material = material
      }
    })
  }

  /**
   * Create fallback procedural character
   */
  async createFallbackCharacter() {
    console.log('BabylonCharacter: Creating fallback procedural character...')

    const characterGroup = new BABYLON.TransformNode('fallbackCharacterGroup', this.scene)
    const elementColors = this.getElementColors()

    // Create body
    const body = BABYLON.MeshBuilder.CreateCapsule('body', {
      radius: 0.5,
      height: 2
    }, this.scene)

    // Body material
    const bodyMaterial = new BABYLON.PBRMaterial('bodyMaterial', this.scene)
    bodyMaterial.baseColor = BABYLON.Color3.FromHexString(elementColors.primary)
    bodyMaterial.metallic = 0.1
    bodyMaterial.roughness = 0.7
    bodyMaterial.emissiveColor = BABYLON.Color3.FromHexString(elementColors.glow)
    bodyMaterial.emissiveIntensity = 0.1
    body.material = bodyMaterial

    // Create head
    const head = BABYLON.MeshBuilder.CreateSphere('head', {
      diameter: 0.8
    }, this.scene)
    head.position.y = 1.2

    const headMaterial = bodyMaterial.clone('headMaterial')
    headMaterial.emissiveIntensity = 0.2
    head.material = headMaterial

    // Parent to group
    body.parent = characterGroup
    head.parent = characterGroup

    // Enable shadows
    body.receiveShadows = true
    head.receiveShadows = true

    this.characterGroup = characterGroup
    this.characterMesh = body

    return characterGroup
  }

  /**
   * Setup physics for character
   */
  setupPhysics() {
    if (!this.characterMesh) {
      console.warn('BabylonCharacter: No valid character mesh for physics. Creating physics box.')
      // Create a physics box for the character even without mesh
      this.createPhysicsBox()
      return
    }
    
    // Add physics impostor only if physics engine is available
    if (this.scene.getPhysicsEngine()) {
      try {
        // Create physics impostor for the character mesh
        this.characterMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
          this.characterMesh,
          BABYLON.PhysicsImpostor.BoxImpostor, // Use box instead of capsule for better stability
          { 
            mass: 1, 
            restitution: 0.0, // No bouncing
            friction: 1.0,    // High friction to prevent sliding
            ignoreCollisions: false
          },
          this.scene
        )
        
        // Lock rotation to prevent character from tipping over
        if (this.characterMesh.physicsImpostor.physicsBody) {
          this.characterMesh.physicsImpostor.physicsBody.fixedRotation = true
          this.characterMesh.physicsImpostor.physicsBody.updateMassProperties()
        }
        
        console.log('BabylonCharacter: Physics impostor created successfully')
      } catch (error) {
        console.warn('BabylonCharacter: Could not create physics impostor:', error)
        this.createPhysicsBox()
        return
      }
      
      // Initialize physics body position
      if (this.characterMesh.physicsImpostor) {
        setTimeout(() => {
          this.initializePhysicsPosition()
          this.setupGroundDetection()
        }, 100)
      }
    } else {
      console.log('BabylonCharacter: Physics not available, using visual-only character')
    }
  }

  /**
   * Create a physics box as fallback
   */
  createPhysicsBox() {
    if (!this.scene.gameEngine) return
    
    const position = this.characterGroup ? this.characterGroup.position : new BABYLON.Vector3(0, 2, 0)
    this.scene.gameEngine.ensurePhysicsBox(
      this.characterMesh ? [this.characterMesh] : [], 
      position, 
      {width: 1, height: 2, depth: 1}
    )
  }

  /**
   * Initialize physics position and apply gravity
   */
  initializePhysicsPosition() {
    if (!this.characterMesh || !this.characterMesh.physicsImpostor) return
    
    try {
      // Set initial position slightly above ground
      const currentPos = this.characterMesh.position.clone()
      currentPos.y = Math.max(currentPos.y, 2) // Ensure character starts above ground
      
      this.characterMesh.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero())
      this.characterMesh.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero())
      
      // Apply small downward force to ensure grounding
      setTimeout(() => {
        if (this.characterMesh.physicsImpostor) {
          this.characterMesh.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -2, 0), this.characterMesh.position)
        }
      }, 200)
      
    } catch (error) {
      console.warn('BabylonCharacter: Failed to initialize physics position:', error)
    }
  }

  /**
   * Setup ground detection to prevent falling through terrain
   */
  setupGroundDetection() {
    if (!this.characterMesh || !this.scene) return

    // Store reference to engine for terrain detection
    this.gameEngine = this.scene.gameEngine

    // Register render loop for ground check
    this.scene.registerBeforeRender(() => {
      if (!this.characterMesh) return

      const position = this.characterMesh.position

      // Check if character fell below safe height
      if (position.y < -10) {
        // Get terrain height at current position
        const terrainHeight = this.gameEngine?.getTerrainHeight?.(position.x, position.z) || 1

        // Reset position to terrain surface
        this.characterMesh.position.y = terrainHeight + 2

        // Reset physics if available
        if (this.characterMesh.physicsImpostor) {
          this.characterMesh.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero())
        }

        console.log('BabylonCharacter: Respawned on terrain at height', terrainHeight)
      }
    })
  }

  /**
   * Create elemental effects around character
   */
  async createElementalEffects() {
    const elementColors = this.getElementColors()

    switch (this.element.id) {
      case 'fire':
        await this.createFireEffects(elementColors)
        break
      case 'water':
        await this.createWaterEffects(elementColors)
        break
      case 'earth':
        await this.createEarthEffects(elementColors)
        break
      case 'air':
        await this.createAirEffects(elementColors)
        break
    }

    console.log('BabylonCharacter: Elemental effects created')
  }

  /**
   * Create fire elemental effects
   */
  async createFireEffects(colors) {
    // Fire particle system
    const fireParticles = new BABYLON.ParticleSystem('fireParticles', 100, this.scene)
    // Use procedural texture if file doesn't exist
    try {
      fireParticles.particleTexture = new BABYLON.Texture('/textures/flare.png', this.scene)
    } catch {
      console.log('BabylonCharacter: Using procedural fire texture')
    }

    // Emitter
    fireParticles.emitter = this.characterGroup
    fireParticles.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5)
    fireParticles.maxEmitBox = new BABYLON.Vector3(0.5, 2, 0.5)

    // Colors
    fireParticles.color1 = BABYLON.Color4.FromHexString(colors.primary + 'FF')
    fireParticles.color2 = BABYLON.Color4.FromHexString(colors.glow + 'FF')
    fireParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0)

    // Size
    fireParticles.minSize = 0.1
    fireParticles.maxSize = 0.3

    // Life time
    fireParticles.minLifeTime = 0.3
    fireParticles.maxLifeTime = 1.0

    // Emission rate
    fireParticles.emitRate = 20

    // Direction
    fireParticles.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5)
    fireParticles.direction2 = new BABYLON.Vector3(0.5, 2, 0.5)

    // Speed
    fireParticles.minEmitPower = 1
    fireParticles.maxEmitPower = 3

    // Start the system
    fireParticles.start()

    this.elementalEffects.push(fireParticles)
  }

  /**
   * Create water elemental effects
   */
  async createWaterEffects(colors) {
    // Water droplet particles
    const waterParticles = new BABYLON.ParticleSystem('waterParticles', 50, this.scene)
    try {
      waterParticles.particleTexture = new BABYLON.Texture('/textures/droplet.png', this.scene)
    } catch {
      console.log('BabylonCharacter: Using procedural water texture')
    }

    waterParticles.emitter = this.characterGroup
    waterParticles.minEmitBox = new BABYLON.Vector3(-1, 0.5, -1)
    waterParticles.maxEmitBox = new BABYLON.Vector3(1, 2.5, 1)

    waterParticles.color1 = BABYLON.Color4.FromHexString(colors.primary + 'AA')
    waterParticles.color2 = BABYLON.Color4.FromHexString(colors.glow + 'AA')

    waterParticles.minSize = 0.05
    waterParticles.maxSize = 0.15

    waterParticles.minLifeTime = 1.0
    waterParticles.maxLifeTime = 2.0

    waterParticles.emitRate = 15

    waterParticles.gravity = new BABYLON.Vector3(0, -2, 0)

    waterParticles.start()
    this.elementalEffects.push(waterParticles)
  }

  /**
   * Create earth elemental effects
   */
  async createEarthEffects(colors) {
    // Floating rocks
    for (let i = 0; i < 6; i++) {
      const rock = BABYLON.MeshBuilder.CreateBox('rock_' + i, {
        width: 0.1 + Math.random() * 0.1,
        height: 0.1 + Math.random() * 0.1,
        depth: 0.1 + Math.random() * 0.1
      }, this.scene)

      const rockMaterial = new BABYLON.PBRMaterial('rockMaterial_' + i, this.scene)
      rockMaterial.baseColor = BABYLON.Color3.FromHexString(colors.primary)
      rockMaterial.roughness = 0.9
      rock.material = rockMaterial

      // Position around character
      const angle = (i / 6) * Math.PI * 2
      const radius = 1.5
      rock.position = new BABYLON.Vector3(
        Math.cos(angle) * radius,
        1 + Math.random() * 1,
        Math.sin(angle) * radius
      )

      rock.parent = this.characterGroup
      this.elementalEffects.push(rock)

      // Animate floating
      rock.animations = []
      BABYLON.Animation.CreateAndStartAnimation(
        'rockFloat_' + i,
        rock,
        'position.y',
        30,
        120,
        rock.position.y,
        rock.position.y + 0.5,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      )
    }
  }

  /**
   * Create air elemental effects
   */
  async createAirEffects(colors) {
    // Wind spiral particles
    const windParticles = new BABYLON.ParticleSystem('windParticles', 80, this.scene)
    try {
      windParticles.particleTexture = new BABYLON.Texture('/textures/wind.png', this.scene)
    } catch {
      console.log('BabylonCharacter: Using procedural wind texture')
    }

    windParticles.emitter = this.characterGroup

    // Spiral emission
    windParticles.startPositionFunction = (worldMatrix, positionToUpdate) => {
      const time = Date.now() * 0.001
      const radius = 1.5
      const height = Math.random() * 3
      const angle = time + Math.random() * Math.PI * 2

      positionToUpdate.x = Math.cos(angle) * radius
      positionToUpdate.y = height
      positionToUpdate.z = Math.sin(angle) * radius
    }

    windParticles.color1 = BABYLON.Color4.FromHexString(colors.primary + '66')
    windParticles.color2 = BABYLON.Color4.FromHexString(colors.glow + '66')

    windParticles.minSize = 0.05
    windParticles.maxSize = 0.2

    windParticles.minLifeTime = 2.0
    windParticles.maxLifeTime = 4.0

    windParticles.emitRate = 25

    windParticles.start()
    this.elementalEffects.push(windParticles)
  }

  /**
   * Setup animations
   */
  setupAnimations() {
    if (this.animationGroups.length > 0) {
      // Find and play idle animation
      const idleAnimation = this.animationGroups.find(ag => 
        ag.name.toLowerCase().includes('idle') || 
        ag.name.toLowerCase().includes('stand')
      )

      if (idleAnimation) {
        this.currentAnimation = idleAnimation
        idleAnimation.start(true) // Loop
        console.log('BabylonCharacter: Playing idle animation:', idleAnimation.name)
      } else {
        // Play first available animation
        this.currentAnimation = this.animationGroups[0]
        this.currentAnimation.start(true)
        console.log('BabylonCharacter: Playing first animation:', this.currentAnimation.name)
      }
    }
  }

  /**
   * Play specific animation
   */
  playAnimation(animationName) {
    const animation = this.animationGroups.find(ag => 
      ag.name.toLowerCase().includes(animationName.toLowerCase())
    )

    if (animation) {
      if (this.currentAnimation) {
        this.currentAnimation.stop()
      }

      this.currentAnimation = animation
      animation.start(true)
      console.log('BabylonCharacter: Playing animation:', animation.name)
    }
  }

  /**
   * Get element color scheme
   */
  getElementColors() {
    const colorSchemes = {
      fire: {
        primary: '#FF4500',
        secondary: '#FF6347',
        glow: '#FF8C00'
      },
      water: {
        primary: '#1E90FF',
        secondary: '#4169E1',
        glow: '#00BFFF'
      },
      earth: {
        primary: '#8B4513',
        secondary: '#A0522D',
        glow: '#DEB887'
      },
      air: {
        primary: '#87CEEB',
        secondary: '#98D8E8',
        glow: '#E0F6FF'
      }
    }

    return colorSchemes[this.element.id] || colorSchemes.fire
  }

  /**
   * Move character (with acceleration, deceleration, running)
   */
  move(direction, isRunning = false) {
    if (!this.characterGroup) return
    const deltaTime = this.scene.getEngine().getDeltaTime() / 1000
    const targetSpeed = isRunning ? this.runSpeed : this.moveSpeed
    
    // Only use X/Z for movement
    const moveDir = new BABYLON.Vector3(direction.x, 0, direction.z)
    if (moveDir.length() > 0) {
      moveDir.normalize()
      
      // Check map boundaries before applying movement
      const currentPos = this.getPosition()
      const futurePos = currentPos.add(moveDir.scale(targetSpeed * deltaTime))
      
      if (!this.isWithinMapBounds(futurePos)) {
        // Don't move if it would go outside map bounds
        this.velocity.x = this._approach(this.velocity.x, 0, this.deceleration * deltaTime)
        this.velocity.z = this._approach(this.velocity.z, 0, this.deceleration * deltaTime)
        return
      }
      
      // Accelerate towards target speed
      const desiredVelocity = moveDir.scale(targetSpeed)
      this.velocity.x = this._approach(this.velocity.x, desiredVelocity.x, this.acceleration * deltaTime)
      this.velocity.z = this._approach(this.velocity.z, desiredVelocity.z, this.acceleration * deltaTime)
    } else {
      // Decelerate to stop
      this.velocity.x = this._approach(this.velocity.x, 0, this.deceleration * deltaTime)
      this.velocity.z = this._approach(this.velocity.z, 0, this.deceleration * deltaTime)
    }
    
    // Apply movement with boundary checking
    this.applyMovementWithBounds(deltaTime)
  }

  /**
   * Apply movement while respecting map boundaries
   */
  applyMovementWithBounds(deltaTime) {
    const currentPos = this.getPosition()
    const newPos = currentPos.add(new BABYLON.Vector3(this.velocity.x * deltaTime, 0, this.velocity.z * deltaTime))
    
    // Clamp position to map bounds
    const clampedPos = this.clampToMapBounds(newPos)
    
    if (this.characterMesh && this.characterMesh.physicsImpostor) {
      try {
        const currentVelocity = this.characterMesh.physicsImpostor.getLinearVelocity()
        if (currentVelocity) {
          // Check if we hit a boundary and stop movement in that direction
          const velocityX = (clampedPos.x !== newPos.x) ? 0 : this.velocity.x
          const velocityZ = (clampedPos.z !== newPos.z) ? 0 : this.velocity.z
          
          this.characterMesh.physicsImpostor.setLinearVelocity(
            new BABYLON.Vector3(velocityX, currentVelocity.y, velocityZ)
          )
        }
      } catch {
        // Fallback to direct movement
        this.setPosition(clampedPos)
      }
      this.checkCollisions(new BABYLON.Vector3(this.velocity.x, 0, this.velocity.z))
    } else {
      // Fallback: direct movement
      this.setPosition(clampedPos)
    }
  }

  /**
   * Check if position is within map boundaries
   */
  isWithinMapBounds(position) {
    const mapData = this.gameEngine?.mapData
    if (!mapData || !Array.isArray(mapData)) {
      // If no map data, use default bounds
      return position.x >= -50 && position.x <= 50 && position.z >= -50 && position.z <= 50
    }
    
    const mapWidth = mapData[0]?.length || 16
    const mapHeight = mapData.length || 16
    
    return position.x >= -0.5 && position.x <= mapWidth - 0.5 && 
           position.z >= -0.5 && position.z <= mapHeight - 0.5
  }

  /**
   * Clamp position to map boundaries
   */
  clampToMapBounds(position) {
    const mapData = this.gameEngine?.mapData
    if (!mapData || !Array.isArray(mapData)) {
      // If no map data, use default bounds
      return new BABYLON.Vector3(
        Math.max(-50, Math.min(50, position.x)),
        position.y,
        Math.max(-50, Math.min(50, position.z))
      )
    }
    
    const mapWidth = mapData[0]?.length || 16
    const mapHeight = mapData.length || 16
    
    return new BABYLON.Vector3(
      Math.max(-0.5, Math.min(mapWidth - 0.5, position.x)),
      position.y,
      Math.max(-0.5, Math.min(mapHeight - 0.5, position.z))
    )
  }

  /**
   * Helper for smooth acceleration/deceleration
   */
  _approach(current, target, delta) {
    if (current < target) return Math.min(current + delta, target)
    if (current > target) return Math.max(current - delta, target)
    return target
  }

  /**
   * Check for collisions using raycasting
   */
  checkCollisions(moveVector) {
    if (!this.scene || !this.characterMesh) return

    const origin = this.characterMesh.position.clone()
    const direction = moveVector.normalize()
    const ray = new BABYLON.Ray(origin, direction)

    // Check collision with terrain and objects
    const hit = this.scene.pickWithRay(ray, (mesh) => {
      return mesh !== this.characterMesh && 
             mesh !== this.characterGroup && 
             mesh.checkCollisions !== false
    })

    // If collision detected and close, stop movement
    if (hit && hit.hit && hit.distance < 2) {
      // Reset velocity to prevent clipping
      if (this.characterMesh.physicsImpostor) {
        const currentVelocity = this.characterMesh.physicsImpostor.getLinearVelocity()
        this.characterMesh.physicsImpostor.setLinearVelocity(
          new BABYLON.Vector3(0, currentVelocity.y, 0)
        )
      }
    }
  }

  /**
   * Check if character is grounded (raycast down)
   */
  checkGrounded() {
    if (!this.characterMesh) return false
    const origin = this.characterMesh.position.clone()
    const down = new BABYLON.Vector3(0, -1, 0)
    const ray = new BABYLON.Ray(origin, down, this.groundCheckRayLength)
    const hit = this.scene.pickWithRay(ray, (mesh) => mesh !== this.characterMesh && mesh.checkCollisions !== false)
    this.isGrounded = !!(hit && hit.hit && hit.distance < this.groundCheckRayLength)
    if (this.isGrounded) this.lastGroundedTime = Date.now()
    return this.isGrounded
  }

  /**
   * Check if position is valid (for non-physics movement)
   */
  isPositionValid(position) {
    if (!this.scene) return true

    // Simple bounds check
    const maxDistance = 100 // Maximum distance from origin
    if (position.length() > maxDistance) {
      return false
    }

    return true
  }

  /**
   * Jump (only if grounded)
   */
  jump() {
    if (!this.characterGroup) return
    this.checkGrounded()
    if (!this.isGrounded && Date.now() - this.lastGroundedTime > 200) return // Prevent double jump
    this.isJumping = true
    setTimeout(() => { this.isJumping = false }, 1000)
    if (this.characterMesh && this.characterMesh.physicsImpostor) {
      const currentVelocity = this.characterMesh.physicsImpostor.getLinearVelocity()
      this.characterMesh.physicsImpostor.setLinearVelocity(
        new BABYLON.Vector3(currentVelocity.x, 8, currentVelocity.z)
      )
    } else {
      // Fallback: animate jump
      const startY = this.characterGroup.position.y
      const jumpHeight = 2
      const jumpDuration = 800
      BABYLON.Animation.CreateAndStartAnimation('jumpUp', this.characterGroup, 'position.y', 60, 30, startY, startY + jumpHeight, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
      setTimeout(() => {
        BABYLON.Animation.CreateAndStartAnimation('jumpDown', this.characterGroup, 'position.y', 60, 30, startY + jumpHeight, startY, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
      }, jumpDuration / 2)
    }
  }

  /**
   * Get character position
   */
  getPosition() {
    return this.characterGroup ? this.characterGroup.position : BABYLON.Vector3.Zero()
  }

  /**
   * Set character position
   */
  setPosition(position) {
    if (this.characterGroup) {
      this.characterGroup.position = position
    }
  }

  /**
   * Toggle camera mode (first/third person)
   */
  toggleCameraMode() {
    this.cameraMode = this.cameraMode === 'third' ? 'first' : 'third'
    // Camera logic will be handled in the engine
  }

  /**
   * Dispose character and effects
   */
  dispose() {
    // Stop animations
    this.animationGroups.forEach(ag => ag.stop())

    // Dispose effects
    this.elementalEffects.forEach(effect => {
      if (effect.dispose) {
        effect.dispose()
      }
    })

    // Dispose character
    if (this.characterGroup) {
      this.characterGroup.dispose()
    }

    console.log('BabylonCharacter: Disposed')
  }
}

export default BabylonCharacter