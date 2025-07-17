export class ResourceManager {
  constructor(playerManager, worldManager) {
    this.playerManager = playerManager
    this.worldManager = worldManager
    this.resourceNodes = new Map()
    this.craftingRecipes = new Map()
    this.resourceTypes = new Map()
    this.gatheringTools = new Map()
    
    this.initializeResourceTypes()
    this.initializeCraftingRecipes()
    this.initializeGatheringTools()
  }

  // Initialize resource types
  initializeResourceTypes() {
    const resources = {
      // Fire element resources
      fire_crystal: {
        name: 'بلورة النار',
        element: 'fire',
        rarity: 'uncommon',
        baseValue: 50,
        description: 'بلورة متوهجة تحتوي على طاقة النار الخالصة',
        uses: ['crafting', 'enhancement', 'alchemy']
      },
      lava_stone: {
        name: 'حجر الحمم',
        element: 'fire',
        rarity: 'common',
        baseValue: 20,
        description: 'حجر صلب تشكل من الحمم البركانية',
        uses: ['crafting', 'building']
      },
      phoenix_feather: {
        name: 'ريشة العنقاء',
        element: 'fire',
        rarity: 'legendary',
        baseValue: 500,
        description: 'ريشة نادرة من طائر العنقاء الأسطوري',
        uses: ['crafting', 'enhancement', 'resurrection']
      },
      
      // Water element resources
      water_crystal: {
        name: 'بلورة الماء',
        element: 'water',
        rarity: 'uncommon',
        baseValue: 45,
        description: 'بلورة زرقاء صافية تحتوي على جوهر الماء',
        uses: ['crafting', 'healing', 'alchemy']
      },
      sea_pearl: {
        name: 'لؤلؤة البحر',
        element: 'water',
        rarity: 'rare',
        baseValue: 150,
        description: 'لؤلؤة نادرة من أعماق المحيط السحري',
        uses: ['crafting', 'enhancement', 'jewelry']
      },
      eternal_ice: {
        name: 'جليد أبدي',
        element: 'water',
        rarity: 'epic',
        baseValue: 300,
        description: 'جليد لا يذوب أبداً، مشبع بالطاقة السحرية',
        uses: ['crafting', 'preservation', 'enhancement']
      },
      
      // Earth element resources
      earth_crystal: {
        name: 'بلورة الأرض',
        element: 'earth',
        rarity: 'uncommon',
        baseValue: 40,
        description: 'بلورة بنية صلبة تحتوي على قوة الأرض',
        uses: ['crafting', 'fortification', 'alchemy']
      },
      iron_ore: {
        name: 'خام الحديد',
        element: 'earth',
        rarity: 'common',
        baseValue: 15,
        description: 'خام معدني أساسي لصناعة الأدوات والأسلحة',
        uses: ['crafting', 'smithing']
      },
      diamond_shard: {
        name: 'شظية الماس',
        element: 'earth',
        rarity: 'epic',
        baseValue: 400,
        description: 'شظية من أنقى أنواع الماس في العالم',
        uses: ['crafting', 'enhancement', 'cutting']
      },
      
      // Air element resources
      air_crystal: {
        name: 'بلورة الهواء',
        element: 'air',
        rarity: 'uncommon',
        baseValue: 55,
        description: 'بلورة شفافة خفيفة تحتوي على جوهر الرياح',
        uses: ['crafting', 'levitation', 'alchemy']
      },
      wind_essence: {
        name: 'جوهر الرياح',
        element: 'air',
        rarity: 'rare',
        baseValue: 120,
        description: 'جوهر مركز من طاقة الرياح النقية',
        uses: ['crafting', 'enhancement', 'flight']
      },
      storm_core: {
        name: 'نواة العاصفة',
        element: 'air',
        rarity: 'legendary',
        baseValue: 600,
        description: 'نواة طاقة من قلب عاصفة سحرية عظيمة',
        uses: ['crafting', 'weather_control', 'enhancement']
      },
      
      // Neutral resources
      mana_crystal: {
        name: 'بلورة الطاقة',
        element: 'neutral',
        rarity: 'rare',
        baseValue: 200,
        description: 'بلورة تحتوي على طاقة سحرية خالصة',
        uses: ['crafting', 'mana_restoration', 'enhancement']
      },
      ancient_wood: {
        name: 'خشب قديم',
        element: 'neutral',
        rarity: 'uncommon',
        baseValue: 60,
        description: 'خشب من أشجار عمرها آلاف السنين',
        uses: ['crafting', 'building', 'enchanting']
      },
      mystic_herb: {
        name: 'عشبة سحرية',
        element: 'neutral',
        rarity: 'common',
        baseValue: 25,
        description: 'عشبة طبية ذات خصائص سحرية',
        uses: ['alchemy', 'healing', 'cooking']
      }
    }

    Object.entries(resources).forEach(([id, resource]) => {
      this.resourceTypes.set(id, { id, ...resource })
    })
  }

  // Initialize crafting recipes
  initializeCraftingRecipes() {
    const recipes = {
      // Weapons
      fire_sword: {
        name: 'سيف النار',
        type: 'weapon',
        element: 'fire',
        rarity: 'rare',
        requirements: {
          fire_crystal: 3,
          iron_ore: 5,
          ancient_wood: 2
        },
        result: {
          name: 'سيف النار',
          type: 'weapon',
          rarity: 'rare',
          stats: { damage: 75, fireBonus: 25 },
          quantity: 1
        },
        craftingTime: 300000, // 5 minutes
        requiredLevel: 10
      },
      
      water_staff: {
        name: 'عصا الماء',
        type: 'weapon',
        element: 'water',
        rarity: 'rare',
        requirements: {
          water_crystal: 4,
          ancient_wood: 3,
          sea_pearl: 1
        },
        result: {
          name: 'عصا الماء',
          type: 'weapon',
          rarity: 'rare',
          stats: { damage: 60, healingBonus: 40 },
          quantity: 1
        },
        craftingTime: 300000,
        requiredLevel: 12
      },
      
      // Armor
      earth_armor: {
        name: 'درع الأرض',
        type: 'armor',
        element: 'earth',
        rarity: 'epic',
        requirements: {
          earth_crystal: 5,
          iron_ore: 8,
          diamond_shard: 2
        },
        result: {
          name: 'درع الأرض',
          type: 'armor',
          rarity: 'epic',
          stats: { defense: 100, earthResistance: 50 },
          quantity: 1
        },
        craftingTime: 600000, // 10 minutes
        requiredLevel: 15
      },
      
      // Consumables
      healing_potion: {
        name: 'جرعة الشفاء',
        type: 'consumable',
        element: 'neutral',
        rarity: 'common',
        requirements: {
          mystic_herb: 2,
          water_crystal: 1
        },
        result: {
          name: 'جرعة الشفاء',
          type: 'consumable',
          rarity: 'common',
          effect: { healing: 100 },
          quantity: 3
        },
        craftingTime: 60000, // 1 minute
        requiredLevel: 5
      },
      
      mana_potion: {
        name: 'جرعة الطاقة',
        type: 'consumable',
        element: 'neutral',
        rarity: 'uncommon',
        requirements: {
          mana_crystal: 1,
          mystic_herb: 1,
          air_crystal: 1
        },
        result: {
          name: 'جرعة الطاقة',
          type: 'consumable',
          rarity: 'uncommon',
          effect: { manaRestore: 80 },
          quantity: 2
        },
        craftingTime: 120000, // 2 minutes
        requiredLevel: 8
      },
      
      // Enhancement materials
      enhancement_stone: {
        name: 'حجر التعزيز',
        type: 'enhancement',
        element: 'neutral',
        rarity: 'rare',
        requirements: {
          fire_crystal: 1,
          water_crystal: 1,
          earth_crystal: 1,
          air_crystal: 1,
          mana_crystal: 2
        },
        result: {
          name: 'حجر التعزيز',
          type: 'enhancement',
          rarity: 'rare',
          effect: { enhancementLevel: 1 },
          quantity: 1
        },
        craftingTime: 900000, // 15 minutes
        requiredLevel: 20
      }
    }

    Object.entries(recipes).forEach(([id, recipe]) => {
      this.craftingRecipes.set(id, { id, ...recipe })
    })
  }

  // Initialize gathering tools
  initializeGatheringTools() {
    const tools = {
      basic_pickaxe: {
        name: 'معول أساسي',
        type: 'mining',
        efficiency: 1.0,
        durability: 100,
        canGather: ['iron_ore', 'earth_crystal', 'diamond_shard']
      },
      crystal_pickaxe: {
        name: 'معول بلوري',
        type: 'mining',
        efficiency: 1.5,
        durability: 200,
        canGather: ['iron_ore', 'earth_crystal', 'diamond_shard', 'mana_crystal']
      },
      basic_sickle: {
        name: 'منجل أساسي',
        type: 'harvesting',
        efficiency: 1.0,
        durability: 80,
        canGather: ['mystic_herb', 'ancient_wood']
      },
      enchanted_sickle: {
        name: 'منجل مسحور',
        type: 'harvesting',
        efficiency: 1.3,
        durability: 150,
        canGather: ['mystic_herb', 'ancient_wood', 'wind_essence']
      }
    }

    Object.entries(tools).forEach(([id, tool]) => {
      this.gatheringTools.set(id, { id, ...tool })
    })
  }

  // Get resource type info
  getResourceType(resourceId) {
    return this.resourceTypes.get(resourceId)
  }

  // Get all resource types by element
  getResourcesByElement(element) {
    const resources = []
    this.resourceTypes.forEach(resource => {
      if (resource.element === element || element === 'all') {
        resources.push(resource)
      }
    })
    return resources
  }

  // Get crafting recipe
  getCraftingRecipe(recipeId) {
    return this.craftingRecipes.get(recipeId)
  }

  // Get all available recipes for player
  getAvailableRecipes(playerId) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return []

    const availableRecipes = []
    this.craftingRecipes.forEach(recipe => {
      if (player.level >= recipe.requiredLevel) {
        const canCraft = this.canCraftItem(playerId, recipe.id)
        availableRecipes.push({
          ...recipe,
          canCraft: canCraft.canCraft,
          missingMaterials: canCraft.missingMaterials
        })
      }
    })

    return availableRecipes
  }

  // Check if player can craft item
  canCraftItem(playerId, recipeId) {
    const player = this.playerManager.getPlayer(playerId)
    const recipe = this.craftingRecipes.get(recipeId)
    
    if (!player || !recipe) {
      return { canCraft: false, reason: 'وصفة أو لاعب غير موجود' }
    }

    if (player.level < recipe.requiredLevel) {
      return { canCraft: false, reason: `يتطلب مستوى ${recipe.requiredLevel}` }
    }

    const inventory = player.inventory
    const missingMaterials = []

    Object.entries(recipe.requirements).forEach(([materialId, requiredAmount]) => {
      const playerItem = inventory.items.find(item => 
        item.name === this.getResourceType(materialId)?.name
      )
      
      const availableAmount = playerItem?.quantity || 0
      if (availableAmount < requiredAmount) {
        const resourceType = this.getResourceType(materialId)
        missingMaterials.push({
          id: materialId,
          name: resourceType?.name || materialId,
          required: requiredAmount,
          available: availableAmount,
          missing: requiredAmount - availableAmount
        })
      }
    })

    return {
      canCraft: missingMaterials.length === 0,
      missingMaterials,
      reason: missingMaterials.length > 0 ? 'مواد غير كافية' : null
    }
  }

  // Craft item
  craftItem(playerId, recipeId) {
    const canCraft = this.canCraftItem(playerId, recipeId)
    if (!canCraft.canCraft) {
      return { success: false, message: canCraft.reason }
    }

    const player = this.playerManager.getPlayer(playerId)
    const recipe = this.craftingRecipes.get(recipeId)
    
    // Remove required materials
    Object.entries(recipe.requirements).forEach(([materialId, requiredAmount]) => {
      const resourceType = this.getResourceType(materialId)
      const playerItem = player.inventory.items.find(item => 
        item.name === resourceType.name
      )
      
      if (playerItem) {
        if (playerItem.quantity > requiredAmount) {
          playerItem.quantity -= requiredAmount
        } else {
          const itemIndex = player.inventory.items.indexOf(playerItem)
          player.inventory.items.splice(itemIndex, 1)
        }
      }
    })

    // Add crafted item
    const craftedItem = {
      ...recipe.result,
      id: Date.now(),
      craftedAt: Date.now()
    }

    this.playerManager.addItem(playerId, craftedItem)
    
    // Give crafting experience
    const expGain = recipe.rarity === 'legendary' ? 200 : 
                   recipe.rarity === 'epic' ? 150 :
                   recipe.rarity === 'rare' ? 100 : 50
    this.playerManager.addExperience(playerId, expGain)

    console.log(`تم صنع ${recipe.name} بنجاح!`)
    
    return { 
      success: true, 
      message: `تم صنع ${recipe.name} بنجاح!`,
      item: craftedItem,
      experienceGained: expGain
    }
  }

  // Gather resource
  gatherResource(playerId, resourceNodeId, toolId = null) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return { success: false, message: 'لاعب غير موجود' }

    // Get resource node from world
    const resourceNode = this.worldManager.resources.get(resourceNodeId)
    if (!resourceNode) {
      return { success: false, message: 'مورد غير موجود' }
    }

    const resourceType = this.getResourceType(resourceNode.userData.element + '_crystal')
    if (!resourceType) {
      return { success: false, message: 'نوع مورد غير معروف' }
    }

    // Check if player has appropriate tool
    let efficiency = 1.0
    let canGather = true

    if (toolId) {
      const tool = this.gatheringTools.get(toolId)
      if (tool) {
        if (tool.canGather.includes(resourceType.id)) {
          efficiency = tool.efficiency
        } else {
          canGather = false
        }
      }
    }

    if (!canGather) {
      return { success: false, message: 'أداة غير مناسبة لهذا المورد' }
    }

    // Calculate gathered amount
    const baseAmount = resourceNode.userData.quantity || 1
    const gatheredAmount = Math.max(1, Math.floor(baseAmount * efficiency))
    
    // Create gathered item
    const gatheredItem = {
      name: resourceType.name,
      type: 'material',
      rarity: resourceType.rarity,
      quantity: gatheredAmount,
      element: resourceType.element
    }

    // Add to inventory
    const addResult = this.playerManager.addItem(playerId, gatheredItem)
    if (!addResult) {
      return { success: false, message: 'المخزون ممتلئ' }
    }

    // Give gathering experience
    const expGain = gatheredAmount * (resourceType.rarity === 'legendary' ? 50 :
                                     resourceType.rarity === 'epic' ? 30 :
                                     resourceType.rarity === 'rare' ? 20 : 10)
    this.playerManager.addExperience(playerId, expGain)

    console.log(`تم جمع ${gatheredAmount}x ${resourceType.name}`)

    return {
      success: true,
      message: `تم جمع ${gatheredAmount}x ${resourceType.name}`,
      item: gatheredItem,
      experienceGained: expGain
    }
  }

  // Get resource value
  getResourceValue(resourceId, quantity = 1) {
    const resourceType = this.getResourceType(resourceId)
    if (!resourceType) return 0

    return resourceType.baseValue * quantity
  }

  // Get total inventory value
  getInventoryValue(playerId) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return 0

    let totalValue = player.inventory.gold || 0

    player.inventory.items.forEach(item => {
      // Try to find matching resource type
      const resourceType = Array.from(this.resourceTypes.values()).find(
        resource => resource.name === item.name
      )
      
      if (resourceType) {
        totalValue += resourceType.baseValue * (item.quantity || 1)
      }
    })

    return totalValue
  }

  // Sell resource
  sellResource(playerId, itemId, quantity = 1) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return { success: false, message: 'لاعب غير موجود' }

    const item = player.inventory.items.find(i => i.id === itemId)
    if (!item) {
      return { success: false, message: 'عنصر غير موجود' }
    }

    if (item.quantity < quantity) {
      return { success: false, message: 'كمية غير كافية' }
    }

    // Find resource type
    const resourceType = Array.from(this.resourceTypes.values()).find(
      resource => resource.name === item.name
    )

    if (!resourceType) {
      return { success: false, message: 'لا يمكن بيع هذا العنصر' }
    }

    // Calculate sell price (80% of base value)
    const sellPrice = Math.floor(resourceType.baseValue * quantity * 0.8)

    // Remove item
    if (item.quantity > quantity) {
      item.quantity -= quantity
    } else {
      const itemIndex = player.inventory.items.indexOf(item)
      player.inventory.items.splice(itemIndex, 1)
    }

    // Add gold
    player.inventory.gold += sellPrice
    this.playerManager.savePlayerData()

    console.log(`تم بيع ${quantity}x ${item.name} مقابل ${sellPrice} ذهب`)

    return {
      success: true,
      message: `تم بيع ${quantity}x ${item.name} مقابل ${sellPrice} ذهب`,
      goldEarned: sellPrice
    }
  }

  // Get crafting statistics
  getCraftingStats(playerId) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return null

    const availableRecipes = this.getAvailableRecipes(playerId)
    const craftableRecipes = availableRecipes.filter(recipe => recipe.canCraft)

    return {
      totalRecipes: this.craftingRecipes.size,
      availableRecipes: availableRecipes.length,
      craftableRecipes: craftableRecipes.length,
      inventoryValue: this.getInventoryValue(playerId),
      uniqueResources: new Set(
        player.inventory.items.map(item => item.name)
      ).size
    }
  }

  // Cleanup
  dispose() {
    this.resourceNodes.clear()
    this.craftingRecipes.clear()
    this.resourceTypes.clear()
    this.gatheringTools.clear()
    console.log('Resource Manager disposed')
  }
}

export default ResourceManager

