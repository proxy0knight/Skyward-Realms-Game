import { useState, useEffect } from 'react'
import MainMenu from './components/MainMenu'
import CharacterSelection from './components/CharacterSelection'
import GameScene from './components/GameScene'
import GameHUD from './components/GameHUD'
import InventoryPanel from './components/InventoryPanel'
import SkillsPanel from './components/SkillsPanel'
import MapPanel from './components/MapPanel'
import DialoguePanel from './components/DialoguePanel'
import QuestPanel from './components/QuestPanel'
import AdminAccess from './components/AdminAccess'
import AdminDashboard from './components/AdminDashboard'
import CombatTestPanel from './components/CombatTestPanel'
import StoryTestPanel from './components/StoryTestPanel'
import { Flame, Droplets, Mountain, Wind } from 'lucide-react'

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'character-selection', 'playing', 'admin-access', 'admin', 'asset-manager'
  const [player, setPlayer] = useState(null)
  const [selectedElement, setSelectedElement] = useState(null)
  const [activePanel, setActivePanel] = useState(null)
  const [dialogueData, setDialogueData] = useState(null)
  const [currentCharacter, setCurrentCharacter] = useState(null)
  const [questData, setQuestData] = useState({ activeQuests: [], storyProgress: {} })
  const [showCombatTest, setShowCombatTest] = useState(false)
  const [showStoryTest, setShowStoryTest] = useState(false)
  const [gameEngine, setGameEngine] = useState(null)

  const elements = [
    {
      id: 'fire',
      name: 'النار',
      description: 'قوة مدمرة، تلتهم الأعداء بلهيبها الحارق.',
      color: '#FF4500',
      abilities: ['كرة النار', 'درع اللهب', 'عاصفة نارية'],
      icon: Flame
    },
    {
      id: 'water',
      name: 'الماء',
      description: 'مرونة لا تضاهى، تشفي الحلفاء وتغرق الأعداء.',
      color: '#1E90FF',
      abilities: ['الشفاء', 'جدار جليدي', 'تسونامي'],
      icon: Droplets
    },
    {
      id: 'earth',
      name: 'الأرض',
      description: 'صلابة لا تتزعزع، تحمي الحلفاء وتسحق الخصوم.',
      color: '#8B4513',
      abilities: ['درع حجري', 'زلزال', 'أشواك حجرية'],
      icon: Mountain
    },
    {
      id: 'air',
      name: 'الهواء',
      description: 'خفة وسرعة، تتلاعب بالرياح لتفوق الأعداء.',
      color: '#E6E6FA',
      abilities: ['شفرة الرياح', 'الطيران', 'إعصار'],
      icon: Wind
    }
  ]

  const handleStartGame = () => {
    console.log('Starting game, changing state to character-selection')
    setGameState('character-selection')
  }

  const handleBackToMenu = () => {
    console.log('Going back to menu')
    setGameState('menu')
    setSelectedElement(null)
  }

  const handleElementSelect = (element) => {
    console.log('Element selected:', element)
    setSelectedElement(element)
  }

  const handleStartGameWithElement = () => {
    if (selectedElement) {
      console.log('Starting game with element:', selectedElement)
      handleCharacterSelect(selectedElement)
    }
  }

  const handleCharacterSelect = (selectedElement) => {
    const newPlayer = {
      name: 'Player',
      level: 1,
      element: selectedElement,
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      experience: 0,
      experienceToNext: 1000
    }
    setPlayer(newPlayer)
    setGameState('playing')
  }

  const handlePlayerUpdate = (updatedPlayer) => {
    setPlayer(updatedPlayer)
  }

  const handleDialogueOpen = (dialogue, characterId) => {
    setDialogueData(dialogue)
    setCurrentCharacter(characterId)
  }

  const handleDialogueChoice = (choiceIndex) => {
    // This would be handled by the story system
    console.log(`Selected choice: ${choiceIndex}`)
    setDialogueData(null)
    setCurrentCharacter(null)
  }

  const handleQuestUpdate = (newQuestData) => {
    setQuestData(newQuestData)
  }

  const handlePanelToggle = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName)
  }

  const handleAdminAccess = () => {
    setGameState('admin-access')
  }

  const handleAdminLogin = () => {
    setGameState('admin')
  }

  const handleBackFromAdmin = () => {
    setGameState('menu')
  }

  const handleAssetManagerAccess = () => {
    setGameState('asset-manager')
  }

  const handleGameEngineReady = (engine) => {
    setGameEngine(engine)
  }

  // Keyboard shortcut for asset manager (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        setGameState('asset-manager')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (gameState !== 'playing') return

      switch (event.code) {
        case 'KeyI':
          handlePanelToggle('inventory')
          break
        case 'KeyK':
          handlePanelToggle('skills')
          break
        case 'KeyM':
          handlePanelToggle('map')
          break
        case 'KeyQ':
          handlePanelToggle('quests')
          break
        case 'KeyC':
          // Combat test panel
          setShowCombatTest(!showCombatTest)
          break
        case 'KeyS':
          // Story test panel
          setShowStoryTest(!showStoryTest)
          break
        case 'Escape':
          setActivePanel(null)
          setDialogueData(null)
          setShowCombatTest(false)
          setShowStoryTest(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, activePanel, showCombatTest, showStoryTest])

  return (
    <div className="w-full min-h-screen bg-black">
      {gameState === 'menu' && (
        <MainMenu onStartGame={handleStartGame} onAdminAccess={handleAdminAccess} />
      )}
      
      {gameState === 'admin-access' && (
        <AdminAccess onAccess={handleAdminLogin} onBack={handleBackFromAdmin} />
      )}
      
      {gameState === 'admin' && (
        <AdminDashboard />
      )}
      
      {gameState === 'asset-manager' && (
        <AdminDashboard />
      )}
      
      {gameState === 'character-selection' && (
        <div className="h-screen overflow-y-auto">
          <CharacterSelection 
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={handleElementSelect}
            onStartGame={handleStartGameWithElement}
            onBack={handleBackToMenu}
          />
        </div>
      )}
      
      {gameState === 'playing' && player && (
        <div className="relative w-full h-screen overflow-hidden">
          {/* 3D Game Scene */}
          <GameScene 
            player={player} 
            onPlayerUpdate={handlePlayerUpdate}
            onDialogueOpen={handleDialogueOpen}
            onQuestUpdate={handleQuestUpdate}
            onGameEngineReady={handleGameEngineReady}
          />
          
          {/* Game HUD */}
          <GameHUD 
            player={player}
            onTogglePanel={handlePanelToggle}
            activePanel={activePanel}
          />

          {/* Panels */}
          <InventoryPanel 
            isOpen={activePanel === 'inventory'}
            onClose={() => setActivePanel(null)}
            player={player}
          />
          
          <SkillsPanel 
            isOpen={activePanel === 'skills'}
            onClose={() => setActivePanel(null)}
            player={player}
          />
          
          <MapPanel 
            isOpen={activePanel === 'map'}
            onClose={() => setActivePanel(null)}
            player={player}
          />
          
          <QuestPanel 
            isOpen={activePanel === 'quests'}
            onClose={() => setActivePanel(null)}
            questData={questData}
          />

          {/* Test Panels */}
          <CombatTestPanel
            isOpen={showCombatTest}
            onClose={() => setShowCombatTest(false)}
            player={player}
          />

          <StoryTestPanel
            isOpen={showStoryTest}
            onClose={() => setShowStoryTest(false)}
          />

          {/* Dialogue Panel */}
          {dialogueData && (
            <DialoguePanel 
              dialogue={dialogueData}
              characterId={currentCharacter}
              onChoice={handleDialogueChoice}
              onClose={() => setDialogueData(null)}
            />
          )}

          {/* Test Instructions */}
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 p-2 rounded">
            <div>اختبار القتال: <kbd className="px-1 bg-gray-700 rounded">C</kbd></div>
            <div>اختبار القصة: <kbd className="px-1 bg-gray-700 rounded">S</kbd></div>
            <div>إغلاق: <kbd className="px-1 bg-gray-700 rounded">ESC</kbd></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App


