import * as THREE from 'three'

export class Character3D {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.characters = new Map()
    this.animations = new Map()
    this.characterTypes = {
      player: this.createPlayerModel.bind(this),
      npc: this.createNPCModel.bind(this),
      enemy: this.createEnemyModel.bind(this),
      boss: this.createBossModel.bind(this)
    }
    
    this.initializeCharacterModels()
  }

  // Initialize character models
  initializeCharacterModels() {
    // Player character models for each element
    this.playerModels = {
      fire: {
        geometry: new THREE.CapsuleGeometry(0.5, 1.8, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0xff4500,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0xff2200,
          scale: 1.3,
          intensity: 0.4
        }
      },
      water: {
        geometry: new THREE.CapsuleGeometry(0.5, 1.8, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0x1e90ff,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0x0066cc,
          scale: 1.3,
          intensity: 0.4
        }
      },
      earth: {
        geometry: new THREE.CapsuleGeometry(0.6, 1.7, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0x8b4513,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0x654321,
          scale: 1.4,
          intensity: 0.3
        }
      },
      air: {
        geometry: new THREE.CapsuleGeometry(0.45, 1.9, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0xe6e6fa,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0xccccff,
          scale: 1.2,
          intensity: 0.5
        }
      }
    }

    // NPC models
    this.npcModels = {
      eldric: {
        geometry: new THREE.CapsuleGeometry(0.5, 1.8, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0x8b7355,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0xffd700,
          scale: 1.5,
          intensity: 0.6
        }
      },
      pyra: {
        geometry: new THREE.CapsuleGeometry(0.5, 1.7, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0xff6347,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0xff4500,
          scale: 1.3,
          intensity: 0.5
        }
      },
      aqua: {
        geometry: new THREE.CapsuleGeometry(0.5, 1.7, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0x4169e1,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0x00bfff,
          scale: 1.3,
          intensity: 0.5
        }
      },
      terra: {
        geometry: new THREE.CapsuleGeometry(0.6, 1.8, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0x654321,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0x8b4513,
          scale: 1.4,
          intensity: 0.4
        }
      },
      zephyr: {
        geometry: new THREE.CapsuleGeometry(0.45, 1.8, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0x87ceeb,
          transparent: true,
          opacity: 0.9
        }),
        aura: {
          color: 0x00ffff,
          scale: 1.2,
          intensity: 0.6
        }
      }
    }

    // Enemy models
    this.enemyModels = {
      shadow_creature: {
        geometry: new THREE.CapsuleGeometry(0.4, 1.6, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0x2f2f2f,
          transparent: true,
          opacity: 0.8
        }),
        aura: {
          color: 0x800080,
          scale: 1.2,
          intensity: 0.7
        }
      },
      corrupted_elemental: {
        geometry: new THREE.CapsuleGeometry(0.5, 1.8, 8, 16),
        material: new THREE.MeshLambertMaterial({ 
          color: 0x4b0082,
          transparent: true,
          opacity: 0.8
        }),
        aura: {
          color: 0xff0000,
          scale: 1.4,
          intensity: 0.8
        }
      }
    }
  }

  // Create player character
  createPlayerModel(playerData) {
    const elementId = playerData.element?.id || 'fire'
    const modelData = this.playerModels[elementId]
    
    if (!modelData) {
      console.error(`No model data for element: ${elementId}`)
      return null
    }

    const character = new THREE.Group()
    
    // Main body
    const body = new THREE.Mesh(modelData.geometry, modelData.material)
    body.position.y = 1.5
    body.castShadow = true
    body.receiveShadow = true
    character.add(body)

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8)
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffdbac,
      transparent: true,
      opacity: 0.9
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 2.8
    head.castShadow = true
    character.add(head)

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 4, 4)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.1, 2.85, 0.25)
    character.add(leftEye)
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.1, 2.85, 0.25)
    character.add(rightEye)

    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.15, 1.2, 4, 8)
    const armMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffdbac,
      transparent: true,
      opacity: 0.9
    })
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.set(-0.8, 1.8, 0)
    leftArm.rotation.z = 0.3
    leftArm.castShadow = true
    character.add(leftArm)
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.set(0.8, 1.8, 0)
    rightArm.rotation.z = -0.3
    rightArm.castShadow = true
    character.add(rightArm)

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.2, 1.0, 4, 8)
    const legMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8b4513,
      transparent: true,
      opacity: 0.9
    })
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.3, 0.5, 0)
    leftLeg.castShadow = true
    character.add(leftLeg)
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.3, 0.5, 0)
    rightLeg.castShadow = true
    character.add(rightLeg)

    // Aura effect
    const aura = this.createAuraEffect(modelData.aura)
    character.add(aura)

    // Character data
    character.userData = {
      type: 'player',
      element: playerData.element,
      health: playerData.health || 100,
      maxHealth: playerData.maxHealth || 100,
      mana: playerData.mana || 100,
      maxMana: playerData.maxMana || 100,
      velocity: new THREE.Vector3(0, 0, 0),
      isGrounded: false,
      speed: 8,
      animationState: 'idle',
      lastAnimationTime: 0
    }

    return character
  }

  // Create NPC character
  createNPCModel(npcData) {
    const npcId = npcData.id || 'eldric'
    const modelData = this.npcModels[npcId]
    
    if (!modelData) {
      console.error(`No model data for NPC: ${npcId}`)
      return null
    }

    const character = new THREE.Group()
    
    // Main body
    const body = new THREE.Mesh(modelData.geometry, modelData.material)
    body.position.y = 1.5
    body.castShadow = true
    body.receiveShadow = true
    character.add(body)

    // Head with different styles based on NPC
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8)
    let headMaterial
    
    switch (npcId) {
      case 'eldric':
        headMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xf4a460,
          transparent: true,
          opacity: 0.9
        })
        break
      case 'pyra':
        headMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xffdbac,
          transparent: true,
          opacity: 0.9
        })
        break
      default:
        headMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xffdbac,
          transparent: true,
          opacity: 0.9
        })
    }
    
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 2.8
    head.castShadow = true
    character.add(head)

    // Add NPC-specific features
    if (npcId === 'eldric') {
      // Add beard
      const beardGeometry = new THREE.ConeGeometry(0.2, 0.4, 8)
      const beardMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      const beard = new THREE.Mesh(beardGeometry, beardMaterial)
      beard.position.set(0, 2.4, 0.2)
      beard.rotation.x = 0.3
      character.add(beard)
    }

    // Aura effect
    const aura = this.createAuraEffect(modelData.aura)
    character.add(aura)

    // Character data
    character.userData = {
      type: 'npc',
      id: npcId,
      name: npcData.name,
      element: npcData.element,
      health: npcData.health || 100,
      maxHealth: npcData.maxHealth || 100,
      animationState: 'idle',
      lastAnimationTime: 0,
      dialogueAvailable: true
    }

    return character
  }

  // Create enemy character
  createEnemyModel(enemyData) {
    const enemyType = enemyData.type || 'shadow_creature'
    const modelData = this.enemyModels[enemyType]
    
    if (!modelData) {
      console.error(`No model data for enemy: ${enemyType}`)
      return null
    }

    const character = new THREE.Group()
    
    // Main body
    const body = new THREE.Mesh(modelData.geometry, modelData.material)
    body.position.y = 1.5
    body.castShadow = true
    body.receiveShadow = true
    character.add(body)

    // Enemy-specific features
    if (enemyType === 'shadow_creature') {
      // Add shadow tendrils
      for (let i = 0; i < 4; i++) {
        const tendrilGeometry = new THREE.CylinderGeometry(0.05, 0.02, 1.5, 4)
        const tendrilMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x1a1a1a,
          transparent: true,
          opacity: 0.7
        })
        const tendril = new THREE.Mesh(tendrilGeometry, tendrilMaterial)
        tendril.position.set(
          (Math.random() - 0.5) * 0.8,
          1.5,
          (Math.random() - 0.5) * 0.8
        )
        tendril.rotation.x = Math.random() * Math.PI
        tendril.rotation.z = Math.random() * Math.PI
        character.add(tendril)
      }
    }

    // Aura effect
    const aura = this.createAuraEffect(modelData.aura)
    character.add(aura)

    // Character data
    character.userData = {
      type: 'enemy',
      enemyType: enemyType,
      health: enemyData.health || 50,
      maxHealth: enemyData.maxHealth || 50,
      damage: enemyData.damage || 10,
      animationState: 'idle',
      lastAnimationTime: 0,
      isAggressive: true
    }

    return character
  }

  // Create boss character
  createBossModel(bossData) {
    const bossType = bossData.type || 'corrupted_elemental'
    const modelData = this.enemyModels[bossType]
    
    if (!modelData) {
      console.error(`No model data for boss: ${bossType}`)
      return null
    }

    const character = new THREE.Group()
    
    // Larger body for boss
    const bodyGeometry = new THREE.CapsuleGeometry(0.8, 2.5, 8, 16)
    const body = new THREE.Mesh(bodyGeometry, modelData.material)
    body.position.y = 2.0
    body.castShadow = true
    body.receiveShadow = true
    character.add(body)

    // Boss-specific features
    if (bossType === 'corrupted_elemental') {
      // Add corruption spikes
      for (let i = 0; i < 6; i++) {
        const spikeGeometry = new THREE.ConeGeometry(0.1, 0.5, 4)
        const spikeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial)
        spike.position.set(
          (Math.random() - 0.5) * 1.2,
          2.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 1.2
        )
        spike.rotation.x = Math.random() * Math.PI
        spike.rotation.z = Math.random() * Math.PI
        character.add(spike)
      }
    }

    // Enhanced aura effect for boss
    const aura = this.createAuraEffect({
      ...modelData.aura,
      scale: modelData.aura.scale * 1.5,
      intensity: modelData.aura.intensity * 1.2
    })
    character.add(aura)

    // Character data
    character.userData = {
      type: 'boss',
      bossType: bossType,
      health: bossData.health || 200,
      maxHealth: bossData.maxHealth || 200,
      damage: bossData.damage || 30,
      animationState: 'idle',
      lastAnimationTime: 0,
      isAggressive: true,
      specialAbilities: bossData.specialAbilities || []
    }

    return character
  }

  // Create aura effect
  createAuraEffect(auraData) {
    const auraGeometry = new THREE.SphereGeometry(auraData.scale, 16, 16)
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: auraData.color,
      transparent: true,
      opacity: auraData.intensity,
      side: THREE.BackSide
    })
    
    const aura = new THREE.Mesh(auraGeometry, auraMaterial)
    aura.userData = {
      type: 'aura',
      update: (deltaTime) => {
        aura.rotation.y += deltaTime * 0.5
        aura.scale.setScalar(auraData.scale + Math.sin(Date.now() * 0.003) * 0.1)
      }
    }
    
    return aura
  }

  // Add character to scene
  addCharacter(characterId, characterType, characterData) {
    const createFunction = this.characterTypes[characterType]
    if (!createFunction) {
      console.error(`Unknown character type: ${characterType}`)
      return null
    }

    const character = createFunction(characterData)
    if (!character) return null

    // Set position
    if (characterData.position) {
      character.position.copy(characterData.position)
    }

    // Add to scene
    this.gameEngine.scene.add(character)
    this.characters.set(characterId, character)
    this.gameEngine.gameObjects.set(characterId, character)

    return character
  }

  // Remove character from scene
  removeCharacter(characterId) {
    const character = this.characters.get(characterId)
    if (character) {
      this.gameEngine.scene.remove(character)
      this.characters.delete(characterId)
      this.gameEngine.gameObjects.delete(characterId)
      
      // Dispose of geometries and materials
      character.traverse((child) => {
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

  // Update character animations
  updateCharacterAnimations(deltaTime) {
    this.characters.forEach((character, characterId) => {
      const userData = character.userData
      const now = Date.now()
      
      // Update aura effects
      character.traverse((child) => {
        if (child.userData.type === 'aura' && child.userData.update) {
          child.userData.update(deltaTime)
        }
      })

      // Character-specific animations
      switch (userData.type) {
        case 'player':
          this.updatePlayerAnimations(character, deltaTime)
          break
        case 'npc':
          this.updateNPCAnimations(character, deltaTime)
          break
        case 'enemy':
        case 'boss':
          this.updateEnemyAnimations(character, deltaTime)
          break
      }
    })
  }

  // Update player animations
  updatePlayerAnimations(character, deltaTime) {
    const userData = character.userData
    const velocity = userData.velocity
    
    // Walking animation
    if (velocity.length() > 0.1) {
      userData.animationState = 'walking'
      
      // Bob up and down
      character.position.y = 1.5 + Math.sin(Date.now() * 0.01) * 0.1
      
      // Swing arms
      const leftArm = character.children.find(child => child.position.x < 0 && child.geometry.type === 'CapsuleGeometry')
      const rightArm = character.children.find(child => child.position.x > 0 && child.geometry.type === 'CapsuleGeometry')
      
      if (leftArm && rightArm) {
        leftArm.rotation.x = Math.sin(Date.now() * 0.02) * 0.5
        rightArm.rotation.x = -Math.sin(Date.now() * 0.02) * 0.5
      }
    } else {
      userData.animationState = 'idle'
      character.position.y = 1.5
    }
  }

  // Update NPC animations
  updateNPCAnimations(character, deltaTime) {
    const userData = character.userData
    
    // Gentle idle animation
    character.position.y = 1.5 + Math.sin(Date.now() * 0.005) * 0.05
    character.rotation.y += deltaTime * 0.1
  }

  // Update enemy animations
  updateEnemyAnimations(character, deltaTime) {
    const userData = character.userData
    
    // Aggressive idle animation
    character.position.y = 1.5 + Math.sin(Date.now() * 0.008) * 0.08
    character.rotation.y += deltaTime * 0.2
    
    // Scale pulsing for bosses
    if (userData.type === 'boss') {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1
      character.scale.setScalar(scale)
    }
  }

  // Get character by ID
  getCharacter(characterId) {
    return this.characters.get(characterId)
  }

  // Get all characters
  getAllCharacters() {
    return Array.from(this.characters.values())
  }

  // Dispose of all characters
  dispose() {
    this.characters.forEach((character, characterId) => {
      this.removeCharacter(characterId)
    })
    this.characters.clear()
  }
} 