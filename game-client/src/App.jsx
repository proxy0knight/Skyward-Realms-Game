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

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'character-selection', 'playing'
  const [player, setPlayer] = useState(null)
  const [activePanel, setActivePanel] = useState(null)
  const [dialogueData, setDialogueData] = useState(null)
  const [currentCharacter, setCurrentCharacter] = useState(null)
  const [questData, setQuestData] = useState({ activeQuests: [], storyProgress: {} })

  const elements = [
    {
      id: 'fire',
      name: 'النار',
      description: 'عنصر القوة والشغف، يمنح قدرات هجومية قوية',
      color: '#ff4444',
      skills: ['كرة النار', 'درع اللهب', 'عاصفة نارية']
    },
    {
      id: 'water',
      name: 'الماء',
      description: 'عنصر الشفاء والحكمة، يمنح قدرات دفاعية وشفائية',
      color: '#4444ff',
      skills: ['الشفاء', 'جدار جليدي', 'تسونامي']
    },
    {
      id: 'earth',
      name: 'الأرض',
      description: 'عنصر الثبات والقوة، يمنح قدرات دفاعية ومقاومة',
      color: '#44aa44',
      skills: ['درع حجري', 'زلزال', 'أشواك حجرية']
    },
    {
      id: 'air',
      name: 'الهواء',
      description: 'عنصر السرعة والحرية، يمنح قدرات حركية وسرعة',
      color: '#44aaaa',
      skills: ['شفرة الرياح', 'الطيران', 'إعصار']
    }
  ]

  const handleStartGame = () => {
    setGameState('character-selection')
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
        case 'Escape':
          setActivePanel(null)
          setDialogueData(null)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, activePanel])

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      {gameState === 'menu' && (
        <MainMenu onStartGame={handleStartGame} />
      )}
      
      {gameState === 'character-selection' && (
        <CharacterSelection 
          elements={elements}
          onSelectElement={handleCharacterSelect}
        />
      )}
      
      {gameState === 'playing' && player && (
        <>
          {/* 3D Game Scene */}
          <GameScene 
            player={player} 
            onPlayerUpdate={handlePlayerUpdate}
            onDialogueOpen={handleDialogueOpen}
            onQuestUpdate={handleQuestUpdate}
          />
          
          {/* Game HUD */}
          <GameHUD 
            player={player}
            onInventoryClick={() => handlePanelToggle('inventory')}
            onSkillsClick={() => handlePanelToggle('skills')}
            onMapClick={() => handlePanelToggle('map')}
            onQuestsClick={() => handlePanelToggle('quests')}
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
            activeQuests={questData.activeQuests}
            storyProgress={questData.storyProgress}
          />

          {/* Dialogue System */}
          <DialoguePanel 
            isOpen={!!dialogueData}
            onClose={() => {
              setDialogueData(null)
              setCurrentCharacter(null)
            }}
            character={currentCharacter}
            dialogue={dialogueData}
            onChoiceSelect={handleDialogueChoice}
          />
        </>
      )}
    </div>
  )
}

export default App

