import * as THREE from 'three'

export class Model3D {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.models = new Map()
    this.textures = new Map()
    this.materials = new Map()
    
    this.initializeModels()
  }

  // Initialize 3D models
  initializeModels() {
    // Environmental models
    this.environmentModels = {
      // Trees
      tree_pine: {
        create: () => this.createPineTree(),
        scale: 1.0,
        collidable: true
      },
      tree_oak: {
        create: () => this.createOakTree(),
        scale: 1.2,
        collidable: true
      },
      tree_magic: {
        create: () => this.createMagicTree(),
        scale: 1.5,
        collidable: true
      },

      // Rocks and crystals
      rock_large: {
        create: () => this.createLargeRock(),
        scale: 1.0,
        collidable: true
      },
      crystal_blue: {
        create: () => this.createBlueCrystal(),
        scale: 0.8,
        collidable: false
      },
      crystal_red: {
        create: () => this.createRedCrystal(),
        scale: 0.8,
        collidable: false
      },

      // Buildings
      hut_small: {
        create: () => this.createSmallHut(),
        scale: 1.0,
        collidable: true
      },
      tower_magic: {
        create: () => this.createMagicTower(),
        scale: 1.5,
        collidable: true
      },
      portal_elemental: {
        create: () => this.createElementalPortal(),
        scale: 1.0,
        collidable: false
      },

      // Props
      campfire: {
        create: () => this.createCampfire(),
        scale: 0.8,
        collidable: false
      },
      fountain_healing: {
        create: () => this.createHealingFountain(),
        scale: 1.0,
        collidable: false
      },
      altar_elemental: {
        create: () => this.createElementalAltar(),
        scale: 1.2,
        collidable: false
      }
    }
  }

  // Create pine tree
  createPineTree() {
    const tree = new THREE.Group()

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8)
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 2
    trunk.castShadow = true
    trunk.receiveShadow = true
    tree.add(trunk)

    // Pine needles (cones)
    for (let i = 0; i < 3; i++) {
      const coneGeometry = new THREE.ConeGeometry(1.5 - i * 0.3, 2, 8)
      const coneMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 })
      const cone = new THREE.Mesh(coneGeometry, coneMaterial)
      cone.position.y = 4 + i * 1.5
      cone.castShadow = true
      cone.receiveShadow = true
      tree.add(cone)
    }

    return tree
  }

  // Create oak tree
  createOakTree() {
    const tree = new THREE.Group()

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, 5, 8)
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 2.5
    trunk.castShadow = true
    trunk.receiveShadow = true
    tree.add(trunk)

    // Foliage (sphere)
    const foliageGeometry = new THREE.SphereGeometry(2, 8, 8)
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 })
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial)
    foliage.position.y = 5
    foliage.castShadow = true
    foliage.receiveShadow = true
    tree.add(foliage)

    return tree
  }

  // Create magic tree
  createMagicTree() {
    const tree = new THREE.Group()

    // Trunk with magical glow
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 6, 8)
    const trunkMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4b0082,
      emissive: 0x2a0040,
      emissiveIntensity: 0.3
    })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 3
    trunk.castShadow = true
    trunk.receiveShadow = true
    tree.add(trunk)

    // Magical leaves (multiple spheres)
    for (let i = 0; i < 4; i++) {
      const leafGeometry = new THREE.SphereGeometry(1.5 - i * 0.2, 8, 8)
      const leafMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x00ff00,
        emissive: 0x004000,
        emissiveIntensity: 0.5
      })
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial)
      leaf.position.y = 5 + i * 1.2
      leaf.castShadow = true
      leaf.receiveShadow = true
      
      // Add animation
      leaf.userData = {
        update: (deltaTime) => {
          leaf.rotation.y += deltaTime * 0.5
          leaf.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.1)
        }
      }
      
      tree.add(leaf)
    }

    return tree
  }

  // Create large rock
  createLargeRock() {
    const rockGeometry = new THREE.DodecahedronGeometry(1.5, 0)
    const rockMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x696969,
      roughness: 0.8
    })
    const rock = new THREE.Mesh(rockGeometry, rockMaterial)
    rock.position.y = 1.5
    rock.castShadow = true
    rock.receiveShadow = true
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    
    return rock
  }

  // Create blue crystal
  createBlueCrystal() {
    const crystal = new THREE.Group()

    // Main crystal
    const crystalGeometry = new THREE.OctahedronGeometry(1, 0)
    const crystalMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x00bfff,
      transparent: true,
      opacity: 0.8,
      emissive: 0x004080,
      emissiveIntensity: 0.3
    })
    const mainCrystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
    mainCrystal.position.y = 1.5
    mainCrystal.castShadow = true
    crystal.add(mainCrystal)

    // Crystal base
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.5, 8)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x4169e1 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.25
    base.castShadow = true
    crystal.add(base)

    // Add floating animation
    mainCrystal.userData = {
      update: (deltaTime) => {
        mainCrystal.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.2
        mainCrystal.rotation.y += deltaTime * 0.3
      }
    }

    return crystal
  }

  // Create red crystal
  createRedCrystal() {
    const crystal = new THREE.Group()

    // Main crystal
    const crystalGeometry = new THREE.OctahedronGeometry(1, 0)
    const crystalMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xff4500,
      transparent: true,
      opacity: 0.8,
      emissive: 0x800000,
      emissiveIntensity: 0.4
    })
    const mainCrystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
    mainCrystal.position.y = 1.5
    mainCrystal.castShadow = true
    crystal.add(mainCrystal)

    // Crystal base
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.5, 8)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.25
    base.castShadow = true
    crystal.add(base)

    // Add pulsing animation
    mainCrystal.userData = {
      update: (deltaTime) => {
        mainCrystal.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.15
        mainCrystal.rotation.y += deltaTime * 0.4
        mainCrystal.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1)
      }
    }

    return crystal
  }

  // Create small hut
  createSmallHut() {
    const hut = new THREE.Group()

    // Base
    const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.25
    base.castShadow = true
    base.receiveShadow = true
    hut.add(base)

    // Walls
    const wallGeometry = new THREE.CylinderGeometry(2, 2, 3, 8)
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xd2691e })
    const walls = new THREE.Mesh(wallGeometry, wallMaterial)
    walls.position.y = 2
    walls.castShadow = true
    walls.receiveShadow = true
    hut.add(walls)

    // Roof (cone)
    const roofGeometry = new THREE.ConeGeometry(2.5, 2, 8)
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.y = 4.5
    roof.castShadow = true
    roof.receiveShadow = true
    hut.add(roof)

    // Door
    const doorGeometry = new THREE.BoxGeometry(0.8, 2, 0.1)
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    const door = new THREE.Mesh(doorGeometry, doorMaterial)
    door.position.set(0, 1, 2)
    hut.add(door)

    return hut
  }

  // Create magic tower
  createMagicTower() {
    const tower = new THREE.Group()

    // Base
    const baseGeometry = new THREE.CylinderGeometry(3, 3, 1, 8)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.5
    base.castShadow = true
    base.receiveShadow = true
    tower.add(base)

    // Main tower
    const towerGeometry = new THREE.CylinderGeometry(2, 2.5, 8, 8)
    const towerMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4b0082,
      emissive: 0x2a0040,
      emissiveIntensity: 0.2
    })
    const mainTower = new THREE.Mesh(towerGeometry, towerMaterial)
    mainTower.position.y = 5
    mainTower.castShadow = true
    mainTower.receiveShadow = true
    tower.add(mainTower)

    // Top spire
    const spireGeometry = new THREE.ConeGeometry(1, 3, 8)
    const spireMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffd700,
      emissive: 0x806000,
      emissiveIntensity: 0.5
    })
    const spire = new THREE.Mesh(spireGeometry, spireMaterial)
    spire.position.y = 10
    spire.castShadow = true
    tower.add(spire)

    // Magical orb at top
    const orbGeometry = new THREE.SphereGeometry(0.5, 8, 8)
    const orbMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x00ffff,
      emissive: 0x004040,
      emissiveIntensity: 0.8
    })
    const orb = new THREE.Mesh(orbGeometry, orbMaterial)
    orb.position.y = 11.5
    tower.add(orb)

    // Add floating animation to orb
    orb.userData = {
      update: (deltaTime) => {
        orb.position.y = 11.5 + Math.sin(Date.now() * 0.002) * 0.3
        orb.rotation.y += deltaTime * 0.5
        orb.scale.setScalar(1 + Math.sin(Date.now() * 0.004) * 0.2)
      }
    }

    return tower
  }

  // Create elemental portal
  createElementalPortal() {
    const portal = new THREE.Group()

    // Portal ring
    const ringGeometry = new THREE.TorusGeometry(2, 0.3, 8, 16)
    const ringMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x00ffff,
      emissive: 0x004040,
      emissiveIntensity: 0.6
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.position.y = 2
    ring.castShadow = true
    portal.add(ring)

    // Portal energy
    const energyGeometry = new THREE.CircleGeometry(1.8, 16)
    const energyMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4
    })
    const energy = new THREE.Mesh(energyGeometry, energyMaterial)
    energy.position.y = 2.01
    portal.add(energy)

    // Add rotation animation
    ring.userData = {
      update: (deltaTime) => {
        ring.rotation.z += deltaTime * 0.5
        energy.rotation.z -= deltaTime * 0.3
      }
    }

    return portal
  }

  // Create campfire
  createCampfire() {
    const campfire = new THREE.Group()

    // Fire base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.8, 0.3, 8)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.15
    base.castShadow = true
    base.receiveShadow = true
    campfire.add(base)

    // Fire logs
    for (let i = 0; i < 3; i++) {
      const logGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8)
      const logMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      const log = new THREE.Mesh(logGeometry, logMaterial)
      log.position.set(
        (Math.random() - 0.5) * 0.3,
        0.5,
        (Math.random() - 0.5) * 0.3
      )
      log.rotation.x = Math.random() * Math.PI
      log.rotation.z = Math.random() * Math.PI
      log.castShadow = true
      campfire.add(log)
    }

    // Fire effect
    const fireGeometry = new THREE.ConeGeometry(0.4, 1.5, 8)
    const fireMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff4500,
      transparent: true,
      opacity: 0.8
    })
    const fire = new THREE.Mesh(fireGeometry, fireMaterial)
    fire.position.y = 1.25
    campfire.add(fire)

    // Add fire animation
    fire.userData = {
      update: (deltaTime) => {
        fire.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.3
        fire.rotation.y += deltaTime * 0.2
        fire.material.opacity = 0.6 + Math.sin(Date.now() * 0.02) * 0.2
      }
    }

    return campfire
  }

  // Create healing fountain
  createHealingFountain() {
    const fountain = new THREE.Group()

    // Base
    const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x4169e1 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.25
    base.castShadow = true
    base.receiveShadow = true
    fountain.add(base)

    // Fountain bowl
    const bowlGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.8, 8)
    const bowlMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb })
    const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial)
    bowl.position.y = 0.9
    bowl.castShadow = true
    fountain.add(bowl)

    // Water
    const waterGeometry = new THREE.CylinderGeometry(1.4, 1.4, 0.6, 8)
    const waterMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00bfff,
      transparent: true,
      opacity: 0.6
    })
    const water = new THREE.Mesh(waterGeometry, waterMaterial)
    water.position.y = 0.9
    fountain.add(water)

    // Center pillar
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8)
    const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb })
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
    pillar.position.y = 2
    pillar.castShadow = true
    fountain.add(pillar)

    // Healing orb
    const orbGeometry = new THREE.SphereGeometry(0.4, 8, 8)
    const orbMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x00ff00,
      emissive: 0x004000,
      emissiveIntensity: 0.5
    })
    const orb = new THREE.Mesh(orbGeometry, orbMaterial)
    orb.position.y = 3.5
    fountain.add(orb)

    // Add healing animation
    orb.userData = {
      update: (deltaTime) => {
        orb.position.y = 3.5 + Math.sin(Date.now() * 0.003) * 0.2
        orb.rotation.y += deltaTime * 0.3
        orb.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1)
      }
    }

    return fountain
  }

  // Create elemental altar
  createElementalAltar() {
    const altar = new THREE.Group()

    // Altar base
    const baseGeometry = new THREE.BoxGeometry(4, 1, 4)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.5
    base.castShadow = true
    base.receiveShadow = true
    altar.add(base)

    // Altar pillars
    for (let i = 0; i < 4; i++) {
      const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8)
      const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x4b0082 })
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
      pillar.position.set(
        (i % 2 === 0 ? 1.5 : -1.5),
        2.5,
        (i < 2 ? 1.5 : -1.5)
      )
      pillar.castShadow = true
      altar.add(pillar)
    }

    // Central crystal
    const crystalGeometry = new THREE.OctahedronGeometry(1, 0)
    const crystalMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      emissive: 0x404040,
      emissiveIntensity: 0.4
    })
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
    crystal.position.y = 2.5
    altar.add(crystal)

    // Add elemental animation
    crystal.userData = {
      update: (deltaTime) => {
        crystal.rotation.y += deltaTime * 0.2
        crystal.position.y = 2.5 + Math.sin(Date.now() * 0.002) * 0.3
        crystal.scale.setScalar(1 + Math.sin(Date.now() * 0.004) * 0.15)
      }
    }

    return altar
  }

  // Add model to scene
  addModel(modelId, modelType, position, rotation = null, scale = 1.0) {
    const modelData = this.environmentModels[modelType]
    if (!modelData) {
      console.error(`Unknown model type: ${modelType}`)
      return null
    }

    const model = modelData.create()
    if (!model) return null

    // Set position
    model.position.copy(position)

    // Set rotation
    if (rotation) {
      model.rotation.copy(rotation)
    }

    // Set scale
    const finalScale = scale * modelData.scale
    model.scale.setScalar(finalScale)

    // Add collidable property
    model.userData.collidable = modelData.collidable

    // Add to scene
    this.gameEngine.scene.add(model)
    this.models.set(modelId, model)
    this.gameEngine.gameObjects.set(modelId, model)

    return model
  }

  // Remove model from scene
  removeModel(modelId) {
    const model = this.models.get(modelId)
    if (model) {
      this.gameEngine.scene.remove(model)
      this.models.delete(modelId)
      this.gameEngine.gameObjects.delete(modelId)
      
      // Dispose of geometries and materials
      model.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }
  }

  // Update model animations
  updateModelAnimations(deltaTime) {
    this.models.forEach((model, modelId) => {
      model.traverse((child) => {
        if (child.userData && child.userData.update) {
          child.userData.update(deltaTime)
        }
      })
    })
  }

  // Get model by ID
  getModel(modelId) {
    return this.models.get(modelId)
  }

  // Get all models
  getAllModels() {
    return Array.from(this.models.values())
  }

  // Dispose of all models
  dispose() {
    this.models.forEach((model, modelId) => {
      this.removeModel(modelId)
    })
    this.models.clear()
  }
} 