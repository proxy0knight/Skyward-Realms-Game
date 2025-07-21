import { useEffect, useRef, useState } from 'react'
import BabylonGameEngine from '../lib/BabylonGameEngine'
import PerformanceMonitor from './PerformanceMonitor'

const GameScene = ({ player, onPlayerUpdate, onDialogueOpen, onQuestUpdate, onGameEngineReady }) => {
  const mountRef = useRef(null)
  const gameEngineRef = useRef(null)
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

        // Create player in Babylon.js world
        console.log('GameScene: Creating player in Babylon.js world...')
        const playerMesh = await gameEngine.createPlayer(player)
        console.log('GameScene: Babylon.js player created successfully')

        // Set up event listeners and callbacks
        console.log('GameScene: Setting up game events...')
        if (onGameEngineReady) {
          onGameEngineReady(gameEngine)
        }

                 // Set up basic event listeners for game controls
         gameEngine.on('keydown', (event) => {
           handleKeyDown(event, gameEngine)
         })

        // Set up game update loop
        gameEngine.on('update', (deltaTime) => {
          // Update game stats for performance monitoring
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
  const handleKeyDown = (event, gameEngine) => {
    // Basic keyboard handling for game controls
    // Future: Add interactions, inventory, skills etc.
    switch (event.code) {
      case 'KeyR':
        // Reset player position if they get stuck
        if (gameEngine.babylonCharacter) {
          gameEngine.babylonCharacter.resetPosition()
          console.log('Player position reset')
        }
        break
        
      case 'KeyF':
        // Toggle fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.documentElement.requestFullscreen()
        }
        break
        
      default:
        // Let other keys pass through to game engine
        break
    }
  }

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose()
        gameEngineRef.current = null
      }
    }
  }, [])

  return (
    <div className="w-full h-screen relative">
      <div ref={mountRef} className="w-full h-full" />
      <PerformanceMonitor 
        fps={gameStats.fps}
        playerPosition={gameStats.playerPosition}
        cameraRotation={gameStats.cameraRotation}
        mouseLocked={mouseLocked}
      />
    </div>
  )
}

export default GameScene

