import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'

class BabylonCharacter {
  constructor(scene, playerData) {
    this.scene = scene
    this.playerData = playerData
    
    // Character components
    this.characterMesh = null
    this.characterGroup = null
    this.elementalEffects = []
    
    // Animation
    this.animationGroups = []
    this.currentAnimation = null
    
    // Movement
    this.moveSpeed = 5
    this.position = BABYLON.Vector3.Zero()
    
    // Element system
    this.element = playerData.element || { id: 'fire', name: 'النار', color: '#FF4500' }
    
    console.log('BabylonCharacter: Initialized for element:', this.element.name)
  }

  /**
   * Initialize and load character
   */
  async init() {
    console.log('BabylonCharacter: Loading character...')
    
    try {
      // Load GLB character model
      this.characterMesh = await this.loadCharacterModel()
      
      // Create character group
      this.characterGroup = new BABYLON.TransformNode('characterGroup', this.scene)
      this.characterMesh.parent = this.characterGroup
      
      // Setup physics
      this.setupPhysics()
      
      // Add elemental effects
      await this.createElementalEffects()
      
      // Setup animations
      this.setupAnimations()
      
      console.log('BabylonCharacter: Character loaded successfully!')
      return this.characterGroup
      
    } catch (error) {
      console.warn('BabylonCharacter: Could not load GLB model, creating fallback:', error)
      return await this.createFallbackCharacter()
    }
  }

  /**
   * Load GLB character model based on element
   */
  async loadCharacterModel() {
    const modelPaths = {
      fire: '/assets/models/characters/fire.glb',
      water: '/assets/models/characters/water.glb',
      earth: '/assets/models/characters/earth.glb',
      air: '/assets/models/characters/wind.glb'
    }
    
    const modelPath = modelPaths[this.element.id] || '/assets/models/characters/fire.glb'
    
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh(
        '',
        '',
        modelPath,
        this.scene,
        (meshes, particleSystems, skeletons, animationGroups) => {
          console.log(`BabylonCharacter: Loaded ${this.element.id} character from ${modelPath}`)
          
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
          console.log('BabylonCharacter: Available animations:', animationGroups.map(ag => ag.name))
          
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
    if (!this.characterMesh) return
    
    // Add physics impostor
    this.characterMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.characterMesh,
      BABYLON.PhysicsImpostor.CapsuleImpostor,
      { 
        mass: 1, 
        restitution: 0.1, 
        friction: 0.8 
      },
      this.scene
    )
    
    console.log('BabylonCharacter: Physics setup complete')
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
    } catch (error) {
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
    } catch (error) {
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
      const animationFloat = BABYLON.Animation.CreateAndStartAnimation(
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
    } catch (error) {
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
   * Move character
   */
  move(direction) {
    if (!this.characterMesh || !this.characterMesh.physicsImpostor) return
    
    const moveVector = direction.scale(this.moveSpeed)
    const currentVelocity = this.characterMesh.physicsImpostor.getLinearVelocity()
    
    this.characterMesh.physicsImpostor.setLinearVelocity(
      new BABYLON.Vector3(moveVector.x, currentVelocity.y, moveVector.z)
    )
  }

  /**
   * Jump
   */
  jump() {
    if (!this.characterMesh || !this.characterMesh.physicsImpostor) return
    
    const currentVelocity = this.characterMesh.physicsImpostor.getLinearVelocity()
    this.characterMesh.physicsImpostor.setLinearVelocity(
      currentVelocity.add(new BABYLON.Vector3(0, 8, 0))
    )
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