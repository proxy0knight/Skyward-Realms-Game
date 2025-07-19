import './InventoryPanel.css'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { X, Sword, Shield, Gem, Leaf, Package } from 'lucide-react'

const InventoryPanel = ({ isOpen, onClose, player }) => {
  const inventoryItems = [
    { id: 1, name: 'سيف النار', type: 'weapon', rarity: 'rare', icon: Sword, quantity: 1, description: 'سيف مشتعل يلحق ضرراً نارياً إضافياً' },
    { id: 2, name: 'درع الأرض', type: 'armor', rarity: 'uncommon', icon: Shield, quantity: 1, description: 'درع صخري يوفر حماية قوية' },
    { id: 3, name: 'بلورة الماء', type: 'material', rarity: 'common', icon: Gem, quantity: 15, description: 'بلورة سحرية تحتوي على طاقة مائية' },
    { id: 4, name: 'عشبة الشفاء', type: 'consumable', rarity: 'common', icon: Leaf, quantity: 8, description: 'عشبة طبية تستعيد الصحة' },
    { id: 5, name: 'جوهرة الهواء', type: 'material', rarity: 'epic', icon: Gem, quantity: 3, description: 'جوهرة نادرة تحتوي على قوة الرياح' },
  ]

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400'
      case 'uncommon': return 'text-green-400 border-green-400'
      case 'rare': return 'text-blue-400 border-blue-400'
      case 'epic': return 'text-purple-400 border-purple-400'
      case 'legendary': return 'text-orange-400 border-orange-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  const getRarityName = (rarity) => {
    switch (rarity) {
      case 'common': return 'عادي'
      case 'uncommon': return 'غير عادي'
      case 'rare': return 'نادر'
      case 'epic': return 'ملحمي'
      case 'legendary': return 'أسطوري'
      default: return 'عادي'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'weapon': return Sword
      case 'armor': return Shield
      case 'material': return Gem
      case 'consumable': return Leaf
      default: return Package
    }
  }

  const filterItemsByType = (type) => {
    if (type === 'all') return inventoryItems
    return inventoryItems.filter(item => item.type === type)
  }

  if (!isOpen) return null

  return (
    <div className="hud-panel-glass absolute top-2 sm:top-4 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-96 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] z-20" data-ui-element="inventory-panel">
      <Card className="h-full bg-transparent border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl text-white">المخزون</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <Tabs defaultValue="all" className="h-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
              <TabsTrigger value="all" className="text-xs">الكل</TabsTrigger>
              <TabsTrigger value="weapon" className="text-xs">أسلحة</TabsTrigger>
              <TabsTrigger value="armor" className="text-xs">دروع</TabsTrigger>
              <TabsTrigger value="material" className="text-xs">مواد</TabsTrigger>
              <TabsTrigger value="consumable" className="text-xs">استهلاكية</TabsTrigger>
            </TabsList>
            
            {['all', 'weapon', 'armor', 'material', 'consumable'].map(type => (
              <TabsContent key={type} value={type} className="mt-4 h-[calc(100%-3rem)] overflow-y-auto">
                <div className="grid grid-cols-6 gap-2">
                  {filterItemsByType(type).map((item) => {
                    const IconComponent = getTypeIcon(item.type)
                    return (
                      <div
                        key={item.id}
                        className={`relative aspect-square bg-gray-800/60 border rounded-lg p-2 cursor-pointer hover:bg-gray-700/60 transition-colors ${getRarityColor(item.rarity)}`}
                        title={item.description}
                      >
                        <IconComponent className="w-full h-full text-gray-300" />
                        {item.quantity > 1 && (
                          <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs rounded px-1 min-w-[1.25rem] text-center">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 48 - filterItemsByType(type).length) }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square bg-gray-900/40 border border-gray-700 rounded-lg"
                    />
                  ))}
                </div>
                
                {/* Item Details */}
                <div className="mt-4 space-y-2">
                  {filterItemsByType(type).map((item) => (
                    <div
                      key={`detail-${item.id}`}
                      className="bg-gray-800/40 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{item.name}</h4>
                        <Badge variant="outline" className={getRarityColor(item.rarity)}>
                          {getRarityName(item.rarity)}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm">{item.description}</p>
                      {item.quantity > 1 && (
                        <p className="text-gray-400 text-xs mt-1">الكمية: {item.quantity}</p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default InventoryPanel

