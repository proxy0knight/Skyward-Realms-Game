import { useEffect, useRef } from 'react'
import GameEngine from '../lib/GameEngine'
import PlayerManager from '../lib/PlayerManager'
import WorldManager from '../lib/WorldManager'
import CombatSystem from '../lib/CombatSystem'
import SkillManager from '../lib/SkillManager'
import ExplorationSystem from '../lib/ExplorationSystem'
import ResourceManager from '../lib/ResourceManager'
import StorySystem from '../lib/StorySystem'

const GameScene = ({ player, onPlayerUpdate, onDialogueOpen, onQuestUpdate }) => {
  const mountRef = useRef(null)
  const gameEngineRef = useRef(null)
  const playerManagerRef = useRef(null)
  const worldManagerRef = useRef(null)
  const combatSystemRef = useRef(null)
  const skillManagerRef = useRef(null)
  const explorationSystemRef = useRef(null)
  const resourceManagerRef = useRef(null)
  const storySystemRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Initialize game engine
    const gameEngine = new GameEngine()
    gameEngineRef.current = gameEngine
    
    if (!gameEngine.init(mountRef.current)) {
      console.error('Failed to initialize game engine')
      return
    }

    // Initialize player manager
    const playerManager = new PlayerManager(gameEngine)
    playerManagerRef.current = playerManager
    
    // Load or create player
    let playerData = playerManager.loadPlayerData()
    if (!playerData) {
      playerData = playerManager.createPlayer(player)
    } else {
      // Update with current player data
      playerManager.updatePlayer('local_player', player)
    }

    // Create player in 3D world
    gameEngine.createPlayer(playerData)

    // Initialize world manager
    const worldManager = new WorldManager(gameEngine)
    worldManagerRef.current = worldManager
    worldManager.init()

    // Initialize combat system
    const combatSystem = new CombatSystem(gameEngine, playerManager)
    combatSystemRef.current = combatSystem

    // Initialize skill manager
    const skillManager = new SkillManager(playerManager, combatSystem)
    skillManagerRef.current = skillManager

    // Initialize exploration system
    const explorationSystem = new ExplorationSystem(gameEngine, playerManager, worldManager)
    explorationSystemRef.current = explorationSystem
    explorationSystem.loadExplorationData()

    // Initialize resource manager
    const resourceManager = new ResourceManager(playerManager, worldManager)
    resourceManagerRef.current = resourceManager

    // Initialize story system
    const storySystem = new StorySystem(gameEngine, playerManager, worldManager)
    storySystemRef.current = storySystem
    storySystem.loadStoryProgress()
    storySystem.autoStartInitialQuest()

    // Apply passive effects
    skillManager.applyPassiveEffects('local_player')

    // Set up event listeners
    gameEngine.on('keydown', (event) => {
      handleKeyDown(event, gameEngine, playerManager, worldManager, combatSystem, skillManager, explorationSystem, resourceManager, storySystem)
    })

    gameEngine.on('update', (deltaTime) => {
      worldManager.update(deltaTime)
      skillManager.updateBuffs()
      explorationSystem.update(deltaTime)
      
      // Update player stats in UI
      if (onPlayerUpdate) {
        const updatedPlayer = playerManager.getLocalPlayer()
        onPlayerUpdate(updatedPlayer)
      }

      // Update quest info in UI
      if (onQuestUpdate) {
        const activeQuests = storySystem.getActiveQuests()
        const storyProgress = storySystem.getStoryProgress()
        onQuestUpdate({ activeQuests, storyProgress })
      }
    })

    // Start the game
    gameEngine.start()

    // Cleanup function
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose()
      }
      if (worldManagerRef.current) {
        worldManagerRef.current.dispose()
      }
      if (combatSystemRef.current) {
        combatSystemRef.current.dispose()
      }
      if (skillManagerRef.current) {
        skillManagerRef.current.dispose()
      }
      if (explorationSystemRef.current) {
        explorationSystemRef.current.dispose()
      }
      if (resourceManagerRef.current) {
        resourceManagerRef.current.dispose()
      }
      if (storySystemRef.current) {
        storySystemRef.current.dispose()
      }
    }
  }, [player, onPlayerUpdate, onDialogueOpen, onQuestUpdate])

  // Handle keyboard input
  const handleKeyDown = (event, gameEngine, playerManager, worldManager, combatSystem, skillManager, explorationSystem, resourceManager, storySystem) => {
    const player = gameEngine.player
    if (!player) return

    switch (event.code) {
      case 'KeyE':
        // Interact with nearby objects
        const nearby = worldManager.getNearbyObjects(player.position, 3)
        const explorationNearby = explorationSystem.getNearbyInteractables(player.position, 3)
        const allNearby = [...nearby, ...explorationNearby]
        
        if (allNearby.length > 0) {
          const closest = allNearby.sort((a, b) => a.distance - b.distance)[0]
          
          if (closest.type === 'resource') {
            const resourceData = worldManager.collectResource(closest.id, 'local_player')
            if (resourceData) {
              playerManager.addItem('local_player', resourceData)
              console.log(`Collected: ${resourceData.name}`)
              
              // Update quest progress for collection objectives
              const activeQuests = storySystem.getActiveQuests()
              activeQuests.forEach(quest => {
                quest.objectives.forEach(objective => {
                  if (objective.id === 'collect_crystals' && !objective.completed) {
                    storySystem.updateQuestProgress(quest.id, 'collect_crystals', 1)
                  }
                })
              })
            }
          } else if (closest.type === 'npc') {
            const dialogue = worldManager.interactWithNPC(closest.id)
            if (dialogue) {
              console.log(`${dialogue.npcName}: ${dialogue.message}`)
              
              // Check if this is a story character
              const characterDialogue = storySystem.getCharacterDialogue('eldric')
              if (characterDialogue && onDialogueOpen) {
                onDialogueOpen(characterDialogue, 'eldric')
              }
            }
          } else if (closest.type === 'secret') {
            const secretResult = explorationSystem.interactWithSecret(closest.id)
            if (secretResult) {
              console.log(`Secret discovered: ${secretResult.message}`)
            }
          } else if (closest.type === 'quest_marker') {
            console.log(`Quest: ${closest.questData.name} (${closest.questData.type})`)
          }
        }
        break
        
      case 'KeyH':
        // Use healing item
        const healingItems = playerManager.getLocalPlayer().inventory.items.filter(
          item => item.type === 'consumable' && item.name.includes('شفاء')
        )
        if (healingItems.length > 0) {
          const healAmount = playerManager.healPlayer('local_player', 25)
          if (healAmount > 0) {
            playerManager.removeItem('local_player', healingItems[0].id, 1)
            console.log(`Healed for ${healAmount} HP`)
          }
        }
        break
        
      case 'KeyT':
        // Test experience gain
        const result = playerManager.addExperience('local_player', 100)
        if (result.leveledUp) {
          console.log(`Level up! New level: ${result.newLevel}`)
          // Reapply passive effects after level up
          skillManager.applyPassiveEffects('local_player')
        }
        break

      case 'KeyR':
        // Test skill upgrade
        const localPlayer = playerManager.getLocalPlayer()
        if (localPlayer && localPlayer.element && localPlayer.skills.availablePoints > 0) {
          const element = localPlayer.element.id
          const availableSkills = skillManager.getAvailableSkills('local_player', element)
          const upgradableSkill = availableSkills.find(skill => skill.canUpgrade)
          
          if (upgradableSkill) {
            const upgradeResult = skillManager.upgradeSkill('local_player', element, upgradableSkill.id)
            console.log(upgradeResult.message)
            
            if (upgradeResult.success) {
              skillManager.applyPassiveEffects('local_player')
              
              // Update quest progress for skill learning
              const activeQuests = storySystem.getActiveQuests()
              activeQuests.forEach(quest => {
                quest.objectives.forEach(objective => {
                  if (objective.id === 'learn_movement' && !objective.completed) {
                    storySystem.updateQuestProgress(quest.id, 'learn_movement')
                  }
                })
              })
            }
          }
        }
        break

      case 'KeyC':
        // Test crafting
        const availableRecipes = resourceManager.getAvailableRecipes('local_player')
        const craftableRecipe = availableRecipes.find(recipe => recipe.canCraft)
        
        if (craftableRecipe) {
          const craftResult = resourceManager.craftItem('local_player', craftableRecipe.id)
          console.log(craftResult.message)
        } else {
          console.log('لا توجد وصفات قابلة للصنع')
        }
        break

      case 'KeyG':
        // Show exploration stats
        const explorationStats = explorationSystem.getExplorationStats()
        console.log('إحصائيات الاستكشاف:', explorationStats)
        
        const currentArea = explorationSystem.getCurrentArea(player.position)
        console.log('المنطقة الحالية:', currentArea)
        break

      case 'KeyV':
        // Show inventory value and crafting stats
        const craftingStats = resourceManager.getCraftingStats('local_player')
        console.log('إحصائيات الصناعة:', craftingStats)
        break

      case 'KeyQ':
        // Show quest log
        const activeQuests = storySystem.getActiveQuests()
        const storyProgress = storySystem.getStoryProgress()
        console.log('المهام النشطة:', activeQuests)
        console.log('تقدم القصة:', storyProgress)
        break

      case 'KeyN':
        // Test quest completion
        const testQuest = storySystem.getActiveQuests()[0]
        if (testQuest) {
          // Complete first objective
          const firstIncompleteObjective = testQuest.objectives.find(obj => !obj.completed)
          if (firstIncompleteObjective) {
            storySystem.updateQuestProgress(testQuest.id, firstIncompleteObjective.id)
            console.log(`تم إنجاز هدف: ${firstIncompleteObjective.text}`)
          }
        }
        break

      // Combat skills are handled by CombatSystem
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
        // Update quest progress for skill usage
        const activeQuestsForSkill = storySystem.getActiveQuests()
        activeQuestsForSkill.forEach(quest => {
          quest.objectives.forEach(objective => {
            if (objective.id === 'use_basic_skill' && !objective.completed) {
              storySystem.updateQuestProgress(quest.id, 'use_basic_skill', 1)
            }
          })
        })
        break
    }
  }

  return <div ref={mountRef} className="absolute inset-0" />
}

export default GameScene

