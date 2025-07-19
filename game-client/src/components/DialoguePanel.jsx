import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, User, Crown } from 'lucide-react'

const DialoguePanel = ({ isOpen, onClose, character, dialogue, onChoiceSelect }) => {
  const [currentDialogue, setCurrentDialogue] = useState(dialogue)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    if (dialogue) {
      setCurrentDialogue(dialogue)
      setIsTyping(true)
      setDisplayedText('')
      
      // Typewriter effect
      const text = dialogue.dialogue.text
      let index = 0
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          setIsTyping(false)
          clearInterval(typeInterval)
        }
      }, 30)

      return () => clearInterval(typeInterval)
    }
  }, [dialogue])

  const handleChoiceClick = (choiceIndex) => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(currentDialogue.dialogue.text)
      setIsTyping(false)
      return
    }

    if (onChoiceSelect) {
      onChoiceSelect(choiceIndex)
    }
  }

  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(currentDialogue.dialogue.text)
      setIsTyping(false)
    }
  }

  if (!isOpen || !currentDialogue) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" data-ui-element="dialogue-panel">
      <div className="bg-black/30 backdrop-blur-sm border-2 border-blue-500/20 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              {currentDialogue.character === 'الحكيم إلدريك' ? (
                <Crown className="w-6 h-6 text-yellow-400" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{currentDialogue.character}</h3>
              <p className="text-sm text-blue-300">{currentDialogue.title}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Dialogue Text */}
        <div 
          className="bg-gray-800 rounded-lg p-4 mb-6 min-h-[120px] cursor-pointer"
          onClick={handleSkipTyping}
        >
          <p className="text-white text-lg leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
          {isTyping && (
            <p className="text-xs text-gray-400 mt-2">انقر للتخطي...</p>
          )}
        </div>

        {/* Dialogue Choices */}
        {!isTyping && currentDialogue.dialogue.options && (
          <div className="space-y-2">
            <p className="text-sm text-gray-300 mb-3">اختر ردك:</p>
            {currentDialogue.dialogue.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-right justify-start bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-blue-500 transition-all duration-200"
                onClick={() => handleChoiceClick(index)}
              >
                <span className="text-blue-400 mr-2">{index + 1}.</span>
                {option.text}
              </Button>
            ))}
          </div>
        )}

        {/* No choices - just close button */}
        {!isTyping && !currentDialogue.dialogue.options && (
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              إغلاق
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DialoguePanel

