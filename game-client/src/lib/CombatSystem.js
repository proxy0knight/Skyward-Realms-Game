import * as THREE from 'three'

export class CombatSystem {
  constructor(gameEngine, playerManager) {
    this.gameEngine = gameEngine
    this.playerManager = playerManager
    this.activeSkills = new Map()
    this.projectiles = new Map()
    this.combatants = new Map()
    this.damageNumbers = []
    this.combatLog = []
    
    // Combat settings
    this.settings = {
      maxCombatRange: 20,
      projectileSpeed: 15,
      skillCooldowns: new Map(),
      globalCooldown: 1000, // 1 second
      lastGlobalCooldown: 0
    }
    
    this.setupEventListeners()
  }

  // Setup event listeners
  setupEventListeners() {
    this.gameEngine.on('keydown', (event) => {
      this.handleCombatInput(event)
    })
    
    this.gameEngine.on('update', (deltaTime) => {
      this.update(deltaTime)
    })
  }

  // Handle combat input
  handleCombatInput(event) {
    const player = this.playerManager.getLocalPlayer()
    if (!player || !player.element) return

    const now = Date.now()
    if (now - this.settings.lastGlobalCooldown < this.settings.globalCooldown) {
      return // Global cooldown active
    }

    let skillId = null
    switch (event.code) {
      case 'Digit1':
        skillId = this.getSkillBySlot(player.element.id, 0)
        break
      case 'Digit2':
        skillId = this.getSkillBySlot(player.element.id, 1)
        break
      case 'Digit3':
        skillId = this.getSkillBySlot(player.element.id, 2)
        break
      case 'Digit4':
        skillId = this.getSkillBySlot(player.element.id, 3)
        break
      case 'Digit5':
        skillId = this.getSkillBySlot(player.element.id, 4)
        break
    }

    if (skillId) {
      this.castSkill('local_player', skillId)
    }
  }

  // Get skill by slot number
  getSkillBySlot(element, slot) {
    const skillMappings = {
      fire: ['fireball', 'flame_shield', 'fire_storm', 'phoenix_form'],
      water: ['heal', 'ice_wall', 'tsunami', 'water_mastery'],
      earth: ['stone_armor', 'earthquake', 'stone_spikes', 'mountain_form'],
      air: ['wind_blade', 'flight', 'tornado', 'wind_mastery']
    }
    
    const skills = skillMappings[element]
    return skills && skills[slot] ? skills[slot] : null
  }

  // Cast a skill
  castSkill(playerId, skillId) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player || !player.element) return false

    const skillData = this.getSkillData(player.element.id, skillId)
    if (!skillData) return false

    // Check if skill is learned
    const playerSkill = player.skills.trees[player.element.id]?.[skillId]
    if (!playerSkill || playerSkill.level <= 0) {
      this.addCombatLog(`${skillData.name} غير متعلمة!`, 'error')
      return false
    }

    // Check cooldown
    const cooldownKey = `${playerId}_${skillId}`
    const now = Date.now()
    const lastCast = this.settings.skillCooldowns.get(cooldownKey) || 0
    
    if (now - lastCast < skillData.cooldown) {
      const remaining = Math.ceil((skillData.cooldown - (now - lastCast)) / 1000)
      this.addCombatLog(`${skillData.name} في فترة انتظار (${remaining}ث)`, 'warning')
      return false
    }

    // Check mana cost
    if (!this.playerManager.useMana(playerId, skillData.manaCost)) {
      this.addCombatLog(`طاقة غير كافية لـ ${skillData.name}`, 'error')
      return false
    }

    // Cast the skill
    this.executeSkill(playerId, skillId, skillData, playerSkill.level)
    
    // Set cooldowns
    this.settings.skillCooldowns.set(cooldownKey, now)
    this.settings.lastGlobalCooldown = now
    
    this.addCombatLog(`${player.name} استخدم ${skillData.name}`, 'skill')
    return true
  }

  // Get skill data
  getSkillData(element, skillId) {
    const skillDatabase = {
      fire: {
        fireball: {
          name: 'كرة النار',
          type: 'projectile',
          damage: 50,
          manaCost: 20,
          cooldown: 3000,
          range: 15,
          aoe: false,
          effects: ['burn']
        },
        flame_shield: {
          name: 'درع اللهب',
          type: 'buff',
          damage: 0,
          manaCost: 30,
          cooldown: 15000,
          duration: 10000,
          effects: ['fire_shield']
        },
        fire_storm: {
          name: 'عاصفة نارية',
          type: 'aoe',
          damage: 80,
          manaCost: 50,
          cooldown: 20000,
          range: 10,
          aoe: true,
          effects: ['burn', 'knockback']
        },
        phoenix_form: {
          name: 'شكل العنقاء',
          type: 'transformation',
          damage: 0,
          manaCost: 100,
          cooldown: 60000,
          duration: 15000,
          effects: ['phoenix_form', 'flight', 'fire_immunity']
        }
      },
      water: {
        heal: {
          name: 'الشفاء',
          type: 'heal',
          healing: 60,
          manaCost: 25,
          cooldown: 5000,
          range: 10,
          target: 'ally'
        },
        ice_wall: {
          name: 'جدار جليدي',
          type: 'barrier',
          damage: 0,
          manaCost: 40,
          cooldown: 12000,
          duration: 8000,
          effects: ['ice_wall']
        },
        tsunami: {
          name: 'تسونامي',
          type: 'wave',
          damage: 100,
          manaCost: 70,
          cooldown: 25000,
          range: 20,
          aoe: true,
          effects: ['knockback', 'slow']
        },
        water_mastery: {
          name: 'إتقان الماء',
          type: 'passive',
          manaCost: 0,
          cooldown: 0,
          effects: ['water_mastery']
        }
      },
      earth: {
        stone_armor: {
          name: 'درع حجري',
          type: 'buff',
          damage: 0,
          manaCost: 35,
          cooldown: 10000,
          duration: 12000,
          effects: ['stone_armor', 'damage_reduction']
        },
        earthquake: {
          name: 'زلزال',
          type: 'ground',
          damage: 70,
          manaCost: 45,
          cooldown: 18000,
          range: 8,
          aoe: true,
          effects: ['stun', 'knockdown']
        },
        stone_spikes: {
          name: 'أشواك حجرية',
          type: 'ground',
          damage: 60,
          manaCost: 30,
          cooldown: 8000,
          range: 12,
          effects: ['pierce', 'slow']
        },
        mountain_form: {
          name: 'شكل الجبل',
          type: 'transformation',
          damage: 0,
          manaCost: 80,
          cooldown: 45000,
          duration: 20000,
          effects: ['immobile', 'damage_immunity', 'taunt']
        }
      },
      air: {
        wind_blade: {
          name: 'شفرة الرياح',
          type: 'projectile',
          damage: 45,
          manaCost: 18,
          cooldown: 2500,
          range: 18,
          effects: ['cut', 'knockback']
        },
        flight: {
          name: 'الطيران',
          type: 'movement',
          damage: 0,
          manaCost: 40,
          cooldown: 20000,
          duration: 8000,
          effects: ['flight', 'speed_boost']
        },
        tornado: {
          name: 'إعصار',
          type: 'aoe',
          damage: 90,
          manaCost: 60,
          cooldown: 22000,
          range: 6,
          aoe: true,
          effects: ['lift', 'spin', 'continuous_damage']
        },
        wind_mastery: {
          name: 'إتقان الهواء',
          type: 'passive',
          manaCost: 0,
          cooldown: 0,
          effects: ['wind_mastery', 'movement_speed']
        }
      }
    }

    return skillDatabase[element]?.[skillId] || null
  }

  // Execute skill effect
  executeSkill(playerId, skillId, skillData, skillLevel) {
    const player = this.gameEngine.gameObjects.get('player')
    if (!player) return

    const position = player.position.clone()
    const scaledDamage = skillData.damage * (1 + (skillLevel - 1) * 0.2)
    const scaledHealing = skillData.healing * (1 + (skillLevel - 1) * 0.2)

    switch (skillData.type) {
      case 'projectile':
        this.createProjectile(playerId, skillId, skillData, position, scaledDamage)
        break
        
      case 'aoe':
        this.createAOEEffect(playerId, skillId, skillData, position, scaledDamage)
        break
        
      case 'heal':
        this.healTarget(playerId, scaledHealing)
        break
        
      case 'buff':
      case 'transformation':
        this.applyBuff(playerId, skillData, skillLevel)
        break
        
      case 'barrier':
        this.createBarrier(playerId, skillData, position)
        break
        
      case 'ground':
        this.createGroundEffect(playerId, skillData, position, scaledDamage)
        break
        
      case 'wave':
        this.createWaveEffect(playerId, skillData, position, scaledDamage)
        break
    }

    // Create visual effect
    this.createSkillVisualEffect(skillId, position, skillData)
  }

  // Create projectile
  createProjectile(playerId, skillId, skillData, startPosition, damage) {
    const geometry = new THREE.SphereGeometry(0.3)
    const material = new THREE.MeshLambertMaterial({ 
      color: this.getElementColor(skillId),
      emissive: this.getElementColor(skillId),
      emissiveIntensity: 0.5
    })
    
    const projectile = new THREE.Mesh(geometry, material)
    projectile.position.copy(startPosition)
    projectile.position.y += 1.5
    
    // Calculate direction (for now, forward direction)
    const direction = new THREE.Vector3(0, 0, -1)
    
    projectile.userData = {
      type: 'projectile',
      skillId,
      damage,
      speed: this.settings.projectileSpeed,
      direction: direction.clone(),
      maxDistance: skillData.range,
      traveledDistance: 0,
      effects: skillData.effects || [],
      caster: playerId,
      update: (deltaTime) => {
        const movement = direction.clone().multiplyScalar(this.settings.projectileSpeed * deltaTime)
        projectile.position.add(movement)
        projectile.userData.traveledDistance += movement.length()
        
        // Check for collision or max distance
        if (projectile.userData.traveledDistance >= skillData.range) {
          this.destroyProjectile(projectileId)
        }
      }
    }
    
    const projectileId = `projectile_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(projectileId, projectile)
    this.projectiles.set(projectileId, projectile)
    
    // Auto-destroy after max range
    setTimeout(() => {
      this.destroyProjectile(projectileId)
    }, (skillData.range / this.settings.projectileSpeed) * 1000)
  }

  // Create AOE effect
  createAOEEffect(playerId, skillId, skillData, position, damage) {
    const geometry = new THREE.CylinderGeometry(skillData.range, skillData.range, 0.5)
    const material = new THREE.MeshLambertMaterial({ 
      color: this.getElementColor(skillId),
      transparent: true,
      opacity: 0.6
    })
    
    const aoeEffect = new THREE.Mesh(geometry, material)
    aoeEffect.position.copy(position)
    aoeEffect.position.y = 0.25
    
    aoeEffect.userData = {
      type: 'aoe_effect',
      skillId,
      damage,
      effects: skillData.effects || [],
      caster: playerId,
      startTime: Date.now(),
      duration: 2000 // 2 seconds
    }
    
    const effectId = `aoe_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(effectId, aoeEffect)
    
    // Apply damage to targets in range
    this.applyAOEDamage(position, skillData.range, damage, skillData.effects, playerId)
    
    // Remove effect after duration
    setTimeout(() => {
      this.gameEngine.removeGameObject(effectId)
    }, 2000)
  }

  // Apply AOE damage
  applyAOEDamage(center, radius, damage, effects, casterId) {
    // For now, just create damage numbers as visual feedback
    this.createDamageNumber(center, damage, 'fire')
    this.addCombatLog(`AOE damage: ${damage}`, 'damage')
  }

  // Heal target
  healTarget(playerId, healing) {
    const healAmount = this.playerManager.healPlayer(playerId, healing)
    if (healAmount > 0) {
      const player = this.gameEngine.gameObjects.get('player')
      if (player) {
        this.createDamageNumber(player.position, healAmount, 'heal')
      }
      this.addCombatLog(`تم الشفاء بـ ${healAmount} نقطة`, 'heal')
    }
  }

  // Apply buff
  applyBuff(playerId, skillData, skillLevel) {
    // For now, just show visual feedback
    const player = this.gameEngine.gameObjects.get('player')
    if (player) {
      this.createBuffEffect(player.position, skillData.name)
    }
    this.addCombatLog(`تم تطبيق ${skillData.name}`, 'buff')
  }

  // Create barrier
  createBarrier(playerId, skillData, position) {
    const geometry = new THREE.BoxGeometry(6, 3, 0.5)
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.7
    })
    
    const barrier = new THREE.Mesh(geometry, material)
    barrier.position.copy(position)
    barrier.position.y = 1.5
    barrier.position.z -= 3
    
    const barrierId = `barrier_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(barrierId, barrier)
    
    // Remove barrier after duration
    setTimeout(() => {
      this.gameEngine.removeGameObject(barrierId)
    }, skillData.duration)
    
    this.addCombatLog(`تم إنشاء ${skillData.name}`, 'skill')
  }

  // Create ground effect
  createGroundEffect(playerId, skillData, position, damage) {
    const geometry = new THREE.RingGeometry(2, skillData.range, 8)
    const material = new THREE.MeshLambertMaterial({ 
      color: this.getElementColor(skillData.name),
      transparent: true,
      opacity: 0.8
    })
    
    const groundEffect = new THREE.Mesh(geometry, material)
    groundEffect.position.copy(position)
    groundEffect.position.y = 0.1
    groundEffect.rotation.x = -Math.PI / 2
    
    const effectId = `ground_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(effectId, groundEffect)
    
    this.createDamageNumber(position, damage, 'earth')
    this.addCombatLog(`${skillData.name} damage: ${damage}`, 'damage')
    
    // Remove effect after 3 seconds
    setTimeout(() => {
      this.gameEngine.removeGameObject(effectId)
    }, 3000)
  }

  // Create wave effect
  createWaveEffect(playerId, skillData, position, damage) {
    // Create expanding wave
    const geometry = new THREE.RingGeometry(0, 1, 16)
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x1e90ff,
      transparent: true,
      opacity: 0.8
    })
    
    const wave = new THREE.Mesh(geometry, material)
    wave.position.copy(position)
    wave.position.y = 0.5
    wave.rotation.x = -Math.PI / 2
    
    wave.userData = {
      type: 'wave',
      maxRadius: skillData.range,
      currentRadius: 0,
      speed: 10,
      update: (deltaTime) => {
        wave.userData.currentRadius += wave.userData.speed * deltaTime
        wave.geometry.dispose()
        wave.geometry = new THREE.RingGeometry(
          Math.max(0, wave.userData.currentRadius - 2),
          wave.userData.currentRadius,
          16
        )
        
        if (wave.userData.currentRadius >= wave.userData.maxRadius) {
          this.gameEngine.removeGameObject(waveId)
        }
      }
    }
    
    const waveId = `wave_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(waveId, wave)
    
    this.createDamageNumber(position, damage, 'water')
    this.addCombatLog(`${skillData.name} damage: ${damage}`, 'damage')
  }

  // Create skill visual effect
  createSkillVisualEffect(skillId, position, skillData) {
    // Create particle effect
    const particleCount = 50
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const color = new THREE.Color(this.getElementColor(skillId))
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 4
      positions[i * 3 + 1] = position.y + Math.random() * 3
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 4
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    })
    
    const particleSystem = new THREE.Points(particles, particleMaterial)
    
    const effectId = `particles_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(effectId, particleSystem)
    
    // Remove particles after 2 seconds
    setTimeout(() => {
      this.gameEngine.removeGameObject(effectId)
    }, 2000)
  }

  // Create damage number
  createDamageNumber(position, amount, type) {
    const damageNumber = {
      position: position.clone(),
      amount,
      type,
      startTime: Date.now(),
      duration: 2000,
      color: this.getDamageColor(type)
    }
    
    this.damageNumbers.push(damageNumber)
  }

  // Create buff effect
  createBuffEffect(position, buffName) {
    const geometry = new THREE.RingGeometry(1, 2, 16)
    const material = new THREE.MeshLambertMaterial({ 
      color: 0xffd700,
      transparent: true,
      opacity: 0.6
    })
    
    const buffEffect = new THREE.Mesh(geometry, material)
    buffEffect.position.copy(position)
    buffEffect.position.y = 0.1
    buffEffect.rotation.x = -Math.PI / 2
    
    const effectId = `buff_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(effectId, buffEffect)
    
    // Remove effect after 1 second
    setTimeout(() => {
      this.gameEngine.removeGameObject(effectId)
    }, 1000)
  }

  // Destroy projectile
  destroyProjectile(projectileId) {
    if (this.projectiles.has(projectileId)) {
      this.gameEngine.removeGameObject(projectileId)
      this.projectiles.delete(projectileId)
    }
  }

  // Get element color
  getElementColor(skillId) {
    if (skillId.includes('fire') || skillId === 'fireball' || skillId === 'flame_shield') {
      return 0xff4500
    } else if (skillId.includes('water') || skillId === 'heal' || skillId === 'ice_wall') {
      return 0x1e90ff
    } else if (skillId.includes('earth') || skillId === 'stone_armor' || skillId === 'earthquake') {
      return 0x8b4513
    } else if (skillId.includes('air') || skillId === 'wind_blade' || skillId === 'flight') {
      return 0xe6e6fa
    }
    return 0xffffff
  }

  // Get damage color
  getDamageColor(type) {
    switch (type) {
      case 'fire': return '#ff4500'
      case 'water': return '#1e90ff'
      case 'earth': return '#8b4513'
      case 'air': return '#e6e6fa'
      case 'heal': return '#00ff00'
      case 'buff': return '#ffd700'
      default: return '#ffffff'
    }
  }

  // Add combat log entry
  addCombatLog(message, type = 'info') {
    const logEntry = {
      message,
      type,
      timestamp: Date.now()
    }
    
    this.combatLog.push(logEntry)
    
    // Keep only last 50 entries
    if (this.combatLog.length > 50) {
      this.combatLog.shift()
    }
    
    console.log(`[Combat] ${message}`)
  }

  // Update combat system
  update(deltaTime) {
    // Update projectiles
    this.projectiles.forEach((projectile, id) => {
      if (projectile.userData.update) {
        projectile.userData.update(deltaTime)
      }
    })
    
    // Update damage numbers
    this.damageNumbers = this.damageNumbers.filter(damageNumber => {
      const elapsed = Date.now() - damageNumber.startTime
      if (elapsed >= damageNumber.duration) {
        return false
      }
      
      // Move damage number up
      damageNumber.position.y += deltaTime * 2
      return true
    })
  }

  // Get combat log
  getCombatLog() {
    return [...this.combatLog]
  }

  // Get active cooldowns
  getActiveCooldowns(playerId) {
    const cooldowns = {}
    const now = Date.now()
    
    this.settings.skillCooldowns.forEach((lastCast, key) => {
      if (key.startsWith(playerId)) {
        const skillId = key.split('_').slice(1).join('_')
        const player = this.playerManager.getPlayer(playerId)
        if (player && player.element) {
          const skillData = this.getSkillData(player.element.id, skillId)
          if (skillData) {
            const remaining = Math.max(0, skillData.cooldown - (now - lastCast))
            if (remaining > 0) {
              cooldowns[skillId] = remaining
            }
          }
        }
      }
    })
    
    return cooldowns
  }

  // Cleanup
  dispose() {
    this.activeSkills.clear()
    this.projectiles.clear()
    this.combatants.clear()
    this.damageNumbers = []
    this.combatLog = []
    this.settings.skillCooldowns.clear()
    console.log('Combat System disposed')
  }
}

export default CombatSystem

