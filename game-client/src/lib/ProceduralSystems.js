/**
 * Procedural Systems for Babylon.js Game Engine
 * Provides beautiful procedural fallbacks for all game systems
 */

// Simple Player Manager with procedural defaults
export class ProceduralPlayerManager {
  constructor() {
    this.players = new Map()
    this.currentPlayerId = null
  }

  createPlayer(playerData) {
    const player = {
      id: playerData.id || 'player_1',
      name: playerData.name || 'Elemental Warrior',
      element: playerData.element || { id: 'fire', name: 'Fire' },
      level: 1,
      health: 100,
      maxHealth: 100,
      position: { x: 0, y: 2, z: 0 },
      stats: {
        strength: 10,
        defense: 10,
        magic: 10,
        speed: 10
      },
      inventory: [],
      skills: [],
      experience: 0
    }

    this.players.set(player.id, player)
    this.currentPlayerId = player.id
    return player
  }

  getPlayer(playerId) {
    return this.players.get(playerId) || this.players.get(this.currentPlayerId)
  }

  updatePlayerPosition(playerId, position) {
    const player = this.getPlayer(playerId)
    if (player) {
      player.position = { ...position }
    }
  }

  // Procedural experience and leveling
  addExperience(playerId, amount) {
    const player = this.getPlayer(playerId)
    if (!player) return { success: false }

    player.experience += amount
    const expNeeded = player.level * 100
    
    if (player.experience >= expNeeded) {
      player.level++
      player.experience = 0
      player.maxHealth += 10
      player.health = player.maxHealth
      
      // Increase stats
      Object.keys(player.stats).forEach(stat => {
        player.stats[stat] += 2
      })

      console.log(`🎉 Level Up! ${player.name} is now level ${player.level}`)
      return { success: true, leveledUp: true, newLevel: player.level }
    }

    return { success: true, leveledUp: false }
  }
}

// Simple Skill System with procedural abilities
export class ProceduralSkillSystem {
  constructor() {
    this.elementalSkills = {
      fire: [
        { id: 'fireball', name: 'Fireball', description: 'Launch a ball of fire', manaCost: 20, damage: 30 },
        { id: 'flame_aura', name: 'Flame Aura', description: 'Surround yourself with flames', manaCost: 15, duration: 10 },
        { id: 'meteor', name: 'Meteor Strike', description: 'Call down a meteor', manaCost: 50, damage: 80 }
      ],
      water: [
        { id: 'heal', name: 'Healing Waters', description: 'Restore health', manaCost: 25, healing: 40 },
        { id: 'ice_shield', name: 'Ice Shield', description: 'Create protective barrier', manaCost: 20, defense: 15 },
        { id: 'tsunami', name: 'Tsunami Wave', description: 'Massive water attack', manaCost: 60, damage: 70 }
      ],
      earth: [
        { id: 'rock_armor', name: 'Rock Armor', description: 'Stone protection', manaCost: 30, defense: 25 },
        { id: 'earthquake', name: 'Earthquake', description: 'Shake the ground', manaCost: 40, damage: 50 },
        { id: 'stone_spikes', name: 'Stone Spikes', description: 'Summon earth spikes', manaCost: 35, damage: 45 }
      ],
      air: [
        { id: 'wind_dash', name: 'Wind Dash', description: 'Move swiftly on air currents', manaCost: 15, speed: 20 },
        { id: 'lightning_bolt', name: 'Lightning Bolt', description: 'Strike with lightning', manaCost: 30, damage: 55 },
        { id: 'tornado', name: 'Tornado', description: 'Create a powerful whirlwind', manaCost: 55, damage: 75 }
      ]
    }
  }

  getElementalSkills(elementId) {
    return this.elementalSkills[elementId] || []
  }

  useSkill(skillId, elementId) {
    const skills = this.getElementalSkills(elementId)
    const skill = skills.find(s => s.id === skillId)
    
    if (skill) {
      console.log(`✨ Using ${skill.name}: ${skill.description}`)
      return {
        success: true,
        skill: skill,
        effect: this.createSkillEffect(skill, elementId)
      }
    }

    return { success: false, message: 'Skill not found' }
  }

  createSkillEffect(skill, elementId) {
    // Return procedural effect data for Babylon.js
    return {
      type: 'elemental',
      element: elementId,
      duration: skill.duration || 2,
      intensity: skill.damage || skill.healing || skill.defense || 1,
      particles: true,
      sound: `${elementId}_${skill.id}`,
      color: this.getElementColor(elementId)
    }
  }

  getElementColor(elementId) {
    const colors = {
      fire: '#ff6b35',
      water: '#4fc3f7',
      earth: '#8bc34a',
      air: '#e1f5fe'
    }
    return colors[elementId] || '#ffffff'
  }
}

// Simple Quest/Story System with procedural content
export class ProceduralStorySystem {
  constructor() {
    this.activeQuests = []
    this.completedQuests = []
    this.storyProgress = {
      chapter: 1,
      completedObjectives: 0,
      discoveries: 0
    }
  }

  generateRandomQuest(playerLevel = 1) {
    const questTypes = [
      'exploration', 'collection', 'combat', 'skill_mastery'
    ]

    const questTemplates = {
      exploration: {
        name: 'Explore the Realm',
        description: 'Discover new areas in the elemental world',
        objectives: ['Move 100 units', 'Jump 10 times', 'Look around'],
        reward: { experience: 50 * playerLevel, gold: 25 }
      },
      collection: {
        name: 'Gather Elemental Energy',
        description: 'Collect elemental crystals scattered in the world',
        objectives: ['Find 5 crystals', 'Use your element', 'Rest at safe spot'],
        reward: { experience: 75 * playerLevel, gold: 40 }
      },
      combat: {
        name: 'Master Combat',
        description: 'Learn to use your elemental abilities in battle',
        objectives: ['Use 3 different skills', 'Dodge attacks', 'Victory'],
        reward: { experience: 100 * playerLevel, gold: 60 }
      },
      skill_mastery: {
        name: 'Elemental Mastery',
        description: 'Perfect your control over elemental forces',
        objectives: ['Practice skills', 'Combine abilities', 'Achieve mastery'],
        reward: { experience: 125 * playerLevel, gold: 80 }
      }
    }

    const questType = questTypes[Math.floor(Math.random() * questTypes.length)]
    const quest = {
      id: `quest_${Date.now()}`,
      type: questType,
      ...questTemplates[questType],
      progress: 0,
      isCompleted: false,
      startTime: Date.now()
    }

    this.activeQuests.push(quest)
    console.log(`📜 New Quest: ${quest.name}`)
    return quest
  }

  updateQuestProgress(questId, amount = 1) {
    const quest = this.activeQuests.find(q => q.id === questId)
    if (quest && !quest.isCompleted) {
      quest.progress = Math.min(quest.progress + amount, quest.objectives.length)
      
      if (quest.progress >= quest.objectives.length) {
        quest.isCompleted = true
        this.completeQuest(quest)
      }

      return { success: true, quest: quest }
    }
    return { success: false }
  }

  completeQuest(quest) {
    console.log(`🎉 Quest Complete: ${quest.name}`)
    console.log(`📝 Reward: +${quest.reward.experience} XP, +${quest.reward.gold} Gold`)
    
    this.completedQuests.push(quest)
    this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id)
    this.storyProgress.completedObjectives++

    return quest.reward
  }

  getActiveQuests() {
    return this.activeQuests
  }

  getStoryProgress() {
    return {
      ...this.storyProgress,
      totalQuests: this.completedQuests.length + this.activeQuests.length,
      completionRate: this.completedQuests.length / Math.max(1, this.completedQuests.length + this.activeQuests.length)
    }
  }
}

// Simple Resource/Crafting System
export class ProceduralResourceSystem {
  constructor() {
    this.resources = new Map()
    this.recipes = new Map()
    this.initializeBasicResources()
  }

  initializeBasicResources() {
    const basicResources = [
      { id: 'fire_crystal', name: 'Fire Crystal', rarity: 'common', value: 10 },
      { id: 'water_essence', name: 'Water Essence', rarity: 'common', value: 10 },
      { id: 'earth_stone', name: 'Earth Stone', rarity: 'common', value: 10 },
      { id: 'air_feather', name: 'Air Feather', rarity: 'common', value: 10 },
      { id: 'magic_dust', name: 'Magic Dust', rarity: 'rare', value: 50 },
      { id: 'elemental_core', name: 'Elemental Core', rarity: 'legendary', value: 200 }
    ]

    basicResources.forEach(resource => {
      this.resources.set(resource.id, resource)
    })

    // Basic crafting recipes
    this.recipes.set('health_potion', {
      id: 'health_potion',
      name: 'Health Potion',
      ingredients: [
        { id: 'water_essence', amount: 2 },
        { id: 'magic_dust', amount: 1 }
      ],
      result: { id: 'health_potion', amount: 1, healing: 50 }
    })

    this.recipes.set('mana_crystal', {
      id: 'mana_crystal',
      name: 'Mana Crystal',
      ingredients: [
        { id: 'magic_dust', amount: 3 },
        { id: 'elemental_core', amount: 1 }
      ],
      result: { id: 'mana_crystal', amount: 1, manaRestore: 100 }
    })
  }

  gatherResource(resourceId, amount = 1) {
    const resource = this.resources.get(resourceId)
    if (resource) {
      console.log(`⛏️ Gathered ${amount}x ${resource.name}`)
      return {
        success: true,
        resource: resource,
        amount: amount,
        value: resource.value * amount
      }
    }
    return { success: false }
  }

  craftItem(recipeId) {
    const recipe = this.recipes.get(recipeId)
    if (recipe) {
      console.log(`🔨 Crafted ${recipe.name}`)
      return {
        success: true,
        item: recipe.result,
        experience: 25
      }
    }
    return { success: false, message: 'Recipe not found' }
  }

  getAvailableRecipes() {
    return Array.from(this.recipes.values())
  }
}

// Main Procedural Game Manager
export class ProceduralGameManager {
  constructor(babylonEngine) {
    this.engine = babylonEngine
    this.playerManager = new ProceduralPlayerManager()
    this.skillSystem = new ProceduralSkillSystem()
    this.storySystem = new ProceduralStorySystem()
    this.resourceSystem = new ProceduralResourceSystem()
    
    console.log('🎮 Procedural Game Systems Initialized')
  }

  initializePlayer(playerData) {
    const player = this.playerManager.createPlayer(playerData)
    
    // Generate initial quest
    this.storySystem.generateRandomQuest(player.level)
    
    console.log(`👤 Player created: ${player.name} (${player.element.name} Element)`)
    return player
  }

  update() {
    // Update any time-based systems
    // This can be expanded for buffs, quests, etc.
  }

  // Event handlers for common game actions
  onPlayerAction(action, data = {}) {
    switch (action) {
      case 'move':
        this.playerManager.updatePlayerPosition(data.playerId, data.position)
        break
      case 'use_skill':
        return this.skillSystem.useSkill(data.skillId, data.elementId)
      case 'gather_resource':
        return this.resourceSystem.gatherResource(data.resourceId, data.amount)
      case 'craft_item':
        return this.resourceSystem.craftItem(data.recipeId)
      case 'gain_experience':
        return this.playerManager.addExperience(data.playerId, data.amount)
      default:
        console.log(`Unknown action: ${action}`)
    }
  }

  // Get game state for UI updates
  getGameState() {
    const currentPlayer = this.playerManager.getPlayer(this.playerManager.currentPlayerId)
    return {
      player: currentPlayer,
      activeQuests: this.storySystem.getActiveQuests(),
      storyProgress: this.storySystem.getStoryProgress(),
      availableSkills: this.skillSystem.getElementalSkills(currentPlayer?.element?.id),
      availableRecipes: this.resourceSystem.getAvailableRecipes()
    }
  }
}

export default ProceduralGameManager