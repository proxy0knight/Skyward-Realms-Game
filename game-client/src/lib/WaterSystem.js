import * as THREE from 'three'

class WaterSystem {
  constructor(scene, renderer) {
    this.scene = scene
    this.renderer = renderer
    this.waterBodies = []
    this.waterLevel = 0
    this.clock = new THREE.Clock()
    
    this.settings = {
      enabled: true,
      waterColor: 0x006994,
      waterOpacity: 0.7,
      waveAmplitude: 0.3,
      waveFrequency: 0.8,
      flowSpeed: 0.5,
      reflectionIntensity: 0.3
    }
    
    console.log('WaterSystem: Initialized')
  }

  /**
   * Create water bodies in the world
   */
  createWaterBodies() {
    console.log('WaterSystem: Creating water bodies...')
    
    // Create main lake
    this.createLake(20, 20, 0, 0)
    
    // Create river
    this.createRiver()
    
    // Create small ponds
    this.createPond(8, 8, 30, 30)
    this.createPond(6, 6, -40, 20)
    
    console.log(`✅ WaterSystem: Created ${this.waterBodies.length} water bodies`)
  }

  /**
   * Create a lake with realistic water
   */
  createLake(width, depth, x, z) {
    const geometry = new THREE.PlaneGeometry(width, depth, 32, 32)
    
    // Create water material with animation
    const material = new THREE.MeshPhongMaterial({
      color: this.settings.waterColor,
      transparent: true,
      opacity: this.settings.waterOpacity,
      shininess: 100,
      specular: 0x111111
    })
    
    // Add wave animation to vertices
    const positions = geometry.attributes.position.array
    const originalPositions = positions.slice()
    
    const water = new THREE.Mesh(geometry, material)
    water.rotation.x = -Math.PI / 2
    water.position.set(x, this.waterLevel, z)
    water.name = 'Lake'
    water.userData = {
      type: 'water',
      originalPositions: originalPositions,
      wavePhase: 0
    }
    
    this.scene.add(water)
    this.waterBodies.push(water)
    
    return water
  }

  /**
   * Create a flowing river
   */
  createRiver() {
    const riverPoints = [
      { x: -50, z: -30 },
      { x: -20, z: -10 },
      { x: 10, z: 5 },
      { x: 40, z: 15 },
      { x: 70, z: 25 }
    ]
    
    for (let i = 0; i < riverPoints.length - 1; i++) {
      const start = riverPoints[i]
      const end = riverPoints[i + 1]
      
      const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
      )
      
      const geometry = new THREE.PlaneGeometry(length, 4, 16, 8)
      const material = new THREE.MeshPhongMaterial({
        color: this.settings.waterColor,
        transparent: true,
        opacity: this.settings.waterOpacity * 0.9,
        shininess: 100
      })
      
      const riverSegment = new THREE.Mesh(geometry, material)
      riverSegment.rotation.x = -Math.PI / 2
      riverSegment.position.set(
        (start.x + end.x) / 2,
        this.waterLevel - 0.1,
        (start.z + end.z) / 2
      )
      
      // Rotate to align with river direction
      const angle = Math.atan2(end.z - start.z, end.x - start.x)
      riverSegment.rotation.z = angle
      
      riverSegment.name = `River_${i}`
      riverSegment.userData = {
        type: 'water',
        flowing: true,
        flowDirection: new THREE.Vector3(end.x - start.x, 0, end.z - start.z).normalize()
      }
      
      this.scene.add(riverSegment)
      this.waterBodies.push(riverSegment)
    }
  }

  /**
   * Create a small pond
   */
  createPond(width, depth, x, z) {
    const geometry = new THREE.CircleGeometry(Math.min(width, depth) / 2, 16)
    const material = new THREE.MeshPhongMaterial({
      color: this.settings.waterColor,
      transparent: true,
      opacity: this.settings.waterOpacity,
      shininess: 80
    })
    
    const pond = new THREE.Mesh(geometry, material)
    pond.rotation.x = -Math.PI / 2
    pond.position.set(x, this.waterLevel, z)
    pond.name = 'Pond'
    pond.userData = { type: 'water' }
    
    this.scene.add(pond)
    this.waterBodies.push(pond)
    
    return pond
  }

  /**
   * Check if a position is in water
   */
  isInWater(position) {
    if (position.y > this.waterLevel + 0.5) return false
    
    for (const water of this.waterBodies) {
      if (this.isPositionInWaterBody(position, water)) {
        return {
          inWater: true,
          waterBody: water,
          depth: this.waterLevel - position.y,
          flowDirection: water.userData.flowDirection || new THREE.Vector3(0, 0, 0)
        }
      }
    }
    
    return { inWater: false }
  }

  /**
   * Check if position is within a specific water body
   */
  isPositionInWaterBody(position, waterBody) {
    const waterPos = waterBody.position
    const geometry = waterBody.geometry
    
    if (waterBody.name.includes('Lake') || waterBody.name.includes('Pond')) {
      const distance = Math.sqrt(
        Math.pow(position.x - waterPos.x, 2) + 
        Math.pow(position.z - waterPos.z, 2)
      )
      
      if (waterBody.name.includes('Pond')) {
        return distance <= geometry.parameters.radius
      } else {
        return distance <= Math.max(geometry.parameters.width, geometry.parameters.height) / 2
      }
    }
    
    if (waterBody.name.includes('River')) {
      // Simple bounding box check for river segments
      const bbox = new THREE.Box3().setFromObject(waterBody)
      return bbox.containsPoint(new THREE.Vector3(position.x, this.waterLevel, position.z))
    }
    
    return false
  }

  /**
   * Apply water effects to objects
   */
  applyWaterEffects(object, waterInteraction) {
    if (!waterInteraction.inWater) return
    
    const { waterBody, depth, flowDirection } = waterInteraction
    
    // Buoyancy effect
    if (object.velocity) {
      object.velocity.y += 0.02 * Math.min(depth, 2) // Buoyancy force
      
      // Flow effect for rivers
      if (waterBody.userData.flowing) {
        object.velocity.add(flowDirection.clone().multiplyScalar(0.005))
      }
      
      // Water resistance
      object.velocity.multiplyScalar(0.95)
    }
    
    // Water splash effects (visual)
    if (depth > 0.1) {
      this.createSplashEffect(object.position.clone())
    }
  }

  /**
   * Create splash particle effect
   */
  createSplashEffect(position) {
    const particleCount = 8
    const particles = new THREE.Group()
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 4, 4)
      const material = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.8
      })
      
      const particle = new THREE.Mesh(geometry, material)
      particle.position.copy(position)
      particle.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1,
        (Math.random() - 0.5) * 2
      ))
      
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          Math.random() * 0.15,
          (Math.random() - 0.5) * 0.1
        ),
        life: 1.0
      }
      
      particles.add(particle)
    }
    
    this.scene.add(particles)
    
    // Animate and remove particles
    const animateParticles = () => {
      let aliveCount = 0
      
      particles.children.forEach(particle => {
        if (particle.userData.life > 0) {
          particle.position.add(particle.userData.velocity)
          particle.userData.velocity.y -= 0.01 // Gravity
          particle.userData.life -= 0.02
          particle.material.opacity = particle.userData.life
          aliveCount++
        }
      })
      
      if (aliveCount > 0) {
        requestAnimationFrame(animateParticles)
      } else {
        this.scene.remove(particles)
      }
    }
    
    animateParticles()
  }

  /**
   * Update water animation and effects
   */
  update(deltaTime) {
    if (!this.settings.enabled) return
    
    const time = this.clock.getElapsedTime()
    
    // Animate water waves
    this.waterBodies.forEach(water => {
      if (water.userData.originalPositions) {
        const positions = water.geometry.attributes.position.array
        const originalPositions = water.userData.originalPositions
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = originalPositions[i]
          const z = originalPositions[i + 2]
          
          // Create wave animation
          positions[i + 1] = originalPositions[i + 1] + 
            Math.sin(x * this.settings.waveFrequency + time) * this.settings.waveAmplitude +
            Math.cos(z * this.settings.waveFrequency * 0.7 + time * 1.3) * this.settings.waveAmplitude * 0.5
        }
        
        water.geometry.attributes.position.needsUpdate = true
        water.geometry.computeVertexNormals()
      }
      
      // Animate water color for dynamic effect
      if (water.material) {
        const colorShift = Math.sin(time * 0.5) * 0.1
        water.material.color.setHex(this.settings.waterColor + Math.floor(colorShift * 0x111111))
      }
    })
  }

  /**
   * Get water level at specific position
   */
  getWaterLevelAt(x, z) {
    for (const water of this.waterBodies) {
      if (this.isPositionInWaterBody({ x, y: this.waterLevel, z }, water)) {
        return this.waterLevel
      }
    }
    return null
  }

  /**
   * Enable/disable water system
   */
  setEnabled(enabled) {
    this.settings.enabled = enabled
    this.waterBodies.forEach(water => {
      water.visible = enabled
    })
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.waterBodies.forEach(water => {
      this.scene.remove(water)
      water.geometry.dispose()
      water.material.dispose()
    })
    this.waterBodies = []
  }
}

export default WaterSystem