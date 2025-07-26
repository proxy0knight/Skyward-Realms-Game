import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { X, Flame, Droplets, Mountain, Wind, Zap, Cloud } from 'lucide-react'
import './InventoryPanel.css'

const CombatTestPanel = ({ isOpen, onClose }) => {
  const [comboChain, setComboChain] = useState([])
  const [lastComboTime, setLastComboTime] = useState(0)
  const [combatLog, setCombatLog] = useState([])
  const [activeComboBonus, setActiveComboBonus] = useState(null)

  const elementCombinations = {
    fire_air: {
      name: 'البرق',
      damage: 120,
      effects: ['shock', 'chain_lightning'],
      description: 'مزيج من النار والهواء يخلق برقاً قوياً',
      icon: Zap,
      color: '#00ffff'
    },
    fire_earth: {
      name: 'البركان',
      damage: 150,
      effects: ['burn', 'knockback', 'ground_damage'],
      description: 'مزيج من النار والأرض يخلق انفجاراً بركانياً',
      icon: Flame,
      color: '#ff4400'
    },
    water_earth: {
      name: 'الطين',
      damage: 80,
      effects: ['slow', 'root', 'mud_pool'],
      description: 'مزيج من الماء والأرض يخلق بركاً من الطين',
      icon: Droplets,
      color: '#8b4513'
    },
    water_air: {
      name: 'الضباب',
      damage: 60,
      effects: ['blind', 'stealth', 'heal_boost'],
      description: 'مزيج من الماء والهواء يخلق ضباباً شافياً',
      icon: Cloud,
      color: '#87ceeb'
    },
    air_earth: {
      name: 'العاصفة الرملية',
      damage: 90,
      effects: ['blind', 'dot', 'wind_push'],
      description: 'مزيج من الهواء والأرض يخلق عاصفة رملية',
      icon: Wind,
      color: '#f4a460'
    },
    fire_water: {
      name: 'البخار',
      damage: 70,
      effects: ['steam_burn', 'heal_reduction', 'vision_obscure'],
      description: 'مزيج من النار والماء يخلق بخاراً حارقاً',
      icon: Cloud,
      color: '#d3d3d3'
    }
  }

  const elementIcons = {
    fire: Flame,
    water: Droplets,
    earth: Mountain,
    air: Wind
  }

  const elementColors = {
    fire: '#FF4500',
    water: '#1E90FF',
    earth: '#8B4513',
    air: '#E6E6FA'
  }

  const addCombatLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setCombatLog(prev => [...prev.slice(-9), { message, type, timestamp }])
  }

  const castSkill = (elementId) => {
    const now = Date.now()
    const comboWindow = 3000 // 3 seconds

    // Clear old combos if too much time has passed
    if (now - lastComboTime > comboWindow) {
      setComboChain([])
    }

    // Add to combo chain
    const newComboChain = [...comboChain, { elementId, timestamp: now }]
    setComboChain(newComboChain)
    setLastComboTime(now)

    // Check for combo bonuses
    checkComboBonuses(newComboChain)

    addCombatLog(`استخدم مهارة ${elementId}`, 'skill')
  }

  const checkComboBonuses = (chain) => {
    if (chain.length >= 3) {
      const lastThree = chain.slice(-3)
      const elements = lastThree.map(combo => combo.elementId)
      const uniqueElements = new Set(elements)

      if (uniqueElements.size >= 3) {
        addCombatLog('مكافأة التنوع العنصري! +50% ضرر', 'bonus')
        setActiveComboBonus({ type: 'elemental_variety', multiplier: 1.5, duration: 5000 })
      } else if (uniqueElements.size === 1) {
        addCombatLog('مكافأة السلسلة العنصرية! +30% ضرر', 'bonus')
        setActiveComboBonus({ type: 'elemental_chain', multiplier: 1.3, duration: 5000 })
      }
    }
  }

  const tryElementCombination = () => {
    if (comboChain.length < 2) {
      addCombatLog('تحتاج إلى مهارتين على الأقل للدمج العنصري', 'warning')
      return
    }

    const lastTwo = comboChain.slice(-2)
    const element1 = lastTwo[0].elementId
    const element2 = lastTwo[1].elementId

    const combinationKey = `${element1}_${element2}`
    const reverseKey = `${element2}_${element1}`

    const combination = elementCombinations[combinationKey] || elementCombinations[reverseKey]

    if (combination) {
      addCombatLog(`دمج عنصري: ${combination.name}!`, 'combo')
      addCombatLog(`ضرر: ${combination.damage} | تأثيرات: ${combination.effects.join(', ')}`, 'info')
      setComboChain([]) // Clear combo after use
    } else {
      addCombatLog('هذا المزيج العنصري غير معروف', 'warning')
    }
  }

  const getElementIcon = (elementId) => {
    const IconComponent = elementIcons[elementId]
    return IconComponent ? <IconComponent className="h-4 w-4" style={{ color: elementColors[elementId] }} /> : null
  }

  const getComboIcon = (comboName) => {
    const combination = Object.values(elementCombinations).find(combo => combo.name === comboName)
    if (combination && combination.icon) {
      const IconComponent = combination.icon
      return <IconComponent className="h-4 w-4" style={{ color: combination.color }} />
    }
    return null
  }

  if (!isOpen) return null

  return (
    <div className="hud-panel-glass fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-black/30 backdrop-blur-sm border-2 border-purple-500/20 rounded-2xl w-full max-w-4xl h-5/6 mx-4 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <h2 className="text-xl font-bold text-white">اختبار نظام القتال المحسن</h2>
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
          {/* Left Panel - Combat Controls */}
          <div className="w-1/2 space-y-4">
            {/* Element Skills */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">مهارات العناصر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(elementIcons).map(([elementId, ElementIcon]) => ( // eslint-disable-line no-unused-vars
                    <Button
                      key={elementId}
                      onClick={() => castSkill(elementId)}
                      className="flex items-center gap-2"
                      style={{ backgroundColor: elementColors[elementId] + '20', borderColor: elementColors[elementId] }}
                    >
                      <ElementIcon className="h-4 w-4" style={{ color: elementColors[elementId] }} />
                      {elementId}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Element Combinations */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">الدمج العنصري</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={tryElementCombination}
                  className="w-full mb-4 bg-purple-600 hover:bg-purple-700"
                  disabled={comboChain.length < 2}
                >
                  دمج العناصر (Q)
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(elementCombinations).map(([key, combo]) => (
                    <div
                      key={key}
                      className="p-2 rounded border border-purple-500/20 bg-black/20"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getComboIcon(combo.name)}
                        <span className="text-white text-sm font-medium">{combo.name}</span>
                      </div>
                      <p className="text-gray-300 text-xs">{combo.description}</p>
                      <div className="flex gap-1 mt-1">
                        {combo.effects.map((effect, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Combat Status */}
          <div className="w-1/2 space-y-4">
            {/* Combo Chain */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">سلسلة المهارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-2">
                  {comboChain.map((combo, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 p-2 rounded border"
                      style={{ borderColor: elementColors[combo.elementId] + '50' }}
                    >
                      {getElementIcon(combo.elementId)}
                      <span className="text-white text-sm">{combo.elementId}</span>
                    </div>
                  ))}
                </div>
                {activeComboBonus && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    مكافأة نشطة: {activeComboBonus.type} (x{activeComboBonus.multiplier})
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Combat Log */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20 flex-1">
              <CardHeader>
                <CardTitle className="text-white">سجل القتال</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-64">
                <div className="space-y-1">
                  {combatLog.map((log, index) => (
                    <div
                      key={index}
                      className={`text-sm p-1 rounded ${
                        log.type === 'error' ? 'text-red-400 bg-red-500/10' :
                        log.type === 'warning' ? 'text-yellow-400 bg-yellow-500/10' :
                        log.type === 'bonus' ? 'text-green-400 bg-green-500/10' :
                        log.type === 'combo' ? 'text-purple-400 bg-purple-500/10' :
                        log.type === 'skill' ? 'text-blue-400 bg-blue-500/10' :
                        'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500 text-xs">{log.timestamp}</span> {log.message}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CombatTestPanel 