import { useEffect, useRef, useState } from 'react'
// import GameEngine from '../lib/GameEngine'
import BabylonGameEngine from '../lib/BabylonGameEngine'
import PerformanceMonitor from './PerformanceMonitor'
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
  const [engineType, setEngineType] = useState('babylon') // 'three' or 'babylon'

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
        // Initialize Babylon.js game engine
        console.log('GameScene: Creating BabylonGameEngine...')
        const gameEngine = new BabylonGameEngine()
        gameEngineRef.current = gameEngine
        
        console.log('GameScene: Initializing BabylonGameEngine...')
        const initSuccess = await gameEngine.init(mountRef.current)
        if (!initSuccess) {
          console.error('GameScene: Failed to initialize Babylon.js game engine')
          return
        }
        console.log('GameScene: BabylonGameEngine initialized successfully')

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

      // Create player in 3D world with Babylon.js
      console.log('GameScene: Creating player in Babylon.js world...')
      const playerMesh = await gameEngine.createPlayer(playerData)
      console.log('GameScene: Babylon.js player created:', playerMesh)

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
        
        // Update game stats for Babylon.js
        if (gameEngine.getFPS) {
          const playerPos = gameEngine.babylonCharacter ? gameEngine.babylonCharacter.getPosition() : { x: 0, y: 0, z: 0 }
          setGameStats(prev => ({
            fps: gameEngine.getFPS(),
            playerPosition: {
              x: Math.round(playerPos.x * 100) / 100,
              y: Math.round(playerPos.y * 100) / 100,
              z: Math.round(playerPos.z * 100) / 100
            },
            cameraRotation: gameEngine.camera ? {
              y: Math.round(gameEngine.camera.alpha * 180 / Math.PI),
              x: Math.round(gameEngine.camera.beta * 180 / Math.PI)
            } : { y: 0, x: 0 }
          }))
        }
        
        // Update mouse lock status from Babylon.js engine
        setMouseLocked(gameEngine.isMouseLocked || false)
        
        // Babylon.js camera debug - only log occasionally to reduce spam
        if (gameEngine.camera && Math.random() < 0.01) {
          console.log('Babylon Camera state:', {
            alpha: (gameEngine.camera.alpha * 180 / Math.PI).toFixed(1) + '°',
            beta: (gameEngine.camera.beta * 180 / Math.PI).toFixed(1) + '°',
            radius: gameEngine.camera.radius.toFixed(2)
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
        const canvas = gameEngine?.renderer?.domElement
        if (canvas && mountRef.current && mountRef.current.contains(canvas)) {
          console.log('GameScene: Canvas found and mounted:', {
            width: canvas.width,
            height: canvas.height,
            parentElement: canvas.parentElement?.tagName,
            canvasStyle: canvas.style.cssText,
            isVisible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0,
            containerChildren: mountRef.current.children.length
          })
        } else {
          console.log('GameScene: Canvas status:', {
            hasGameEngine: !!gameEngine,
            hasRenderer: !!gameEngine?.renderer,
            hasCanvas: !!canvas,
            hasMount: !!mountRef.current,
            containerHTML: mountRef.current?.innerHTML.substring(0, 200)
          })
        }
      }, 500)

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
      // Only cleanup if we're actually unmounting, not during React strict mode double-invocation
      
      if (gameEngineRef.current) {
        console.log('GameScene: Stopping game engine...')
        gameEngineRef.current.stop()
        // Don't dispose immediately - let React handle the cleanup properly
        setTimeout(() => {
          if (gameEngineRef.current) {
            gameEngineRef.current.dispose()
            gameEngineRef.current = null
          }
        }, 100)
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
          position: 'relative',
          overflow: 'hidden'
        }}
      />
      {/* Engine Selector */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-xs z-10 mb-2">
        <div className="text-purple-300 mb-2">🚀 3D Engine:</div>
        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => setEngineType('three')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              engineType === 'three'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            disabled={true}
            title="Switched to Babylon.js"
          >
            Three.js
          </button>
          <button
            onClick={() => setEngineType('babylon')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              engineType === 'babylon'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            disabled={false}
          >
            Babylon.js
          </button>
        </div>
        <div className="text-xs text-yellow-300 mb-2">
          🚀 Babylon.js Active with GLB Characters
        </div>
      </div>

      {/* Debug overlay */}
      <div className="absolute top-32 left-4 bg-black/70 text-white p-2 rounded text-xs z-10">
        <div>🚀 Babylon.js Game Scene Active</div>
        <div>Player: {player?.name || 'None'}</div>
        <div>Element: {player?.element?.name || 'None'}</div>
        <div>FPS: {gameStats.fps}</div>
        <div>Position: ({gameStats.playerPosition?.x || 0}, {gameStats.playerPosition?.y || 0}, {gameStats.playerPosition?.z || 0})</div>
        <div>Camera: α:{gameStats.cameraRotation?.y || 0}° β:{gameStats.cameraRotation?.x || 0}°</div>
        <div>Engine: Babylon.js with GLB Characters</div>
        <div>Mouse: {mouseLocked ? '🔒 Locked (ESC to unlock)' : '🔓 Click to lock mouse'}</div>
        <div>Controls: WASD to move</div>
        <div>Camera: {mouseLocked ? 'Mouse look (locked)' : 'Click and drag to look around'}</div>
        <div>Space to jump</div>
      </div>
      
      {/* Performance Monitor */}
      <PerformanceMonitor gameEngine={gameEngineRef.current} />
    </div>
  )
}

export default GameScene

