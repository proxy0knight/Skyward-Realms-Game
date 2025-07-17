export class PlayerManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.players = new Map()
    this.localPlayer = null
    this.saveKey = 'skyward_realms_player_data'
  }

  // Create a new player
  createPlayer(playerData) {
    const player = {
      id: playerData.id || 'local_player',
      name: playerData.name || 'Player',
      level: playerData.level || 1,
      health: playerData.health || 100,
      maxHealth: playerData.maxHealth || 100,
      mana: playerData.mana || 80,
      maxMana: playerData.maxMana || 100,
      experience: playerData.experience || 250,
      experienceToNext: playerData.experienceToNext || 1000,
      element: playerData.element || null,
      position: playerData.position || { x: 0, y: 1, z: 0 },
      stats: {
        strength: playerData.stats?.strength || 10,
        defense: playerData.stats?.defense || 10,
        intelligence: playerData.stats?.intelligence || 10,
        agility: playerData.stats?.agility || 10
      },
      inventory: playerData.inventory || this.createDefaultInventory(),
      skills: playerData.skills || this.createDefaultSkills(playerData.element),
      keybindings: playerData.keybindings || this.createDefaultKeybindings(),
      settings: playerData.settings || this.createDefaultSettings()
    }

    this.players.set(player.id, player)
    
    if (player.id === 'local_player') {
      this.localPlayer = player
      this.savePlayerData()
    }

    return player
  }

  // Create default inventory
  createDefaultInventory() {
    return {
      items: [
        { id: 1, name: 'سيف النار', type: 'weapon', rarity: 'rare', quantity: 1, equipped: true },
        { id: 2, name: 'درع الأرض', type: 'armor', rarity: 'uncommon', quantity: 1, equipped: true },
        { id: 3, name: 'بلورة الماء', type: 'material', rarity: 'common', quantity: 15 },
        { id: 4, name: 'عشبة الشفاء', type: 'consumable', rarity: 'common', quantity: 8 },
        { id: 5, name: 'جوهرة الهواء', type: 'material', rarity: 'epic', quantity: 3 }
      ],
      capacity: 48,
      gold: 1250
    }
  }

  // Create default skills based on element
  createDefaultSkills(element) {
    const baseSkills = {
      fire: {
        fireball: { level: 3, maxLevel: 5 },
        flame_shield: { level: 2, maxLevel: 5 },
        fire_storm: { level: 0, maxLevel: 3 },
        phoenix_form: { level: 0, maxLevel: 1 }
      },
      water: {
        heal: { level: 2, maxLevel: 5 },
        ice_wall: { level: 1, maxLevel: 3 },
        tsunami: { level: 0, maxLevel: 3 },
        water_mastery: { level: 0, maxLevel: 1 }
      },
      earth: {
        stone_armor: { level: 2, maxLevel: 5 },
        earthquake: { level: 1, maxLevel: 3 },
        stone_spikes: { level: 0, maxLevel: 4 },
        mountain_form: { level: 0, maxLevel: 1 }
      },
      air: {
        wind_blade: { level: 2, maxLevel: 5 },
        flight: { level: 1, maxLevel: 3 },
        tornado: { level: 0, maxLevel: 3 },
        wind_mastery: { level: 0, maxLevel: 1 }
      }
    }

    return {
      availablePoints: 5,
      trees: element ? { [element.id]: baseSkills[element.id] || {} } : {}
    }
  }

  // Create default keybindings
  createDefaultKeybindings() {
    return {
      moveForward: 'KeyW',
      moveBackward: 'KeyS',
      moveLeft: 'KeyA',
      moveRight: 'KeyD',
      jump: 'Space',
      skill1: 'Digit1',
      skill2: 'Digit2',
      skill3: 'Digit3',
      skill4: 'Digit4',
      skill5: 'Digit5',
      inventory: 'KeyI',
      skills: 'KeyK',
      map: 'KeyM',
      chat: 'Enter'
    }
  }

  // Create default settings
  createDefaultSettings() {
    return {
      graphics: {
        quality: 'medium',
        shadows: true,
        particles: true,
        antialiasing: true
      },
      audio: {
        masterVolume: 0.8,
        musicVolume: 0.6,
        sfxVolume: 0.8,
        voiceVolume: 0.7
      },
      gameplay: {
        autoLoot: true,
        showDamageNumbers: true,
        showPlayerNames: true,
        cameraShake: true
      }
    }
  }

  // Get player by ID
  getPlayer(playerId) {
    return this.players.get(playerId)
  }

  // Get local player
  getLocalPlayer() {
    return this.localPlayer
  }

  // Update player data
  updatePlayer(playerId, updates) {
    const player = this.players.get(playerId)
    if (player) {
      Object.assign(player, updates)
      
      if (playerId === 'local_player') {
        this.savePlayerData()
      }
      
      return player
    }
    return null
  }

  // Add experience to player
  addExperience(playerId, amount) {
    const player = this.players.get(playerId)
    if (!player) return false

    player.experience += amount
    let leveledUp = false

    // Check for level up
    while (player.experience >= player.experienceToNext) {
      player.experience -= player.experienceToNext
      player.level++
      player.experienceToNext = this.calculateExperienceToNext(player.level)
      
      // Increase stats on level up
      player.stats.strength += 2
      player.stats.defense += 2
      player.stats.intelligence += 2
      player.stats.agility += 2
      
      // Increase health and mana
      player.maxHealth += 10
      player.maxMana += 5
      player.health = player.maxHealth
      player.mana = player.maxMana
      
      // Add skill points
      player.skills.availablePoints += 1
      
      leveledUp = true
    }

    if (playerId === 'local_player') {
      this.savePlayerData()
    }

    return { leveledUp, newLevel: player.level }
  }

  // Calculate experience needed for next level
  calculateExperienceToNext(level) {
    return Math.floor(1000 * Math.pow(1.2, level - 1))
  }

  // Heal player
  healPlayer(playerId, amount) {
    const player = this.players.get(playerId)
    if (!player) return false

    const oldHealth = player.health
    player.health = Math.min(player.maxHealth, player.health + amount)
    
    if (playerId === 'local_player') {
      this.savePlayerData()
    }

    return player.health - oldHealth
  }

  // Restore mana
  restoreMana(playerId, amount) {
    const player = this.players.get(playerId)
    if (!player) return false

    const oldMana = player.mana
    player.mana = Math.min(player.maxMana, player.mana + amount)
    
    if (playerId === 'local_player') {
      this.savePlayerData()
    }

    return player.mana - oldMana
  }

  // Damage player
  damagePlayer(playerId, amount) {
    const player = this.players.get(playerId)
    if (!player) return false

    const oldHealth = player.health
    player.health = Math.max(0, player.health - amount)
    
    if (playerId === 'local_player') {
      this.savePlayerData()
    }

    return {
      damage: oldHealth - player.health,
      isDead: player.health <= 0
    }
  }

  // Use mana
  useMana(playerId, amount) {
    const player = this.players.get(playerId)
    if (!player || player.mana < amount) return false

    player.mana -= amount
    
    if (playerId === 'local_player') {
      this.savePlayerData()
    }

    return true
  }

  // Add item to inventory
  addItem(playerId, item) {
    const player = this.players.get(playerId)
    if (!player) return false

    const inventory = player.inventory
    const existingItem = inventory.items.find(i => i.name === item.name && i.type === item.type)
    
    if (existingItem && item.quantity) {
      existingItem.quantity += item.quantity
    } else {
      if (inventory.items.length >= inventory.capacity) {
        return false // Inventory full
      }
      inventory.items.push({ ...item, id: Date.now() })
    }

    if (playerId === 'local_player') {
      this.savePlayerData()
    }

    return true
  }

  // Remove item from inventory
  removeItem(playerId, itemId, quantity = 1) {
    const player = this.players.get(playerId)
    if (!player) return false

    const inventory = player.inventory
    const itemIndex = inventory.items.findIndex(i => i.id === itemId)
    
    if (itemIndex === -1) return false

    const item = inventory.items[itemIndex]
    
    if (item.quantity && item.quantity > quantity) {
      item.quantity -= quantity
    } else {
      inventory.items.splice(itemIndex, 1)
    }

    if (playerId === 'local_player') {
      this.savePlayerData()
    }

    return true
  }

  // Upgrade skill
  upgradeSkill(playerId, element, skillId) {
    const player = this.players.get(playerId)
    if (!player) return false

    const skills = player.skills
    if (skills.availablePoints <= 0) return false

    const elementSkills = skills.trees[element]
    if (!elementSkills || !elementSkills[skillId]) return false

    const skill = elementSkills[skillId]
    if (skill.level >= skill.maxLevel) return false

    skill.level++
    skills.availablePoints--

    if (playerId === 'local_player') {
      this.savePlayerData()
    }

    return true
  }

  // Save player data to localStorage
  savePlayerData() {
    if (this.localPlayer) {
      try {
        localStorage.setItem(this.saveKey, JSON.stringify(this.localPlayer))
      } catch (error) {
        console.error('Failed to save player data:', error)
      }
    }
  }

  // Load player data from localStorage
  loadPlayerData() {
    try {
      const savedData = localStorage.getItem(this.saveKey)
      if (savedData) {
        const playerData = JSON.parse(savedData)
        this.localPlayer = this.createPlayer(playerData)
        return this.localPlayer
      }
    } catch (error) {
      console.error('Failed to load player data:', error)
    }
    return null
  }

  // Clear saved data
  clearSavedData() {
    try {
      localStorage.removeItem(this.saveKey)
      console.log('Player data cleared')
    } catch (error) {
      console.error('Failed to clear player data:', error)
    }
  }

  // Get player stats summary
  getPlayerStats(playerId) {
    const player = this.players.get(playerId)
    if (!player) return null

    return {
      level: player.level,
      health: player.health,
      maxHealth: player.maxHealth,
      mana: player.mana,
      maxMana: player.maxMana,
      experience: player.experience,
      experienceToNext: player.experienceToNext,
      stats: { ...player.stats },
      element: player.element
    }
  }
}

export default PlayerManager

