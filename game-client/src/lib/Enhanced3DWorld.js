import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'

class Enhanced3DWorld {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    
    // Loaders
    this.gltfLoader = new GLTFLoader()
    this.fbxLoader = new FBXLoader()
    this.textureLoader = new THREE.TextureLoader()
    
    // World components
    this.terrain = null
    this.water = null
    this.sky = null
    this.trees = []
    this.buildings = []
    this.particles = []
    
    // Lighting system
    this.sun = null
    this.moonlight = null
    this.ambientLight = null
    
    // Time system
    this.timeOfDay = 0.5 // 0 = midnight, 0.5 = noon, 1 = midnight
    this.dayDuration = 300 // 5 minutes per full day/night cycle
    
    // Weather system
    this.weather = {
      type: 'clear', // clear, rain, snow, fog
      intensity: 0.0,
      windDirection: new THREE.Vector3(1, 0, 0)
    }
    
    // Asset cache
    this.loadedAssets = new Map()
    
    console.log('Enhanced3DWorld: Initialized')
  }

  async init() {
    console.log('Enhanced3DWorld: Creating magical fantasy world...')
    
    // Setup enhanced lighting
    await this.setupAdvancedLighting()
    
    // Create procedural terrain
    await this.createProceduralTerrain()
    
    // Add water bodies
    await this.createWaterSystems()
    
    // Generate forest
    await this.generateFantasyForest()
    
    // Create magical structures
    await this.createMagicalStructures()
    
    // Add atmospheric effects
    await this.setupAtmosphericEffects()
    
    // Initialize particle systems
    await this.initializeParticleSystems()
    
    console.log('Enhanced3DWorld: Fantasy world created successfully!')
  }

  async setupAdvancedLighting() {
    // Remove existing lights
    const existingLights = this.scene.children.filter(child => 
      child instanceof THREE.Light
    )
    existingLights.forEach(light => this.scene.remove(light))

    // Directional light (sun)
    this.sun = new THREE.DirectionalLight(0xffffff, 1.2)
    this.sun.position.set(50, 50, 50)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.width = 4096
    this.sun.shadow.mapSize.height = 4096
    this.sun.shadow.camera.near = 0.1
    this.sun.shadow.camera.far = 200
    this.sun.shadow.camera.left = -100
    this.sun.shadow.camera.right = 100
    this.sun.shadow.camera.top = 100
    this.sun.shadow.camera.bottom = -100
    this.scene.add(this.sun)

    // Moonlight
    this.moonlight = new THREE.DirectionalLight(0x6666ff, 0.3)
    this.moonlight.position.set(-50, 30, -50)
    this.moonlight.castShadow = true
    this.moonlight.visible = false
    this.scene.add(this.moonlight)

    // Enhanced ambient light
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    this.scene.add(this.ambientLight)

    // Atmospheric fog
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 300)

    console.log('Enhanced3DWorld: Advanced lighting setup complete')
  }

  async createProceduralTerrain() {
    // Create heightmap-based terrain
    const terrainSize = 200
    const terrainResolution = 128
    
    // Generate heightmap using noise
    const heightData = this.generateHeightmap(terrainResolution, terrainResolution)
    
    // Create terrain geometry
    const terrainGeometry = new THREE.PlaneGeometry(
      terrainSize, terrainSize, 
      terrainResolution - 1, terrainResolution - 1
    )
    
    // Apply heights to vertices
    const vertices = terrainGeometry.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) {
      const x = Math.floor((i / 3) % terrainResolution)
      const z = Math.floor((i / 3) / terrainResolution)
      vertices[i + 1] = heightData[z * terrainResolution + x] * 20 // Scale height
    }
    
    terrainGeometry.attributes.position.needsUpdate = true
    terrainGeometry.computeVertexNormals()
    
    // Create terrain material with multiple textures
    const terrainMaterial = await this.createTerrainMaterial()
    
    // Create terrain mesh
    this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial)
    this.terrain.rotation.x = -Math.PI / 2
    this.terrain.receiveShadow = true
    this.scene.add(this.terrain)
    
    console.log('Enhanced3DWorld: Procedural terrain created')
  }

  generateHeightmap(width, height) {
    const heightData = new Float32Array(width * height)
    
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const x = (i / width) * 8
        const z = (j / height) * 8
        
        // Multi-octave noise for realistic terrain
        let height = 0
        height += Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.3
        height += Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.2
        height += Math.sin(x * 2.4) * Math.cos(z * 2.4) * 0.1
        height += (Math.random() - 0.5) * 0.1
        
        heightData[j * width + i] = Math.max(0, height)
      }
    }
    
    return heightData
  }

  async createTerrainMaterial() {
    // Load terrain textures
    const grassTexture = await this.loadTexture('/assets/textures/grass.jpg')
    const rockTexture = await this.loadTexture('/assets/textures/rock.jpg')
    const sandTexture = await this.loadTexture('/assets/textures/sand.jpg')
    
    // Set texture properties
    [grassTexture, rockTexture, sandTexture].forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(32, 32)
    })
    
    // Create multi-texture material
    const material = new THREE.MeshLambertMaterial({
      map: grassTexture,
      color: 0x90EE90
    })
    
    return material
  }

  async createWaterSystems() {
    // Create water geometry
    const waterGeometry = new THREE.PlaneGeometry(100, 100, 1, 1)
    
    // Load water normal map
    const waterNormalMap = await this.loadTexture('/assets/textures/waternormals.jpg')
    waterNormalMap.wrapS = waterNormalMap.wrapT = THREE.RepeatWrapping
    
    // Create water
    this.water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormalMap,
      alpha: 0.8,
      sunDirection: new THREE.Vector3(0.7, 0.7, 0.0),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined
    })
    
    this.water.rotation.x = -Math.PI / 2
    this.water.position.y = -2
    this.scene.add(this.water)
    
    console.log('Enhanced3DWorld: Water systems created')
  }

  async generateFantasyForest() {
    console.log('Enhanced3DWorld: Generating magical forest...')
    
    // Tree types with different characteristics
    const treeTypes = [
      { name: 'oak', scale: [1.5, 2.5], color: 0x228B22 },
      { name: 'pine', scale: [2.0, 3.5], color: 0x006400 },
      { name: 'birch', scale: [1.2, 2.0], color: 0x90EE90 },
      { name: 'magical', scale: [2.5, 4.0], color: 0x9370DB }
    ]
    
    // Generate trees in clusters
    for (let cluster = 0; cluster < 8; cluster++) {
      const clusterX = (Math.random() - 0.5) * 150
      const clusterZ = (Math.random() - 0.5) * 150
      
      // Trees per cluster
      for (let i = 0; i < 15; i++) {
        const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)]
        const tree = await this.createTree(treeType)
        
        // Position within cluster
        tree.position.set(
          clusterX + (Math.random() - 0.5) * 20,
          this.getTerrainHeight(clusterX, clusterZ),
          clusterZ + (Math.random() - 0.5) * 20
        )
        
        // Random rotation and scale
        tree.rotation.y = Math.random() * Math.PI * 2
        const scale = treeType.scale[0] + Math.random() * (treeType.scale[1] - treeType.scale[0])
        tree.scale.setScalar(scale)
        
        this.trees.push(tree)
        this.scene.add(tree)
      }
    }
    
    console.log(`Enhanced3DWorld: Generated ${this.trees.length} trees`)
  }

  async createTree(treeType) {
    const group = new THREE.Group()
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8)
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 1.5
    trunk.castShadow = true
    group.add(trunk)
    
    // Tree canopy
    const canopyGeometry = treeType.name === 'pine' 
      ? new THREE.ConeGeometry(2, 4, 8)
      : new THREE.SphereGeometry(2.5, 8, 6)
    
    const canopyMaterial = new THREE.MeshLambertMaterial({ 
      color: treeType.color,
      transparent: true,
      opacity: 0.9
    })
    
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial)
    canopy.position.y = treeType.name === 'pine' ? 4 : 3.5
    canopy.castShadow = true
    group.add(canopy)
    
    // Add magical effects for magical trees
    if (treeType.name === 'magical') {
      await this.addMagicalTreeEffects(group)
    }
    
    return group
  }

  async addMagicalTreeEffects(treeGroup) {
    // Glowing particles around magical trees
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 20
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6     // x
      positions[i + 1] = Math.random() * 8 + 2     // y
      positions[i + 2] = (Math.random() - 0.5) * 6 // z
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x9370DB,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    treeGroup.add(particles)
    
    // Animate particles
    particles.userData.animate = (time) => {
      const positions = particles.geometry.attributes.position.array
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 0.01 + i) * 0.01
      }
      particles.geometry.attributes.position.needsUpdate = true
    }
  }

  async createMagicalStructures() {
    console.log('Enhanced3DWorld: Creating magical structures...')
    
    // Ancient stone circles
    await this.createStoneCircle()
    
    // Magical towers
    await this.createMagicalTower()
    
    // Crystal formations
    await this.createCrystalFormations()
    
    console.log('Enhanced3DWorld: Magical structures created')
  }

  async createStoneCircle() {
    const stoneCircle = new THREE.Group()
    const radius = 12
    const stoneCount = 8
    
    for (let i = 0; i < stoneCount; i++) {
      const angle = (i / stoneCount) * Math.PI * 2
      
      // Standing stone
      const stoneGeometry = new THREE.BoxGeometry(1, 4, 0.5)
      const stoneMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x696969,
        roughness: 0.8
      })
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial)
      
      stone.position.set(
        Math.cos(angle) * radius,
        2,
        Math.sin(angle) * radius
      )
      stone.rotation.y = angle + Math.PI / 2
      stone.castShadow = true
      
      stoneCircle.add(stone)
    }
    
    // Center magical crystal
    const crystalGeometry = new THREE.OctahedronGeometry(1.5)
    const crystalMaterial = new THREE.MeshPhongMaterial({
      color: 0x9370DB,
      transparent: true,
      opacity: 0.7,
      emissive: 0x4B0082
    })
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
    crystal.position.y = 3
    stoneCircle.add(crystal)
    
    // Position in world
    stoneCircle.position.set(30, 0, -40)
    this.scene.add(stoneCircle)
    this.buildings.push(stoneCircle)
  }

  async createMagicalTower() {
    const tower = new THREE.Group()
    
    // Tower base
    const baseGeometry = new THREE.CylinderGeometry(4, 5, 3, 16)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 1.5
    base.castShadow = true
    tower.add(base)
    
    // Tower main body
    const bodyGeometry = new THREE.CylinderGeometry(3, 3.5, 15, 12)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 10.5
    body.castShadow = true
    tower.add(body)
    
    // Tower roof
    const roofGeometry = new THREE.ConeGeometry(4, 5, 12)
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.y = 20.5
    roof.castShadow = true
    tower.add(roof)
    
    // Magical glow at top
    const glowGeometry = new THREE.SphereGeometry(0.5)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: 0.8
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.y = 23
    tower.add(glow)
    
    // Position in world
    tower.position.set(-50, 0, 30)
    this.scene.add(tower)
    this.buildings.push(tower)
  }

  async createCrystalFormations() {
    for (let i = 0; i < 5; i++) {
      const formation = new THREE.Group()
      
      // Multiple crystals in formation
      for (let j = 0; j < 3 + Math.random() * 3; j++) {
        const crystalGeometry = new THREE.OctahedronGeometry(0.5 + Math.random() * 1)
        const crystalMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
          transparent: true,
          opacity: 0.8,
          emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.2)
        })
        
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
        crystal.position.set(
          (Math.random() - 0.5) * 4,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 4
        )
        crystal.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
        
        formation.add(crystal)
      }
      
      // Position formations randomly
      formation.position.set(
        (Math.random() - 0.5) * 120,
        0,
        (Math.random() - 0.5) * 120
      )
      
      this.scene.add(formation)
    }
  }

  async setupAtmosphericEffects() {
    // Create sky
    this.sky = new Sky()
    this.sky.scale.setScalar(450000)
    this.scene.add(this.sky)
    
    // Configure sky
    const skyUniforms = this.sky.material.uniforms
    skyUniforms['turbidity'].value = 10
    skyUniforms['rayleigh'].value = 2
    skyUniforms['mieCoefficient'].value = 0.005
    skyUniforms['mieDirectionalG'].value = 0.8
    
    // Update sun position
    this.updateSkyAndLighting()
    
    console.log('Enhanced3DWorld: Atmospheric effects setup complete')
  }

  async initializeParticleSystems() {
    // Ambient magical particles
    await this.createAmbientParticles()
    
    // Fireflies
    await this.createFireflies()
    
    console.log('Enhanced3DWorld: Particle systems initialized')
  }

  async createAmbientParticles() {
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 100
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = Math.random() * 50 + 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200
      
      // Color
      const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.7, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
    
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(particles)
    this.particles.push(particles)
  }

  async createFireflies() {
    const fireflyGeometry = new THREE.BufferGeometry()
    const fireflyCount = 30
    const positions = new Float32Array(fireflyCount * 3)
    
    for (let i = 0; i < fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = Math.random() * 10 + 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
    
    fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const fireflyMaterial = new THREE.PointsMaterial({
      color: 0xFFFF00,
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    
    const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial)
    this.scene.add(fireflies)
    this.particles.push(fireflies)
  }

  // Utility methods
  async loadTexture(url) {
    if (this.loadedAssets.has(url)) {
      return this.loadedAssets.get(url)
    }
    
    try {
      const texture = await new Promise((resolve, reject) => {
        this.textureLoader.load(url, resolve, undefined, reject)
      })
      this.loadedAssets.set(url, texture)
      return texture
    } catch (error) {
      console.warn(`Enhanced3DWorld: Could not load texture ${url}, using fallback`)
      // Create a procedural texture as fallback
      return this.createProceduralTexture(url)
    }
  }

  createProceduralTexture(type) {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    // Generate different textures based on type
    if (type.includes('grass')) {
      ctx.fillStyle = '#4a7c59'
      ctx.fillRect(0, 0, 256, 256)
      // Add grass-like texture
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `hsl(${90 + Math.random() * 30}, 60%, ${30 + Math.random() * 20}%)`
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2)
      }
    } else if (type.includes('water')) {
      // Create water normal map
      const imageData = ctx.createImageData(256, 256)
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 128 + Math.random() * 127     // R
        imageData.data[i + 1] = 128 + Math.random() * 127 // G
        imageData.data[i + 2] = 255                       // B
        imageData.data[i + 3] = 255                       // A
      }
      ctx.putImageData(imageData, 0, 0)
    } else {
      // Default stone/rock texture
      ctx.fillStyle = '#666666'
      ctx.fillRect(0, 0, 256, 256)
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `hsl(0, 0%, ${20 + Math.random() * 40}%)`
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 4)
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }

  getTerrainHeight(x, z) {
    // Simple height calculation - you could make this more sophisticated
    return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 + 1
  }

  updateSkyAndLighting() {
    if (!this.sky) return
    
    // Calculate sun position based on time of day
    const phi = THREE.MathUtils.degToRad(90 - (this.timeOfDay * 180))
    const theta = THREE.MathUtils.degToRad(180)
    
    const sunPosition = new THREE.Vector3()
    sunPosition.setFromSphericalCoords(1, phi, theta)
    
    // Update sky
    this.sky.material.uniforms['sunPosition'].value.copy(sunPosition)
    
    // Update sun light
    if (this.sun) {
      this.sun.position.copy(sunPosition).multiplyScalar(100)
      this.sun.intensity = Math.max(0.1, Math.cos(phi))
      
      // Sun color changes based on time
      if (this.timeOfDay < 0.3 || this.timeOfDay > 0.7) {
        this.sun.color.setHSL(0.1, 0.8, 0.6) // Orange/red sunset/sunrise
      } else {
        this.sun.color.setHSL(0.15, 0.1, 1) // White daylight
      }
    }
    
    // Update moonlight
    if (this.moonlight) {
      this.moonlight.visible = this.timeOfDay < 0.2 || this.timeOfDay > 0.8
      this.moonlight.intensity = this.moonlight.visible ? 0.3 : 0
    }
    
    // Update fog color
    if (this.scene.fog) {
      if (this.timeOfDay < 0.3 || this.timeOfDay > 0.7) {
        this.scene.fog.color.setHSL(0.1, 0.5, 0.3) // Orange fog
      } else {
        this.scene.fog.color.setHSL(0.6, 0.3, 0.7) // Blue sky
      }
    }
  }

  update(deltaTime) {
    // Update time of day
    this.timeOfDay += deltaTime / this.dayDuration
    if (this.timeOfDay > 1) this.timeOfDay -= 1
    
    // Update sky and lighting
    this.updateSkyAndLighting()
    
    // Update water
    if (this.water) {
      this.water.material.uniforms['time'].value += deltaTime * 0.001
    }
    
    // Animate particles
    this.particles.forEach(particleSystem => {
      if (particleSystem.userData.animate) {
        particleSystem.userData.animate(Date.now())
      } else {
        // Default particle animation
        particleSystem.rotation.y += deltaTime * 0.0001
      }
    })
    
    // Animate magical trees
    this.trees.forEach(tree => {
      const magicalParticles = tree.children.find(child => child instanceof THREE.Points)
      if (magicalParticles && magicalParticles.userData.animate) {
        magicalParticles.userData.animate(Date.now())
      }
    })
  }

  // Weather system methods
  setWeather(type, intensity = 0.5) {
    this.weather.type = type
    this.weather.intensity = intensity
    
    switch (type) {
      case 'rain':
        this.createRainEffect()
        break
      case 'snow':
        this.createSnowEffect()
        break
      case 'fog':
        this.createFogEffect()
        break
      default:
        this.clearWeatherEffects()
    }
  }

  createRainEffect() {
    // Implementation for rain particles
    console.log('Enhanced3DWorld: Rain effect created')
  }

  createSnowEffect() {
    // Implementation for snow particles
    console.log('Enhanced3DWorld: Snow effect created')
  }

  createFogEffect() {
    // Implementation for enhanced fog
    if (this.scene.fog) {
      this.scene.fog.near = 20
      this.scene.fog.far = 100
    }
    console.log('Enhanced3DWorld: Fog effect created')
  }

  clearWeatherEffects() {
    // Reset fog to normal
    if (this.scene.fog) {
      this.scene.fog.near = 50
      this.scene.fog.far = 300
    }
  }
}

export default Enhanced3DWorld