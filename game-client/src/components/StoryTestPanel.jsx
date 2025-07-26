import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { X, Users, Heart, Shield, Star } from 'lucide-react'
import './InventoryPanel.css'

const StoryTestPanel = ({ isOpen, onClose }) => {
  const [currentCharacter, setCurrentCharacter] = useState(null)
  const [currentDialogue, setCurrentDialogue] = useState(null)
  const [characterRelationships, setCharacterRelationships] = useState({
    eldric: { level: 0, trust: 0, respect: 0, friendship: 0 },
    pyra: { level: 0, trust: 0, respect: 0, friendship: 0 },
    aqua: { level: 0, trust: 0, respect: 0, friendship: 0 },
    terra: { level: 0, trust: 0, respect: 0, friendship: 0 },
    zephyr: { level: 0, trust: 0, respect: 0, friendship: 0 }
  })
  const [storyFlags] = useState(new Set())
  const [dialogueHistory, setDialogueHistory] = useState([])

  const characters = {
    eldric: {
      name: 'الحكيم إلدريك',
      title: 'حارس المعرفة القديمة',
      element: 'neutral',
      personality: 'حكيم، صبور، غامض',
      dialogueTree: {
        first_meeting: {
          text: 'أهلاً بك، أيها المختار. لقد كنت أنتظرك منذ زمن طويل. العالم في خطر، والعناصر تصرخ طلباً للمساعدة.',
          options: [
            { 
              text: 'من أنت؟ وماذا تعني بالمختار؟', 
              response: 'first_meeting_who',
              relationshipEffect: { trust: 5, respect: 0 }
            },
            { 
              text: 'أخبرني عن هذا الخطر', 
              response: 'first_meeting_danger',
              relationshipEffect: { trust: 10, respect: 5 }
            },
            { 
              text: 'كيف يمكنني المساعدة؟', 
              response: 'first_meeting_help',
              relationshipEffect: { trust: 15, respect: 10 }
            }
          ]
        },
        first_meeting_who: {
          text: 'أنا إلدريك، آخر حراس المعرفة القديمة. أنت المختار الذي تنبأت به النبوءات القديمة - الوحيد القادر على استعادة التوازن.',
          options: [
            { 
              text: 'ما هي هذه النبوءة؟', 
              response: 'prophecy_explanation',
              relationshipEffect: { trust: 5, respect: 5 }
            },
            { 
              text: 'لست أشعر بأنني مميز', 
              response: 'doubt_response',
              relationshipEffect: { trust: -5, respect: 0 }
            }
          ]
        },
        first_meeting_danger: {
          text: 'قوة الظلام القديمة تستيقظ. إنها تفسد العناصر وتخل بالتوازن الذي حافظنا عليه لآلاف السنين. إذا لم نتحرك سريعاً، فسيغرق العالم في الفوضى.',
          options: [
            { 
              text: 'كيف بدأ هذا؟', 
              response: 'darkness_origin',
              relationshipEffect: { trust: 5, respect: 5 }
            },
            { 
              text: 'ما الذي يمكنني فعله؟', 
              response: 'player_role',
              relationshipEffect: { trust: 10, respect: 10 }
            }
          ]
        },
        friendly_chat: {
          text: 'أرى أن ثقتك بي تزداد، أيها المختار. هل تريد أن أخبرك بقصة من قصص الماضي؟',
          options: [
            { 
              text: 'نعم، أحب أن أسمع', 
              response: 'ancient_story',
              relationshipEffect: { trust: 10, friendship: 15 }
            },
            { 
              text: 'ربما في وقت آخر', 
              response: 'polite_decline',
              relationshipEffect: { trust: 0, friendship: 5 }
            }
          ]
        }
      }
    },
    pyra: {
      name: 'بايرا',
      title: 'سيدة اللهب',
      element: 'fire',
      personality: 'شجاعة، متحمسة، وفية',
      dialogueTree: {
        first_meeting: {
          text: 'أشعر بقوة النار تتدفق منك! أنت تحمل شعلة الأمل التي انتظرناها طويلاً.',
          options: [
            { 
              text: 'علميني قوة النار', 
              response: 'fire_training',
              relationshipEffect: { trust: 15, respect: 10 }
            },
            { 
              text: 'ما الذي يهدد عالم النار؟', 
              response: 'fire_threat',
              relationshipEffect: { trust: 10, respect: 15 }
            }
          ]
        },
        fire_training: {
          text: 'النار ليست مجرد تدمير، بل هي الحياة والشغف والتجديد. دعني أعلمك أسرار اللهب الأبدي.',
          options: [
            { 
              text: 'أريد أن أتعلم', 
              response: 'accept_training',
              relationshipEffect: { trust: 20, respect: 15 }
            },
            { 
              text: 'أحتاج وقتاً للتفكير', 
              response: 'delay_training',
              relationshipEffect: { trust: 0, respect: 5 }
            }
          ]
        },
        friendly_chat: {
          text: 'أرى أن النار في قلبك تتوهج بقوة! هل تريد أن نتحدث عن شغفك بالقتال؟',
          options: [
            { 
              text: 'أحب القتال الشريف', 
              response: 'noble_combat',
              relationshipEffect: { trust: 15, friendship: 20 }
            },
            { 
              text: 'أفضل الدفاع عن الآخرين', 
              response: 'protective_combat',
              relationshipEffect: { trust: 20, friendship: 15 }
            }
          ]
        }
      }
    }
  }

  const updateRelationship = (characterId, type, amount) => {
    setCharacterRelationships(prev => {
      const updated = { ...prev }
      const relationship = { ...updated[characterId] }
      
      relationship[type] = Math.max(0, Math.min(100, relationship[type] + amount))
      relationship.level = Math.floor((relationship.trust + relationship.respect + relationship.friendship) / 3)
      
      updated[characterId] = relationship
      return updated
    })
  }



  const startDialogue = (characterId, dialogueId = 'first_meeting') => {
    const character = characters[characterId]
    if (!character || !character.dialogueTree[dialogueId]) return

    setCurrentCharacter(characterId)
    setCurrentDialogue(dialogueId)
    
    // Add personal touch based on relationship
    const relationship = characterRelationships[characterId]
    let dialogueText = character.dialogueTree[dialogueId].text
    
    if (relationship && relationship.level >= 50) {
      const personalTouches = {
        eldric: 'صديقي العزيز، ',
        pyra: 'يا شعلتي، '
      }
      dialogueText = (personalTouches[characterId] || '') + dialogueText
    } else if (relationship && relationship.level >= 25) {
      const personalTouches = {
        eldric: 'أيها المختار، ',
        pyra: 'أيها المحارب، '
      }
      dialogueText = (personalTouches[characterId] || '') + dialogueText
    }
    
    setDialogueHistory(prev => [...prev, { character: character.name, text: dialogueText, timestamp: new Date().toLocaleTimeString() }])
  }

  const makeChoice = (choiceIndex) => {
    if (!currentCharacter || !currentDialogue) return

    const character = characters[currentCharacter]
    const dialogue = character.dialogueTree[currentDialogue]
    const choice = dialogue.options[choiceIndex]
    
    if (!choice) return

    // Apply relationship effects
    if (choice.relationshipEffect) {
      Object.entries(choice.relationshipEffect).forEach(([type, amount]) => {
        updateRelationship(currentCharacter, type, amount)
      })
    }

    // Add to dialogue history
    setDialogueHistory(prev => [...prev, { 
      character: 'أنت', 
      text: choice.text, 
      timestamp: new Date().toLocaleTimeString() 
    }])

    // Move to next dialogue
    if (choice.response && character.dialogueTree[choice.response]) {
      setCurrentDialogue(choice.response)
      const nextDialogue = character.dialogueTree[choice.response]
      setDialogueHistory(prev => [...prev, { 
        character: character.name, 
        text: nextDialogue.text, 
        timestamp: new Date().toLocaleTimeString() 
      }])
    } else {
      setCurrentDialogue(null)
    }
  }

  const getRelationshipStatus = (level) => {
    if (level >= 90) return 'صديق مقرب'
    if (level >= 75) return 'صديق موثوق'
    if (level >= 50) return 'صديق'
    if (level >= 25) return 'معارف'
    if (level >= 0) return 'غريب'
    return 'عدو'
  }

  const getAvailableDialogues = (characterId) => {
    const relationship = characterRelationships[characterId]
    const available = ['first_meeting']
    
    if (relationship) {
      if (relationship.level >= 25) available.push('friendly_chat')
      if (relationship.level >= 50) available.push('personal_story')
    }
    
    return available
  }

  if (!isOpen) return null

  return (
    <div className="hud-panel-glass fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-black/30 backdrop-blur-sm border-2 border-purple-500/20 rounded-2xl w-full max-w-6xl h-5/6 mx-4 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <h2 className="text-xl font-bold text-white">اختبار نظام القصة المحسن</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Left Panel - Characters & Relationships */}
          <div className="w-1/3 space-y-4">
            {/* Character List */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">الشخصيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(characters).map(([id, character]) => {
                    const relationship = characterRelationships[id]
                    const availableDialogues = getAvailableDialogues(id)
                    
                    return (
                      <div
                        key={id}
                        className="p-3 rounded border border-purple-500/20 bg-black/20 cursor-pointer hover:bg-black/40 transition-colors"
                        onClick={() => startDialogue(id, availableDialogues[0])}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-medium">{character.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {relationship ? getRelationshipStatus(relationship.level) : 'غريب'}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{character.title}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Heart className="h-3 w-3 text-red-400" />
                            <span className="text-xs text-gray-300">الثقة: {relationship?.trust || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-gray-300">الاحترام: {relationship?.respect || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-gray-300">الصداقة: {relationship?.friendship || 0}</span>
                          </div>
                        </div>
                        <Progress value={relationship?.level || 0} className="mt-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Story Flags */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">علامات القصة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Array.from(storyFlags).map((flag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {flag}
                    </Badge>
                  ))}
                  {storyFlags.size === 0 && (
                    <p className="text-gray-400 text-sm">لا توجد علامات قصة نشطة</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Dialogue */}
          <div className="w-2/3 space-y-4">
            {/* Current Dialogue */}
            {currentCharacter && currentDialogue && (
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">
                    {characters[currentCharacter].name} - {currentDialogue}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-black/20 rounded border border-purple-500/20">
                      <p className="text-white">
                        {characters[currentCharacter].dialogueTree[currentDialogue].text}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {characters[currentCharacter].dialogueTree[currentDialogue].options.map((option, index) => (
                        <Button
                          key={index}
                          onClick={() => makeChoice(index)}
                          variant="outline"
                          className="w-full justify-start text-left"
                        >
                          {option.text}
                          {option.relationshipEffect && (
                            <div className="ml-auto flex gap-1">
                              {Object.entries(option.relationshipEffect).map(([type, amount]) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}: {amount > 0 ? '+' : ''}{amount}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dialogue History */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20 flex-1">
              <CardHeader>
                <CardTitle className="text-white">تاريخ المحادثة</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-64">
                <div className="space-y-2">
                  {dialogueHistory.map((entry, index) => (
                    <div key={index} className="p-2 rounded border border-purple-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-purple-400 font-medium">{entry.character}</span>
                        <span className="text-gray-500 text-xs">{entry.timestamp}</span>
                      </div>
                      <p className="text-white text-sm">{entry.text}</p>
                    </div>
                  ))}
                  {dialogueHistory.length === 0 && (
                    <p className="text-gray-400 text-sm">ابدأ محادثة مع شخصية لرؤية التاريخ</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryTestPanel 