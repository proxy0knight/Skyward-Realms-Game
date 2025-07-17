export class SkillManager {
  constructor(playerManager, combatSystem) {
    this.playerManager = playerManager
    this.combatSystem = combatSystem
    this.skillTrees = this.initializeSkillTrees()
    this.activeBuffs = new Map()
    this.passiveEffects = new Map()
  }

  // Initialize skill trees for all elements
  initializeSkillTrees() {
    return {
      fire: {
        name: 'شجرة النار',
        description: 'عنصر الهجوم المباشر والقوة التدميرية',
        skills: {
          fireball: {
            name: 'كرة النار',
            description: 'يطلق كرة نارية تلحق ضرراً بالأعداء',
            maxLevel: 5,
            requirements: {},
            effects: {
              1: { damage: 50, manaCost: 20, cooldown: 3000 },
              2: { damage: 60, manaCost: 20, cooldown: 2800 },
              3: { damage: 70, manaCost: 20, cooldown: 2600 },
              4: { damage: 80, manaCost: 20, cooldown: 2400 },
              5: { damage: 100, manaCost: 20, cooldown: 2000 }
            }
          },
          flame_shield: {
            name: 'درع اللهب',
            description: 'يحيط اللاعب بدرع ناري يقلل الضرر ويحرق المهاجمين',
            maxLevel: 5,
            requirements: { fireball: 2 },
            effects: {
              1: { damageReduction: 20, duration: 10000, manaCost: 30 },
              2: { damageReduction: 25, duration: 12000, manaCost: 30 },
              3: { damageReduction: 30, duration: 14000, manaCost: 30 },
              4: { damageReduction: 35, duration: 16000, manaCost: 30 },
              5: { damageReduction: 50, duration: 20000, manaCost: 30 }
            }
          },
          fire_storm: {
            name: 'عاصفة نارية',
            description: 'يستدعي عاصفة نارية تلحق ضرراً بجميع الأعداء في المنطقة',
            maxLevel: 3,
            requirements: { fireball: 3, flame_shield: 2 },
            effects: {
              1: { damage: 80, radius: 8, manaCost: 50, cooldown: 20000 },
              2: { damage: 100, radius: 10, manaCost: 50, cooldown: 18000 },
              3: { damage: 120, radius: 12, manaCost: 50, cooldown: 15000 }
            }
          },
          phoenix_form: {
            name: 'شكل العنقاء',
            description: 'يتحول اللاعب إلى عنقاء ناري مع قدرات خاصة',
            maxLevel: 1,
            requirements: { fire_storm: 1, flame_shield: 3 },
            effects: {
              1: { duration: 15000, manaCost: 100, cooldown: 60000, abilities: ['flight', 'fire_immunity', 'enhanced_damage'] }
            }
          }
        }
      },
      water: {
        name: 'شجرة الماء',
        description: 'عنصر الشفاء والدعم والتحكم',
        skills: {
          heal: {
            name: 'الشفاء',
            description: 'يشفي اللاعب أو الحليف المستهدف',
            maxLevel: 5,
            requirements: {},
            effects: {
              1: { healing: 60, manaCost: 25, cooldown: 5000 },
              2: { healing: 75, manaCost: 25, cooldown: 4500 },
              3: { healing: 90, manaCost: 25, cooldown: 4000 },
              4: { healing: 105, manaCost: 25, cooldown: 3500 },
              5: { healing: 130, manaCost: 25, cooldown: 3000 }
            }
          },
          ice_wall: {
            name: 'جدار جليدي',
            description: 'ينشئ جداراً جليدياً يحجب الهجمات',
            maxLevel: 3,
            requirements: { heal: 2 },
            effects: {
              1: { health: 200, duration: 8000, manaCost: 40 },
              2: { health: 300, duration: 10000, manaCost: 40 },
              3: { health: 400, duration: 12000, manaCost: 40 }
            }
          },
          tsunami: {
            name: 'تسونامي',
            description: 'يستدعي موجة مائية عملاقة تجرف الأعداء',
            maxLevel: 3,
            requirements: { heal: 3, ice_wall: 2 },
            effects: {
              1: { damage: 100, range: 15, manaCost: 70, cooldown: 25000 },
              2: { damage: 120, range: 18, manaCost: 70, cooldown: 22000 },
              3: { damage: 150, range: 20, manaCost: 70, cooldown: 20000 }
            }
          },
          water_mastery: {
            name: 'إتقان الماء',
            description: 'يزيد من فعالية جميع مهارات الماء',
            maxLevel: 1,
            requirements: { tsunami: 1, ice_wall: 3 },
            effects: {
              1: { healingBonus: 50, manaCostReduction: 25, cooldownReduction: 20 }
            }
          }
        }
      },
      earth: {
        name: 'شجرة الأرض',
        description: 'عنصر الدفاع والصمود والتحكم في الأرض',
        skills: {
          stone_armor: {
            name: 'درع حجري',
            description: 'يغطي اللاعب بدرع حجري يقلل الضرر',
            maxLevel: 5,
            requirements: {},
            effects: {
              1: { damageReduction: 30, duration: 12000, manaCost: 35 },
              2: { damageReduction: 35, duration: 14000, manaCost: 35 },
              3: { damageReduction: 40, duration: 16000, manaCost: 35 },
              4: { damageReduction: 45, duration: 18000, manaCost: 35 },
              5: { damageReduction: 60, duration: 25000, manaCost: 35 }
            }
          },
          earthquake: {
            name: 'زلزال',
            description: 'يهز الأرض ويلحق ضرراً بالأعداء القريبين',
            maxLevel: 3,
            requirements: { stone_armor: 2 },
            effects: {
              1: { damage: 70, radius: 6, manaCost: 45, cooldown: 18000 },
              2: { damage: 85, radius: 8, manaCost: 45, cooldown: 16000 },
              3: { damage: 100, radius: 10, manaCost: 45, cooldown: 14000 }
            }
          },
          stone_spikes: {
            name: 'أشواك حجرية',
            description: 'يستدعي أشواكاً حجرية من الأرض',
            maxLevel: 4,
            requirements: { stone_armor: 1 },
            effects: {
              1: { damage: 60, range: 10, manaCost: 30, cooldown: 8000 },
              2: { damage: 70, range: 12, manaCost: 30, cooldown: 7500 },
              3: { damage: 80, range: 14, manaCost: 30, cooldown: 7000 },
              4: { damage: 95, range: 16, manaCost: 30, cooldown: 6000 }
            }
          },
          mountain_form: {
            name: 'شكل الجبل',
            description: 'يتحول اللاعب إلى جبل منيع لا يمكن تحريكه أو إيذاؤه',
            maxLevel: 1,
            requirements: { earthquake: 2, stone_spikes: 3 },
            effects: {
              1: { duration: 20000, manaCost: 80, cooldown: 45000, abilities: ['immobile', 'damage_immunity', 'taunt'] }
            }
          }
        }
      },
      air: {
        name: 'شجرة الهواء',
        description: 'عنصر السرعة والحركة والهجمات السريعة',
        skills: {
          wind_blade: {
            name: 'شفرة الرياح',
            description: 'يطلق شفرة من الرياح المضغوطة',
            maxLevel: 5,
            requirements: {},
            effects: {
              1: { damage: 45, range: 15, manaCost: 18, cooldown: 2500 },
              2: { damage: 55, range: 16, manaCost: 18, cooldown: 2300 },
              3: { damage: 65, range: 17, manaCost: 18, cooldown: 2100 },
              4: { damage: 75, range: 18, manaCost: 18, cooldown: 1900 },
              5: { damage: 90, range: 20, manaCost: 18, cooldown: 1500 }
            }
          },
          flight: {
            name: 'الطيران',
            description: 'يمنح اللاعب القدرة على الطيران لفترة محدودة',
            maxLevel: 3,
            requirements: { wind_blade: 2 },
            effects: {
              1: { duration: 8000, speedBoost: 50, manaCost: 40, cooldown: 20000 },
              2: { duration: 10000, speedBoost: 75, manaCost: 40, cooldown: 18000 },
              3: { duration: 12000, speedBoost: 100, manaCost: 40, cooldown: 15000 }
            }
          },
          tornado: {
            name: 'إعصار',
            description: 'يستدعي إعصاراً يرفع الأعداء ويلحق بهم ضرراً مستمراً',
            maxLevel: 3,
            requirements: { wind_blade: 3, flight: 2 },
            effects: {
              1: { damage: 90, radius: 5, duration: 5000, manaCost: 60, cooldown: 22000 },
              2: { damage: 110, radius: 6, duration: 6000, manaCost: 60, cooldown: 20000 },
              3: { damage: 130, radius: 8, duration: 7000, manaCost: 60, cooldown: 18000 }
            }
          },
          wind_mastery: {
            name: 'إتقان الهواء',
            description: 'يزيد من سرعة الحركة وفعالية مهارات الهواء',
            maxLevel: 1,
            requirements: { tornado: 1, flight: 3 },
            effects: {
              1: { movementSpeed: 30, cooldownReduction: 25, manaCostReduction: 20 }
            }
          }
        }
      }
    }
  }

  // Get skill tree for element
  getSkillTree(element) {
    return this.skillTrees[element] || null
  }

  // Get skill data
  getSkillData(element, skillId) {
    const tree = this.skillTrees[element]
    return tree?.skills[skillId] || null
  }

  // Check if skill can be upgraded
  canUpgradeSkill(playerId, element, skillId) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return { canUpgrade: false, reason: 'لاعب غير موجود' }

    const skillData = this.getSkillData(element, skillId)
    if (!skillData) return { canUpgrade: false, reason: 'مهارة غير موجودة' }

    const playerSkills = player.skills.trees[element] || {}
    const currentSkill = playerSkills[skillId] || { level: 0 }

    // Check if already at max level
    if (currentSkill.level >= skillData.maxLevel) {
      return { canUpgrade: false, reason: 'المهارة في أقصى مستوى' }
    }

    // Check skill points
    if (player.skills.availablePoints <= 0) {
      return { canUpgrade: false, reason: 'لا توجد نقاط مهارات متاحة' }
    }

    // Check requirements
    for (const [reqSkill, reqLevel] of Object.entries(skillData.requirements)) {
      const playerReqSkill = playerSkills[reqSkill] || { level: 0 }
      if (playerReqSkill.level < reqLevel) {
        const reqSkillData = this.getSkillData(element, reqSkill)
        return { 
          canUpgrade: false, 
          reason: `يتطلب ${reqSkillData?.name || reqSkill} مستوى ${reqLevel}` 
        }
      }
    }

    return { canUpgrade: true }
  }

  // Upgrade skill
  upgradeSkill(playerId, element, skillId) {
    const canUpgrade = this.canUpgradeSkill(playerId, element, skillId)
    if (!canUpgrade.canUpgrade) {
      return { success: false, message: canUpgrade.reason }
    }

    const success = this.playerManager.upgradeSkill(playerId, element, skillId)
    if (success) {
      const skillData = this.getSkillData(element, skillId)
      return { 
        success: true, 
        message: `تم ترقية ${skillData.name} بنجاح!` 
      }
    }

    return { success: false, message: 'فشل في ترقية المهارة' }
  }

  // Get skill effects for current level
  getSkillEffects(element, skillId, level) {
    const skillData = this.getSkillData(element, skillId)
    if (!skillData || level <= 0) return null

    return skillData.effects[level] || null
  }

  // Apply passive effects
  applyPassiveEffects(playerId) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return

    const effects = {
      movementSpeed: 0,
      damageBonus: 0,
      healingBonus: 0,
      manaCostReduction: 0,
      cooldownReduction: 0,
      damageReduction: 0
    }

    // Check all learned skills for passive effects
    Object.entries(player.skills.trees).forEach(([element, skills]) => {
      Object.entries(skills).forEach(([skillId, skill]) => {
        if (skill.level > 0) {
          const skillEffects = this.getSkillEffects(element, skillId, skill.level)
          if (skillEffects) {
            // Apply passive bonuses
            if (skillId.includes('mastery')) {
              effects.movementSpeed += skillEffects.movementSpeed || 0
              effects.healingBonus += skillEffects.healingBonus || 0
              effects.manaCostReduction += skillEffects.manaCostReduction || 0
              effects.cooldownReduction += skillEffects.cooldownReduction || 0
            }
          }
        }
      })
    })

    this.passiveEffects.set(playerId, effects)
    return effects
  }

  // Get passive effects for player
  getPassiveEffects(playerId) {
    return this.passiveEffects.get(playerId) || {}
  }

  // Apply buff
  applyBuff(playerId, buffData) {
    const buffId = `${playerId}_${buffData.name}_${Date.now()}`
    const buff = {
      ...buffData,
      startTime: Date.now(),
      playerId
    }

    this.activeBuffs.set(buffId, buff)

    // Auto-remove buff after duration
    if (buff.duration) {
      setTimeout(() => {
        this.removeBuff(buffId)
      }, buff.duration)
    }

    return buffId
  }

  // Remove buff
  removeBuff(buffId) {
    this.activeBuffs.delete(buffId)
  }

  // Get active buffs for player
  getActiveBuffs(playerId) {
    const playerBuffs = []
    this.activeBuffs.forEach((buff, buffId) => {
      if (buff.playerId === playerId) {
        playerBuffs.push({ id: buffId, ...buff })
      }
    })
    return playerBuffs
  }

  // Update buffs (remove expired ones)
  updateBuffs() {
    const now = Date.now()
    const expiredBuffs = []

    this.activeBuffs.forEach((buff, buffId) => {
      if (buff.duration && (now - buff.startTime) >= buff.duration) {
        expiredBuffs.push(buffId)
      }
    })

    expiredBuffs.forEach(buffId => {
      this.removeBuff(buffId)
    })
  }

  // Get skill cooldown with reductions
  getSkillCooldown(playerId, element, skillId, baseLevel) {
    const skillEffects = this.getSkillEffects(element, skillId, baseLevel)
    if (!skillEffects) return 0

    const passiveEffects = this.getPassiveEffects(playerId)
    const reduction = passiveEffects.cooldownReduction || 0
    
    const baseCooldown = skillEffects.cooldown || 0
    return Math.max(500, baseCooldown * (1 - reduction / 100)) // Minimum 0.5 second cooldown
  }

  // Get skill mana cost with reductions
  getSkillManaCost(playerId, element, skillId, baseLevel) {
    const skillEffects = this.getSkillEffects(element, skillId, baseLevel)
    if (!skillEffects) return 0

    const passiveEffects = this.getPassiveEffects(playerId)
    const reduction = passiveEffects.manaCostReduction || 0
    
    const baseCost = skillEffects.manaCost || 0
    return Math.max(1, Math.floor(baseCost * (1 - reduction / 100))) // Minimum 1 mana
  }

  // Get all available skills for element
  getAvailableSkills(playerId, element) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return []

    const tree = this.getSkillTree(element)
    if (!tree) return []

    const playerSkills = player.skills.trees[element] || {}
    const availableSkills = []

    Object.entries(tree.skills).forEach(([skillId, skillData]) => {
      const playerSkill = playerSkills[skillId] || { level: 0 }
      const canUpgrade = this.canUpgradeSkill(playerId, element, skillId)
      
      availableSkills.push({
        id: skillId,
        name: skillData.name,
        description: skillData.description,
        currentLevel: playerSkill.level,
        maxLevel: skillData.maxLevel,
        canUpgrade: canUpgrade.canUpgrade,
        upgradeReason: canUpgrade.reason,
        requirements: skillData.requirements,
        effects: skillData.effects
      })
    })

    return availableSkills
  }

  // Reset skills for element
  resetSkills(playerId, element) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return false

    const playerSkills = player.skills.trees[element] || {}
    let pointsToRefund = 0

    // Count points to refund
    Object.values(playerSkills).forEach(skill => {
      pointsToRefund += skill.level || 0
    })

    // Reset skills
    player.skills.trees[element] = {}
    player.skills.availablePoints += pointsToRefund

    this.playerManager.savePlayerData()
    return true
  }

  // Get skill tree progress
  getSkillTreeProgress(playerId, element) {
    const player = this.playerManager.getPlayer(playerId)
    if (!player) return { totalSkills: 0, learnedSkills: 0, totalLevels: 0, currentLevels: 0 }

    const tree = this.getSkillTree(element)
    if (!tree) return { totalSkills: 0, learnedSkills: 0, totalLevels: 0, currentLevels: 0 }

    const playerSkills = player.skills.trees[element] || {}
    
    let totalSkills = 0
    let learnedSkills = 0
    let totalLevels = 0
    let currentLevels = 0

    Object.entries(tree.skills).forEach(([skillId, skillData]) => {
      totalSkills++
      totalLevels += skillData.maxLevel

      const playerSkill = playerSkills[skillId] || { level: 0 }
      if (playerSkill.level > 0) {
        learnedSkills++
      }
      currentLevels += playerSkill.level
    })

    return {
      totalSkills,
      learnedSkills,
      totalLevels,
      currentLevels,
      progress: totalLevels > 0 ? (currentLevels / totalLevels) * 100 : 0
    }
  }

  // Cleanup
  dispose() {
    this.activeBuffs.clear()
    this.passiveEffects.clear()
    console.log('Skill Manager disposed')
  }
}

export default SkillManager

