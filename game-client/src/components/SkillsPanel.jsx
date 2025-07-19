import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { X, Star, Plus, Lock, Flame, Droplets, Mountain, Wind } from 'lucide-react'
import './InventoryPanel.css'

const SkillsPanel = ({ isOpen, player, onClose }) => {
  const availableSkillPoints = 5

  const skillTrees = {
    fire: {
      name: 'شجرة النار',
      icon: Flame,
      color: '#FF4500',
      skills: [
        { id: 'fireball', name: 'كرة النار', level: 3, maxLevel: 5, description: 'يطلق كرة نارية تلحق ضرراً بالأعداء', cost: 1 },
        { id: 'flame_shield', name: 'درع اللهب', level: 2, maxLevel: 5, description: 'يحيط اللاعب بدرع ناري يحرق الأعداء القريبين', cost: 2 },
        { id: 'fire_storm', name: 'عاصفة نارية', level: 0, maxLevel: 3, description: 'يستدعي عاصفة من النار تغطي منطقة واسعة', cost: 3 },
        { id: 'phoenix_form', name: 'شكل العنقاء', level: 0, maxLevel: 1, description: 'يتحول اللاعب إلى عنقاء لفترة قصيرة', cost: 5 }
      ]
    },
    water: {
      name: 'شجرة الماء',
      icon: Droplets,
      color: '#1E90FF',
      skills: [
        { id: 'heal', name: 'الشفاء', level: 2, maxLevel: 5, description: 'يستعيد الصحة للاعب أو الحلفاء', cost: 1 },
        { id: 'ice_wall', name: 'جدار جليدي', level: 1, maxLevel: 3, description: 'ينشئ جداراً من الجليد للحماية', cost: 2 },
        { id: 'tsunami', name: 'تسونامي', level: 0, maxLevel: 3, description: 'يستدعي موجة عملاقة تجرف الأعداء', cost: 4 },
        { id: 'water_mastery', name: 'إتقان الماء', level: 0, maxLevel: 1, description: 'يزيد من قوة جميع مهارات الماء', cost: 3 }
      ]
    },
    earth: {
      name: 'شجرة الأرض',
      icon: Mountain,
      color: '#8B4513',
      skills: [
        { id: 'stone_armor', name: 'درع حجري', level: 2, maxLevel: 5, description: 'يزيد من الدفاع ويقلل الضرر المتلقى', cost: 1 },
        { id: 'earthquake', name: 'زلزال', level: 1, maxLevel: 3, description: 'يهز الأرض ويسبب ضرراً للأعداء القريبين', cost: 2 },
        { id: 'stone_spikes', name: 'أشواك حجرية', level: 0, maxLevel: 4, description: 'يستدعي أشواكاً حجرية من الأرض', cost: 2 },
        { id: 'mountain_form', name: 'شكل الجبل', level: 0, maxLevel: 1, description: 'يصبح اللاعب غير قابل للحركة لكن مقاوم للضرر', cost: 4 }
      ]
    },
    air: {
      name: 'شجرة الهواء',
      icon: Wind,
      color: '#E6E6FA',
      skills: [
        { id: 'wind_blade', name: 'شفرة الرياح', level: 2, maxLevel: 5, description: 'يطلق شفرة من الهواء المضغوط', cost: 1 },
        { id: 'flight', name: 'الطيران', level: 1, maxLevel: 3, description: 'يمكن اللاعب من الطيران لفترة محدودة', cost: 3 },
        { id: 'tornado', name: 'إعصار', level: 0, maxLevel: 3, description: 'يستدعي إعصاراً يجذب الأعداء ويلحق بهم الضرر', cost: 4 },
        { id: 'wind_mastery', name: 'إتقان الهواء', level: 0, maxLevel: 1, description: 'يزيد من سرعة الحركة وقوة مهارات الهواء', cost: 3 }
      ]
    }
  }

  const currentElement = player.element?.id || 'fire'
  const currentSkillTree = skillTrees[currentElement]

  const canUpgradeSkill = (skill) => {
    return skill.level < skill.maxLevel && availableSkillPoints >= skill.cost
  }

  if (!isOpen) return null

  return (
    <div className="hud-panel-glass absolute top-2 sm:top-4 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-96 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-lg z-20" data-ui-element="skills-panel">
      <Card className="h-full bg-transparent border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentSkillTree.color}30`, border: `2px solid ${currentSkillTree.color}` }}
            >
              <currentSkillTree.icon 
                className="h-4 w-4" 
                style={{ color: currentSkillTree.color }}
              />
            </div>
            <CardTitle className="text-xl text-white">{currentSkillTree.name}</CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* Available Skill Points */}
          <div className="bg-gradient-to-r from-purple-900/50 to-orange-900/50 rounded-lg p-3 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">نقاط المهارة المتاحة</span>
              <Badge className="bg-orange-500 text-white">
                <Star className="mr-1 h-3 w-3" />
                {availableSkillPoints}
              </Badge>
            </div>
          </div>

          {/* Skills List */}
          <div className="space-y-3">
            {currentSkillTree.skills.map((skill) => {
              const isMaxLevel = skill.level >= skill.maxLevel
              const canUpgrade = canUpgradeSkill(skill)
              const isLocked = skill.level === 0 && skill.cost > availableSkillPoints

              return (
                <div
                  key={skill.id}
                  className={`bg-gray-800/60 rounded-lg p-4 border transition-colors ${
                    isLocked 
                      ? 'border-gray-700 opacity-60' 
                      : 'border-gray-600 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                        <h4 className="text-white font-medium">{skill.name}</h4>
                        {isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{skill.description}</p>
                      
                      {/* Skill Level Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            المستوى {skill.level}/{skill.maxLevel}
                          </span>
                          <span className="text-xs text-gray-400">
                            التكلفة: {skill.cost} نقطة
                          </span>
                        </div>
                        <Progress 
                          value={(skill.level / skill.maxLevel) * 100} 
                          className="h-2 bg-gray-700"
                        />
                      </div>
                    </div>
                    
                    <div className="ml-3 rtl:mr-3 rtl:ml-0">
                      {isMaxLevel ? (
                        <Badge className="bg-green-600 text-white">
                          مكتمل
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!canUpgrade}
                          className={`${
                            canUpgrade 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Element Switch Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="text-white font-medium mb-3">أشجار المهارات الأخرى</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(skillTrees).map(([elementId, tree]) => {
                if (elementId === currentElement) return null
                const TreeIcon = tree.icon
                return (
                  <Button
                    key={elementId}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:border-purple-500/50 hover:text-white"
                  >
                    <TreeIcon className="mr-1 h-3 w-3" style={{ color: tree.color }} />
                    {tree.name.replace('شجرة ', '')}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SkillsPanel

