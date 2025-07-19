import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Target, CheckCircle, Clock, Star, Sword, Book, Zap } from 'lucide-react'
import './InventoryPanel.css'

const QuestPanel = ({ isOpen, onClose, activeQuests, storyProgress, onQuestSelect }) => {
  const [selectedTab, setSelectedTab] = useState('active')

  if (!isOpen) return null

  const getQuestIcon = (questType) => {
    switch (questType) {
      case 'main': return <Star className="w-5 h-5 text-yellow-400" />
      case 'elemental': return <Zap className="w-5 h-5 text-blue-400" />
      case 'tutorial': return <Book className="w-5 h-5 text-green-400" />
      default: return <Target className="w-5 h-5 text-gray-400" />
    }
  }

  const getQuestTypeColor = (questType) => {
    switch (questType) {
      case 'main': return 'border-yellow-500 bg-yellow-500/10'
      case 'elemental': return 'border-blue-500 bg-blue-500/10'
      case 'tutorial': return 'border-green-500 bg-green-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const calculateQuestProgress = (quest) => {
    if (!quest.objectives) return 0
    const completed = quest.objectives.filter(obj => obj.completed).length
    return (completed / quest.objectives.length) * 100
  }

  return (
    <div className="hud-panel-glass fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" data-ui-element="quest-panel">
      <div className="bg-black/30 backdrop-blur-sm border-2 border-purple-500/20 rounded-2xl w-full max-w-4xl h-5/6 mx-4 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">سجل المهام</h2>
              <p className="text-purple-300">تتبع تقدمك في الرحلة</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Story Progress */}
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">تقدم القصة الرئيسية</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">الفصل {storyProgress.currentChapter}</span>
              <span className="text-purple-300">{storyProgress.totalProgress?.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${storyProgress.totalProgress || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>المهام المكتملة: {storyProgress.completedQuestsCount || 0}</span>
              <span>المهام النشطة: {storyProgress.activeQuestsCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === 'active' 
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setSelectedTab('active')}
          >
            المهام النشطة ({activeQuests?.length || 0})
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === 'completed' 
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setSelectedTab('completed')}
          >
            المهام المكتملة
          </button>
        </div>

        {/* Quest List */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'active' && (
            <div className="space-y-4">
              {activeQuests && activeQuests.length > 0 ? (
                activeQuests.map((quest) => (
                  <div 
                    key={quest.id} 
                    className={`border-2 rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-all ${getQuestTypeColor(quest.type)}`}
                    onClick={() => onQuestSelect && onQuestSelect(quest)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getQuestIcon(quest.type)}
                        <div>
                          <h4 className="text-lg font-semibold text-white">{quest.title}</h4>
                          <p className="text-sm text-gray-300">{quest.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                              {quest.type === 'main' ? 'مهمة رئيسية' : 
                               quest.type === 'elemental' ? 'مهمة عنصرية' : 
                               quest.type === 'tutorial' ? 'تعليمي' : 'مهمة جانبية'}
                            </span>
                            <span className="text-xs text-gray-400">الفصل {quest.chapter}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-purple-300 mb-1">
                          {calculateQuestProgress(quest).toFixed(0)}%
                        </div>
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${calculateQuestProgress(quest)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Objectives */}
                    <div className="space-y-2">
                      {quest.objectives?.map((objective, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          {objective.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          )}
                          <span className={objective.completed ? 'text-green-300 line-through' : 'text-white'}>
                            {objective.text}
                          </span>
                          {objective.target && (
                            <span className="text-gray-400 text-xs">
                              ({objective.progress || 0}/{objective.target})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Rewards Preview */}
                    {quest.rewards && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          {quest.rewards.experience && (
                            <span>🌟 {quest.rewards.experience} خبرة</span>
                          )}
                          {quest.rewards.skillPoints && (
                            <span>⚡ {quest.rewards.skillPoints} نقاط مهارة</span>
                          )}
                          {quest.rewards.items && quest.rewards.items.length > 0 && (
                            <span>🎁 {quest.rewards.items.length} عنصر</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">لا توجد مهام نشطة</h3>
                  <p className="text-gray-500">ابحث عن شخصيات في العالم لتلقي مهام جديدة</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'completed' && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">المهام المكتملة</h3>
              <p className="text-gray-500">ستظهر هنا المهام التي أكملتها</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>استخدم مفتاح Q لفتح سجل المهام</span>
            <span>انقر على مهمة لعرض التفاصيل</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestPanel

