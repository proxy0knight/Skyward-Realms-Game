import { useEffect, useRef, useState } from 'react'
import GameEngine from '../lib/GameEngine'
import PlayerManager from '../lib/PlayerManager'
import WorldManager from '../lib/WorldManager'
import CombatSystem from '../lib/CombatSystem'
import SkillManager from '../lib/SkillManager'
import ExplorationSystem from '../lib/ExplorationSystem'
import ResourceManager from '../lib/ResourceManager'
import StorySystem from '../lib/StorySystem'

const GameScene = ({ player, onPlayerUpdate, onDialogueOpen, onQuestUpdate, onGameEngineReady }) => {
  const mountRef = useRef(null)
  const gameEngineRef = useRef(null)
  const playerManagerRef = useRef(null)
  const worldManagerRef = useRef(null)
  const combatSystemRef = useRef(null)
  const skillManagerRef = useRef(null)
  const explorationSystemRef = useRef(null)
  const resourceManagerRef = useRef(null)
  const storySystemRef = useRef(null)
  const [gameStats, setGameStats] = useState({ 
    fps: 0, 
    playerPosition: { x: 0, y: 0, z: 0 },
    cameraRotation: { y: 0, x: 0 }
  })
  const isInitializedRef = useRef(false)
  const [mouseLocked, setMouseLocked] = useState(false)

  useEffect(() => {
    console.log('GameScene: Initializing 3D game...')
    console.log('GameScene: Player data:', player)
    
    if (!mountRef.current) {
      console.error('GameScene: Mount ref is null')
      return
    }

    // Prevent multiple initializations
    if (isInitializedRef.current || gameEngineRef.current) {
      console.log('GameScene: Already initialized, skipping...')
      return
    }
    
    // Mark as initializing to prevent race conditions
    isInitializedRef.current = true

    // Test container dimensions
    const containerRect = mountRef.current.getBoundingClientRect()
    console.log('GameScene: Container dimensions:', {
      width: containerRect.width,
      height: containerRect.height,
      top: containerRect.top,
      left: containerRect.left
    })

    // Async initialization function
    const initializeGame = async () => {
      try {
        // Initialize game engine
        console.log('GameScene: Creating GameEngine...')
        const gameEngine = new GameEngine()
        gameEngineRef.current = gameEngine
        
        console.log('GameScene: Initializing GameEngine...')
        const initSuccess = await gameEngine.init(mountRef.current)
        if (!initSuccess) {
          console.error('GameScene: Failed to initialize game engine')
          return
        }
        console.log('GameScene: GameEngine initialized successfully')

      // Initialize player manager
      console.log('GameScene: Creating PlayerManager...')
      const playerManager = new PlayerManager(gameEngine)
      playerManagerRef.current = playerManager
      
      // Load or create player
      let playerData = playerManager.loadPlayerData()
      if (!playerData) {
        console.log('GameScene: Creating new player...')
        playerData = playerManager.createPlayer(player)
      } else {
        console.log('GameScene: Updating existing player...')
        // Update with current player data
        playerManager.updatePlayer('local_player', player)
      }

      // Create player in 3D world
      console.log('GameScene: Creating player in 3D world...')
      const playerMesh = await gameEngine.createPlayer(playerData)
      console.log('GameScene: Player created:', playerMesh)

      // Initialize world manager
      console.log('GameScene: Creating WorldManager...')
      const worldManager = new WorldManager(gameEngine)
      worldManagerRef.current = worldManager
      worldManager.init()

      // Initialize combat system
      console.log('GameScene: Creating CombatSystem...')
      const combatSystem = new CombatSystem(gameEngine, playerManager)
      combatSystemRef.current = combatSystem

      // Initialize skill manager
      console.log('GameScene: Creating SkillManager...')
      const skillManager = new SkillManager(playerManager, combatSystem)
      skillManagerRef.current = skillManager

      // Initialize exploration system
      console.log('GameScene: Creating ExplorationSystem...')
      const explorationSystem = new ExplorationSystem(gameEngine, playerManager, worldManager)
      explorationSystemRef.current = explorationSystem
      explorationSystem.loadExplorationData()

      // Initialize resource manager
      console.log('GameScene: Creating ResourceManager...')
      const resourceManager = new ResourceManager(playerManager, worldManager)
      resourceManagerRef.current = resourceManager

      // Initialize story system
      console.log('GameScene: Creating StorySystem...')
      const storySystem = new StorySystem(gameEngine, playerManager, worldManager)
      storySystemRef.current = storySystem
      storySystem.loadStoryProgress()
      storySystem.autoStartInitialQuest()

      // Apply passive effects
      console.log('GameScene: Applying passive effects...')
      skillManager.applyPassiveEffects('local_player')

      // Set up event listeners
      console.log('GameScene: Setting up event listeners...')
      gameEngine.on('keydown', (event) => {
        handleKeyDown(event, gameEngine, playerManager, worldManager, combatSystem, skillManager, explorationSystem, resourceManager, storySystem)
      })

      gameEngine.on('update', (deltaTime) => {
        worldManager.update(deltaTime)
        skillManager.updateBuffs()
        explorationSystem.update(deltaTime)
        
        // Update game stats
        if (gameEngine.currentFPS !== undefined) {
          setGameStats(prev => ({
            fps: gameEngine.currentFPS,
            playerPosition: gameEngine.player ? {
              x: Math.round(gameEngine.player.position.x * 100) / 100,
              y: Math.round(gameEngine.player.position.y * 100) / 100,
              z: Math.round(gameEngine.player.position.z * 100) / 100
            } : { x: 0, y: 0, z: 0 },
            cameraRotation: gameEngine.camera?.userData?.orbitControl ? {
              y: Math.round(gameEngine.camera.userData.orbitControl.rotationY * 180 / Math.PI),
              x: Math.round(gameEngine.camera.userData.orbitControl.rotationX * 180 / Math.PI)
            } : { y: 0, x: 0 }
          }))
        }
        
        // Update mouse lock status
        setMouseLocked(gameEngine.mouse?.isLocked || false)
        
        // Debug camera state - only log occasionally to reduce spam
        if (gameEngine.camera && gameEngine.camera.userData.orbitControl && Math.random() < 0.01) {
          const orbit = gameEngine.camera.userData.orbitControl
          console.log('Camera orbit:', {
            distance: orbit.distance.toFixed(2),
            height: orbit.height.toFixed(2),
            rotationY: (orbit.rotationY * 180 / Math.PI).toFixed(1) + '°',
            rotationX: (orbit.rotationX * 180 / Math.PI).toFixed(1) + '°',
            mouseLocked: gameEngine.mouse?.isLocked
          })
        }
        
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
      console.log('GameScene: Starting game...')
      gameEngine.start()
      console.log('GameScene: Game started successfully!')

              // Initialization complete
        console.log('Enhanced3DWorld: Initialization sequence completed')

      // Notify parent that game engine is ready
      if (onGameEngineReady) {
        onGameEngineReady(gameEngine)
      }

      // Test if renderer is working
      setTimeout(() => {
        const canvas = mountRef.current?.querySelector('canvas')
        if (canvas && document.contains(canvas)) {
          console.log('GameScene: Canvas found and mounted:', {
            width: canvas.width,
            height: canvas.height,
            style: canvas.style.cssText
          })
        } else {
          console.error('GameScene: No canvas found or canvas not in DOM')
        }
      }, 1000)

      } catch (error) {
        console.error('GameScene: Error during initialization:', error)
        isInitializedRef.current = false
      }
    }

    // Call the async initialization function
    initializeGame()

    // Cleanup function
    return () => {
      console.log('GameScene: Cleaning up...')
      // Don't reset isInitializedRef here to prevent re-initialization during React strict mode
      
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose()
        gameEngineRef.current = null
      }
      if (worldManagerRef.current) {
        worldManagerRef.current.dispose()
        worldManagerRef.current = null
      }
      if (combatSystemRef.current) {
        combatSystemRef.current.dispose()
        combatSystemRef.current = null
      }
      if (skillManagerRef.current) {
        skillManagerRef.current.dispose()
        skillManagerRef.current = null
      }
      if (explorationSystemRef.current) {
        explorationSystemRef.current.dispose()
        explorationSystemRef.current = null
      }
      if (resourceManagerRef.current) {
        resourceManagerRef.current.dispose()
        resourceManagerRef.current = null
      }
      if (storySystemRef.current) {
        storySystemRef.current.dispose()
        storySystemRef.current = null
      }
    }
  }, []) // Remove dependencies to prevent re-initialization

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

  return (
    <div className="absolute inset-0 w-full h-full">
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative'
        }}
      />
      {/* Debug overlay */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-xs z-10">
        <div>3D Game Scene Active</div>
        <div>Player: {player?.name || 'None'}</div>
        <div>Element: {player?.element?.name || 'None'}</div>
        <div>FPS: {gameStats.fps}</div>
        <div>Position: ({gameStats.playerPosition?.x || 0}, {gameStats.playerPosition?.y || 0}, {gameStats.playerPosition?.z || 0})</div>
        <div>Camera: Y:{gameStats.cameraRotation?.y || 0}° X:{gameStats.cameraRotation?.x || 0}°</div>
        <div>Mouse: {mouseLocked ? '🔒 Locked' : '🔓 Unlocked'}</div>
        <div>Controls: WASD to move (camera-relative)</div>
        <div>Mouse: Click to look around, ESC to unlock</div>
        <div>Space to jump</div>
      </div>
    </div>
  )
}

export default GameScene

