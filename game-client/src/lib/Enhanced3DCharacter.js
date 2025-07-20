import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

class Enhanced3DCharacter {
  constructor(scene, playerData) {
    this.scene = scene
    this.playerData = playerData
    
    // Character components
    this.characterGroup = null
    this.body = null
    this.elementalAura = null
    this.magicEffects = []
    this.animations = []
    
    // Animation mixer
    this.mixer = null
    this.currentAction = null
    this.actions = {}
    
    // Movement
    this.position = new THREE.Vector3(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.rotation = 0
    
    // Element system
    this.element = playerData.element || { id: 'fire', name: 'النار', color: '#FF4500' }
    
    // Loaders
    this.loader = new GLTFLoader()
    
    // Initialization flag
    this.isInitialized = false
    
    console.log('Enhanced3DCharacter: Initialized for element:', this.element.name)
  }

  async init() {
    if (this.isInitialized) {
      console.log('Enhanced3DCharacter: Already initialized, skipping...')
      return this.characterGroup
    }
    
    console.log('Enhanced3DCharacter: Creating character...')
    this.isInitialized = true
    
    // Create character group
    this.characterGroup = new THREE.Group()
    this.scene.add(this.characterGroup)
    
    // Create character body
    await this.createCharacterBody()
    
    // Add elemental aura
    await this.createElementalAura()
    
    // Setup animations
    await this.setupAnimations()
    
    // Add magical effects
    await this.addMagicalEffects()
    
    console.log('Enhanced3DCharacter: Character created successfully!')
    return this.characterGroup
  }

  async createCharacterBody() {
    // Try to load a character model, fallback to procedural if not available
    try {
      const characterModel = await this.loadCharacterModel()
      this.body = characterModel
    } catch (error) {
      console.log('Enhanced3DCharacter: Creating procedural character...')
      this.body = await this.createProceduralCharacter()
    }
    
    this.characterGroup.add(this.body)
    console.log('Enhanced3DCharacter: Character body created')
  }

  async loadCharacterModel() {
    // Try to load different character models based on element
    const modelPaths = {
      fire: '/assets/models/fire_mage.glb',
      water: '/assets/models/water_mage.glb',
      earth: '/assets/models/earth_mage.glb',
      air: '/assets/models/air_mage.glb'
    }
    
    const modelPath = modelPaths[this.element.id] || modelPaths.fire
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene
          model.scale.setScalar(1.5)
          
          // Setup animations if available
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(model)
            
            gltf.animations.forEach((clip) => {
              const action = this.mixer.clipAction(clip)
              this.actions[clip.name] = action
            })
            
            // Play idle animation
            if (this.actions.idle) {
              this.currentAction = this.actions.idle
              this.currentAction.play()
            }
          }
          
          resolve(model)
        },
        (progress) => {
          console.log('Enhanced3DCharacter: Loading progress:', progress)
        },
        (error) => {
          console.warn('Enhanced3DCharacter: Could not load model:', error)
          reject(error)
        }
      )
    })
  }

  async createProceduralCharacter() {
    const characterGroup = new THREE.Group()
    
    // Get element colors
    const elementColors = this.getElementColors()
    
    // Character body (main capsule)
    const bodyGeometry = new THREE.CapsuleGeometry(0.7, 1.8, 4, 8)
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: elementColors.primary,
      shininess: 30,
      transparent: true,
      opacity: 0.9
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 1.2
    body.castShadow = true
    characterGroup.add(body)
    
    // Character head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 12)
    const headMaterial = new THREE.MeshPhongMaterial({
      color: elementColors.secondary,
      shininess: 50
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 2.5
    head.castShadow = true
    characterGroup.add(head)
    
    // Eyes (glowing based on element)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 6)
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: elementColors.glow,
      emissive: elementColors.glow,
      emissiveIntensity: 0.5
    })
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.15, 2.6, 0.35)
    characterGroup.add(leftEye)
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.15, 2.6, 0.35)
    characterGroup.add(rightEye)
    
    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.2, 1.2, 4, 8)
    const armMaterial = new THREE.MeshPhongMaterial({
      color: elementColors.primary,
      transparent: true,
      opacity: 0.8
    })
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.set(-0.9, 1.8, 0)
    leftArm.rotation.z = Math.PI / 6
    leftArm.castShadow = true
    characterGroup.add(leftArm)
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.set(0.9, 1.8, 0)
    rightArm.rotation.z = -Math.PI / 6
    rightArm.castShadow = true
    characterGroup.add(rightArm)
    
    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.25, 1.0, 4, 8)
    const legMaterial = new THREE.MeshPhongMaterial({
      color: elementColors.primary,
      transparent: true,
      opacity: 0.8
    })
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.3, 0.4, 0)
    leftLeg.castShadow = true
    characterGroup.add(leftLeg)
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.3, 0.4, 0)
    rightLeg.castShadow = true
    characterGroup.add(rightLeg)
    
    // Elemental weapon/staff
    await this.addElementalWeapon(characterGroup)
    
    return characterGroup
  }

  async addElementalWeapon(characterGroup) {
    const weaponGroup = new THREE.Group()
    
    // Staff handle
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.08, 2.5, 8)
    const handleMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513,
      shininess: 20
    })
    const handle = new THREE.Mesh(handleGeometry, handleMaterial)
    handle.position.y = 1.25
    weaponGroup.add(handle)
    
    // Elemental crystal at top
    const crystalGeometry = new THREE.OctahedronGeometry(0.3)
    const elementColors = this.getElementColors()
    const crystalMaterial = new THREE.MeshPhongMaterial({
      color: elementColors.glow,
      transparent: true,
      opacity: 0.8,
      emissive: elementColors.glow,
      emissiveIntensity: 0.3
    })
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
    crystal.position.y = 2.7
    weaponGroup.add(crystal)
    
    // Floating runes around crystal
    for (let i = 0; i < 3; i++) {
      const runeGeometry = new THREE.RingGeometry(0.1, 0.15, 6)
      const runeMaterial = new THREE.MeshBasicMaterial({
        color: elementColors.glow,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      })
      const rune = new THREE.Mesh(runeGeometry, runeMaterial)
      
      const angle = (i / 3) * Math.PI * 2
      rune.position.set(
        Math.cos(angle) * 0.5,
        2.7 + Math.sin(angle * 2) * 0.2,
        Math.sin(angle) * 0.5
      )
      rune.rotation.y = angle
      
      weaponGroup.add(rune)
      
      // Animate runes
      rune.userData.animateRune = (time) => {
        rune.rotation.y += 0.02
        rune.position.y = 2.7 + Math.sin(time * 0.003 + i) * 0.2
      }
    }
    
    // Position weapon in character's hand
    weaponGroup.position.set(0.9, 0.5, 0)
    weaponGroup.rotation.z = Math.PI / 8
    characterGroup.add(weaponGroup)
    
    // Store weapon for animations
    this.weapon = weaponGroup
  }

  async createElementalAura() {
    const elementColors = this.getElementColors()
    
    // Main aura
    const auraGeometry = new THREE.SphereGeometry(2, 16, 12)
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: elementColors.glow,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    })
    this.elementalAura = new THREE.Mesh(auraGeometry, auraMaterial)
    this.elementalAura.position.y = 1.5
    this.characterGroup.add(this.elementalAura)
    
    // Elemental particles around character
    await this.createElementalParticles()
    
    console.log('Enhanced3DCharacter: Elemental aura created')
  }

  async createElementalParticles() {
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 50
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const elementColors = this.getElementColors()
    
    for (let i = 0; i < particleCount; i++) {
      // Position around character
      const radius = 1.5 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.random() * 4 + 0.5
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      
      // Color based on element
      const color = new THREE.Color(elementColors.glow)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
    
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    this.characterGroup.add(particles)
    
    // Store for animation
    this.elementalParticles = particles
  }

  async setupAnimations() {
    // If we don't have a model mixer, create simple procedural animations
    if (!this.mixer) {
      this.createProceduralAnimations()
    }
    
    console.log('Enhanced3DCharacter: Animations setup complete')
  }

  createProceduralAnimations() {
    // Store original positions for animation
    this.originalPositions = {}
    this.body.children.forEach((child, index) => {
      this.originalPositions[index] = {
        position: child.position.clone(),
        rotation: child.rotation.clone()
      }
    })
    
    // Animation states
    this.animationStates = {
      idle: { active: true, time: 0 },
      walking: { active: false, time: 0 },
      casting: { active: false, time: 0 },
      attacking: { active: false, time: 0 }
    }
  }

  async addMagicalEffects() {
    // Element-specific magical effects
    switch (this.element.id) {
      case 'fire':
        await this.addFireEffects()
        break
      case 'water':
        await this.addWaterEffects()
        break
      case 'earth':
        await this.addEarthEffects()
        break
      case 'air':
        await this.addAirEffects()
        break
    }
    
    console.log('Enhanced3DCharacter: Magical effects added')
  }

  async addFireEffects() {
    // Fire particles around hands
    for (let hand of ['left', 'right']) {
      const fireGeometry = new THREE.BufferGeometry()
      const fireCount = 20
      const positions = new Float32Array(fireCount * 3)
      
      for (let i = 0; i < fireCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.5
        positions[i * 3 + 1] = Math.random() * 0.8
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5
      }
      
      fireGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      
      const fireMaterial = new THREE.PointsMaterial({
        color: 0xFF4500,
        size: 0.08,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      })
      
      const fireParticles = new THREE.Points(fireGeometry, fireMaterial)
      fireParticles.position.set(hand === 'left' ? -0.9 : 0.9, 2.4, 0.3)
      this.characterGroup.add(fireParticles)
      this.magicEffects.push(fireParticles)
    }
  }

  async addWaterEffects() {
    // Water droplets around character
    const waterGeometry = new THREE.BufferGeometry()
    const dropCount = 30
    const positions = new Float32Array(dropCount * 3)
    
    for (let i = 0; i < dropCount; i++) {
      const radius = 1 + Math.random() * 1.5
      const angle = Math.random() * Math.PI * 2
      
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.random() * 3 + 0.5
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    
    waterGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const waterMaterial = new THREE.PointsMaterial({
      color: 0x1E90FF,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    })
    
    const waterParticles = new THREE.Points(waterGeometry, waterMaterial)
    this.characterGroup.add(waterParticles)
    this.magicEffects.push(waterParticles)
  }

  async addEarthEffects() {
    // Floating rocks around character
    for (let i = 0; i < 6; i++) {
      const rockGeometry = new THREE.DodecahedronGeometry(0.1 + Math.random() * 0.1)
      const rockMaterial = new THREE.MeshLambertMaterial({
        color: 0x8B4513,
        transparent: true,
        opacity: 0.8
      })
      
      const rock = new THREE.Mesh(rockGeometry, rockMaterial)
      const radius = 1.5 + Math.random() * 1
      const angle = (i / 6) * Math.PI * 2
      
      rock.position.set(
        Math.cos(angle) * radius,
        1 + Math.random() * 2,
        Math.sin(angle) * radius
      )
      
      this.characterGroup.add(rock)
      this.magicEffects.push(rock)
    }
  }

  async addAirEffects() {
    // Wind particles in spiral pattern
    const windGeometry = new THREE.BufferGeometry()
    const windCount = 40
    const positions = new Float32Array(windCount * 3)
    
    for (let i = 0; i < windCount; i++) {
      const t = i / windCount
      const radius = 1 + t * 2
      const height = t * 4
      const angle = t * Math.PI * 4
      
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    
    windGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const windMaterial = new THREE.PointsMaterial({
      color: 0x87CEEB,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    
    const windParticles = new THREE.Points(windGeometry, windMaterial)
    this.characterGroup.add(windParticles)
    this.magicEffects.push(windParticles)
  }

  getElementColors() {
    const colorSchemes = {
      fire: {
        primary: 0xFF4500,
        secondary: 0xFF6347,
        glow: 0xFF8C00
      },
      water: {
        primary: 0x1E90FF,
        secondary: 0x4169E1,
        glow: 0x00BFFF
      },
      earth: {
        primary: 0x8B4513,
        secondary: 0xA0522D,
        glow: 0xDEB887
      },
      air: {
        primary: 0x87CEEB,
        secondary: 0x98D8E8,
        glow: 0xE0F6FF
      }
    }
    
    return colorSchemes[this.element.id] || colorSchemes.fire
  }

  // Animation methods
  playAnimation(animationName, duration = 1000) {
    if (this.mixer && this.actions[animationName]) {
      // Model-based animation
      if (this.currentAction) {
        this.currentAction.fadeOut(0.3)
      }
      
      this.currentAction = this.actions[animationName]
      this.currentAction.reset().fadeIn(0.3).play()
    } else {
      // Procedural animation
      Object.keys(this.animationStates).forEach(key => {
        this.animationStates[key].active = key === animationName
        if (key === animationName) {
          this.animationStates[key].time = 0
        }
      })
    }
  }

  castSpell(spellType) {
    console.log(`Enhanced3DCharacter: Casting ${spellType} spell!`)
    
    // Play casting animation
    this.playAnimation('casting', 2000)
    
    // Create spell effect
    this.createSpellEffect(spellType)
  }

  createSpellEffect(spellType) {
    const elementColors = this.getElementColors()
    
    // Spell projectile
    const projectileGeometry = new THREE.SphereGeometry(0.3, 16, 12)
    const projectileMaterial = new THREE.MeshBasicMaterial({
      color: elementColors.glow,
      transparent: true,
      opacity: 0.8,
      emissive: elementColors.glow,
      emissiveIntensity: 0.5
    })
    
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial)
    projectile.position.copy(this.characterGroup.position)
    projectile.position.y += 2.5
    projectile.position.z += 1
    
    this.scene.add(projectile)
    
    // Animate projectile
    const startPos = projectile.position.clone()
    const endPos = startPos.clone()
    endPos.z += 20
    
    const duration = 2000
    const startTime = Date.now()
    
    const animateProjectile = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      projectile.position.lerpVectors(startPos, endPos, progress)
      projectile.rotation.x += 0.1
      projectile.rotation.y += 0.15
      
      if (progress < 1) {
        requestAnimationFrame(animateProjectile)
      } else {
        this.scene.remove(projectile)
        // Create impact effect
        this.createImpactEffect(endPos, spellType)
      }
    }
    
    animateProjectile()
  }

  createImpactEffect(position, spellType) {
    const elementColors = this.getElementColors()
    
    // Impact particles
    const impactGeometry = new THREE.BufferGeometry()
    const impactCount = 30
    const positions = new Float32Array(impactCount * 3)
    const velocities = new Float32Array(impactCount * 3)
    
    for (let i = 0; i < impactCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 2
      positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.2
      velocities[i * 3 + 1] = Math.random() * 0.3
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2
    }
    
    impactGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const impactMaterial = new THREE.PointsMaterial({
      color: elementColors.glow,
      size: 0.2,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    })
    
    const impactParticles = new THREE.Points(impactGeometry, impactMaterial)
    this.scene.add(impactParticles)
    
    // Animate impact
    const startTime = Date.now()
    const duration = 1500
    
    const animateImpact = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration
      
      if (progress < 1) {
        // Update particle positions
        const positions = impactParticles.geometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i] * 16.67 // 60fps
          positions[i + 1] += velocities[i + 1] * 16.67
          positions[i + 2] += velocities[i + 2] * 16.67
          
          // Gravity
          velocities[i + 1] -= 0.01
        }
        
        impactParticles.geometry.attributes.position.needsUpdate = true
        impactMaterial.opacity = 1 - progress
        
        requestAnimationFrame(animateImpact)
      } else {
        this.scene.remove(impactParticles)
      }
    }
    
    animateImpact()
  }

  update(deltaTime) {
    // Update mixer if available
    if (this.mixer) {
      this.mixer.update(deltaTime * 0.001)
    } else {
      // Update procedural animations
      this.updateProceduralAnimations(deltaTime)
    }
    
    // Update elemental aura
    if (this.elementalAura) {
      this.elementalAura.rotation.y += deltaTime * 0.001
      this.elementalAura.material.opacity = 0.1 + Math.sin(Date.now() * 0.003) * 0.05
    }
    
    // Update elemental particles
    if (this.elementalParticles) {
      this.elementalParticles.rotation.y += deltaTime * 0.0005
    }
    
    // Update magical effects
    this.magicEffects.forEach((effect, index) => {
      if (effect instanceof THREE.Points) {
        effect.rotation.y += deltaTime * 0.002
      } else if (effect instanceof THREE.Mesh) {
        // Floating animation for rocks
        effect.position.y += Math.sin(Date.now() * 0.002 + index) * 0.01
        effect.rotation.x += deltaTime * 0.001
        effect.rotation.z += deltaTime * 0.0015
      }
    })
    
    // Update weapon runes
    if (this.weapon) {
      this.weapon.children.forEach(child => {
        if (child.userData.animateRune) {
          child.userData.animateRune(Date.now())
        }
      })
    }
  }

  updateProceduralAnimations(deltaTime) {
    const time = Date.now() * 0.001
    
    // Idle animation
    if (this.animationStates.idle.active && this.body) {
      this.body.position.y = 1.2 + Math.sin(time * 2) * 0.05
      this.body.rotation.y = Math.sin(time * 0.5) * 0.1
    }
    
    // Walking animation
    if (this.animationStates.walking.active && this.body) {
      this.body.position.y = 1.2 + Math.sin(time * 8) * 0.1
      // Add leg movement animation here
    }
    
    // Casting animation
    if (this.animationStates.casting.active && this.body) {
      this.body.rotation.x = Math.sin(time * 4) * 0.2
      // Add arm movement for casting
    }
  }

  // Movement methods
  setPosition(x, y, z) {
    this.position.set(x, y, z)
    this.characterGroup.position.copy(this.position)
  }

  setRotation(rotation) {
    this.rotation = rotation
    this.characterGroup.rotation.y = rotation
  }

  moveForward(distance) {
    const direction = new THREE.Vector3(0, 0, distance)
    direction.applyQuaternion(this.characterGroup.quaternion)
    this.position.add(direction)
    this.characterGroup.position.copy(this.position)
    
    this.playAnimation('walking')
  }

  moveBackward(distance) {
    this.moveForward(-distance)
  }

  rotateLeft(angle) {
    this.rotation += angle
    this.characterGroup.rotation.y = this.rotation
  }

  rotateRight(angle) {
    this.rotateLeft(-angle)
  }

  // Cleanup
  dispose() {
    if (this.characterGroup) {
      this.scene.remove(this.characterGroup)
    }
    
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer = null
    }
    
    // Dispose of materials and geometries
    this.characterGroup?.traverse((child) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
    
    console.log('Enhanced3DCharacter: Disposed')
  }
}

export default Enhanced3DCharacter