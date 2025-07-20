import './InventoryPanel.css'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  X, 
  Sword, 
  Shield, 
  Gem, 
  Leaf, 
  Package, 
  Sparkles, 
  Star, 
  Crown,
  Zap,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Settings,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { useState, useEffect } from 'react'

const InventoryPanel = ({ isOpen, onClose, player }) => {
  const [viewport, setViewport] = useState({ width: 1024, height: 768 })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    if (typeof window !== 'undefined') {
      updateViewport()
      window.addEventListener('resize', updateViewport)
      return () => window.removeEventListener('resize', updateViewport)
    }
  }, [])

  const isMobile = viewport.width < 640
  const isTablet = viewport.width >= 640 && viewport.width < 1024
  const isDesktop = viewport.width >= 1024

  const inventoryItems = [
    { 
      id: 1, 
      name: 'سيف النار المقدس', 
      type: 'weapon', 
      rarity: 'legendary', 
      icon: Sword, 
      quantity: 1, 
      description: 'سيف مشتعل محاط بلهيب أزرق، يلحق ضرراً نارياً مدمراً',
      stats: { attack: 85, fire: 25 },
      level: 15,
      durability: 89,
      maxDurability: 100
    },
    { 
      id: 2, 
      name: 'درع الأرض الكريستالي', 
      type: 'armor', 
      rarity: 'epic', 
      icon: Shield, 
      quantity: 1, 
      description: 'درع مصنوع من كريستال الأرض النقي، يوفر حماية استثنائية',
      stats: { defense: 65, earth: 20 },
      level: 12,
      durability: 95,
      maxDurability: 100
    },
    { 
      id: 3, 
      name: 'بلورة الماء المتدفقة', 
      type: 'material', 
      rarity: 'rare', 
      icon: Gem, 
      quantity: 15, 
      description: 'بلورة سحرية نقية تحتوي على جوهر المحيطات',
      stats: { water: 15 },
      level: 8
    },
    { 
      id: 4, 
      name: 'عشبة الشفاء الذهبية', 
      type: 'consumable', 
      rarity: 'uncommon', 
      icon: Leaf, 
      quantity: 8, 
      description: 'عشبة طبية نادرة تستعيد الصحة بالكامل فوراً',
      effect: '+100 صحة',
      level: 5
    },
    { 
      id: 5, 
      name: 'جوهرة الهواء العاصف', 
      type: 'material', 
      rarity: 'epic', 
      icon: Gem, 
      quantity: 3, 
      description: 'جوهرة نادرة تحتوي على قوة الأعاصير والعواصف',
      stats: { air: 30, speed: 15 },
      level: 18
    },
    { 
      id: 6, 
      name: 'تاج السيطرة العنصري', 
      type: 'accessory', 
      rarity: 'legendary', 
      icon: Crown, 
      quantity: 1, 
      description: 'تاج أسطوري يمنح السيطرة على جميع العناصر',
      stats: { allElements: 50, mana: 100 },
      level: 25,
      durability: 100,
      maxDurability: 100
    },
    { 
      id: 7, 
      name: 'جرعة القوة الخارقة', 
      type: 'consumable', 
      rarity: 'rare', 
      icon: Leaf, 
      quantity: 5, 
      description: 'جرعة سحرية تزيد القوة مؤقتاً',
      effect: '+50 هجوم لمدة 10 دقائق',
      level: 10
    },
    { 
      id: 8, 
      name: 'خاتم السرعة', 
      type: 'accessory', 
      rarity: 'rare', 
      icon: Crown, 
      quantity: 1, 
      description: 'خاتم سحري يزيد سرعة الحركة',
      stats: { speed: 25, agility: 15 },
      level: 8,
      durability: 78,
      maxDurability: 100
    }
  ]

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400 bg-gray-400/10'
      case 'uncommon': return 'text-green-400 border-green-400 bg-green-400/10'
      case 'rare': return 'text-blue-400 border-blue-400 bg-blue-400/10'
      case 'epic': return 'text-purple-400 border-purple-400 bg-purple-400/10'
      case 'legendary': return 'text-orange-400 border-orange-400 bg-orange-400/10'
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10'
    }
  }

  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-600 to-gray-500'
      case 'uncommon': return 'from-green-600 to-green-500'
      case 'rare': return 'from-blue-600 to-blue-500'
      case 'epic': return 'from-purple-600 to-purple-500'
      case 'legendary': return 'from-orange-600 via-yellow-500 to-orange-500'
      default: return 'from-gray-600 to-gray-500'
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
      case 'accessory': return Crown
      default: return Package
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'weapon': return 'text-red-400'
      case 'armor': return 'text-blue-400'
      case 'material': return 'text-cyan-400'
      case 'consumable': return 'text-green-400'
      case 'accessory': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const filterItemsByType = (type) => {
    if (type === 'all') return inventoryItems
    return inventoryItems.filter(item => item.type === type)
  }

  // Responsive calculations based on viewport
  const particleCount = isMobile ? 15 : isTablet ? 20 : 25
  const insidePanelParticles = isMobile ? 6 : isTablet ? 9 : 12
  const sparkleSize = isMobile ? 6 : 10
  const legendarySparkles = isMobile ? 2 : 4
  const maxStats = isMobile ? 2 : 4

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6">
      {/* Enhanced Background Overlay - Responsive */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}>
        {/* Magical background particles - Less on mobile */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: particleCount }, (_, i) => (
            <div
              key={i}
              className="absolute animate-bounce opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <Sparkles 
                className="text-purple-300" 
                size={4 + Math.random() * sparkleSize}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Main Panel - Adapts to all viewports */}
      <Card className="inventory-panel relative w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl h-full max-h-[90vh] sm:max-h-[85vh] bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 border-2 border-purple-500/30 shadow-2xl backdrop-blur-lg overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
        {/* Magical glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl lg:rounded-3xl blur-sm" />
        
        {/* Floating particles inside panel - Responsive count */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: insidePanelParticles }, (_, i) => (
            <div
              key={i}
              className="absolute animate-pulse magical-particle"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full opacity-40" />
            </div>
          ))}
        </div>

        <CardHeader className="relative z-10 border-b border-purple-500/20 bg-black/30 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
              <div className="relative">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-purple-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full flex items-center justify-center border border-white">
                  <span className="text-xs text-black font-bold">{inventoryItems.length}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  حقيبة المغامر
                </CardTitle>
                <p className="text-gray-300 text-xs sm:text-sm hidden sm:block">مجموعة من الأسلحة والكنوز السحرية النادرة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Quick actions - Show fewer on mobile */}
              <Button variant="outline" size="sm" className="bg-black/30 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 btn-ripple text-xs sm:text-sm px-2 sm:px-3">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">بحث</span>
              </Button>
              {!isMobile && (
                <Button variant="outline" size="sm" className="bg-black/30 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 btn-ripple hidden md:inline-flex text-xs sm:text-sm">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  تصفية
                </Button>
              )}
              {isDesktop && (
                <Button variant="outline" size="sm" className="bg-black/30 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 btn-ripple hidden lg:inline-flex text-xs sm:text-sm">
                  <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  ترتيب
                </Button>
              )}
              
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 p-0 btn-ripple"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-2 sm:p-4 lg:p-6 h-full overflow-hidden">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            {/* Responsive Tab List */}
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} mb-3 sm:mb-4 lg:mb-6 bg-black/30 border border-purple-500/20 rounded-xl sm:rounded-2xl p-1`}>
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm">
                <Grid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {!isMobile && <span>الكل</span>}
              </TabsTrigger>
              <TabsTrigger value="weapon" className="data-[state=active]:bg-red-500/30 data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm">
                <Sword className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {!isMobile && <span>أسلحة</span>}
              </TabsTrigger>
              <TabsTrigger value="armor" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {!isMobile && <span>دروع</span>}
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="material" className="data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {isDesktop && <span>مواد</span>}
                  </TabsTrigger>
                  <TabsTrigger value="consumable" className="data-[state=active]:bg-green-500/30 data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm">
                    <Leaf className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {isDesktop && <span>استهلاكيات</span>}
                  </TabsTrigger>
                  <TabsTrigger value="accessory" className="data-[state=active]:bg-yellow-500/30 data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {isDesktop && <span>إكسسوارات</span>}
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Dynamic Items Content - Viewport aware grid */}
            {['all', 'weapon', 'armor', 'material', 'consumable', 'accessory'].map(tabValue => (
              <TabsContent key={tabValue} value={tabValue} className="flex-1 overflow-y-auto inventory-scroll tab-content">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                  {filterItemsByType(tabValue).map((item, index) => {
                    const Icon = getTypeIcon(item.type)
                    const rarityColors = getRarityColor(item.rarity)
                    const rarityGradient = getRarityGradient(item.rarity)
                    const typeColor = getTypeColor(item.type)
                    
                    return (
                      <Card
                        key={item.id}
                        className={`
                          item-card group cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2
                          bg-gradient-to-br from-slate-800/80 via-slate-700/80 to-slate-800/80 
                          backdrop-blur-sm border-2 border-opacity-30 relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl
                          hover:shadow-2xl hover:shadow-purple-500/25
                          ${rarityColors}
                        `}
                        style={{
                          animationDelay: `${index * 0.1}s`
                        }}
                        data-rarity={item.rarity}
                      >
                        {/* Card magical glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-5 group-hover:opacity-15 transition-opacity duration-300 rounded-lg sm:rounded-xl lg:rounded-2xl`} />
                        
                        {/* Legendary sparkle effect - Fewer on mobile */}
                        {item.rarity === 'legendary' && (
                          <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: legendarySparkles }, (_, i) => (
                              <Star
                                key={i}
                                className="absolute text-yellow-400 animate-pulse opacity-60"
                                size={isMobile ? 6 : 8}
                                style={{
                                  top: `${15 + i * 25}%`,
                                  left: `${15 + i * 20}%`,
                                  animationDelay: `${i * 0.7}s`,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <CardHeader className="p-2 sm:p-3 lg:p-4 relative z-10">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="relative group-hover:scale-110 transition-transform duration-300">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br ${rarityGradient} flex items-center justify-center shadow-lg border-2 border-white/20`}>
                                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-white drop-shadow-lg`} />
                              </div>
                              {/* Level indicator */}
                              {item.level && (
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 bg-yellow-500 rounded-full flex items-center justify-center border border-yellow-300 text-xs font-bold text-black shadow-lg">
                                  {item.level}
                                </div>
                              )}
                            </div>
                            
                            {/* Quantity indicator */}
                            {item.quantity > 1 && (
                              <Badge variant="secondary" className="bg-black/50 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1">
                                ×{item.quantity}
                              </Badge>
                            )}
                          </div>

                          <CardTitle className="text-white text-xs sm:text-sm lg:text-base font-bold group-hover:text-purple-200 transition-colors duration-300 line-clamp-2 mb-1 sm:mb-2">
                            {item.name}
                          </CardTitle>
                          
                          <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 ${rarityColors} font-semibold`}
                            >
                              {getRarityName(item.rarity)}
                            </Badge>
                            <Badge variant="secondary" className={`text-xs ${typeColor} bg-black/30 px-1.5 py-0.5 sm:px-2 sm:py-1`}>
                              {item.type === 'weapon' ? 'سلاح' :
                               item.type === 'armor' ? 'درع' :
                               item.type === 'material' ? 'مادة' :
                               item.type === 'consumable' ? 'استهلاكي' :
                               item.type === 'accessory' ? 'إكسسوار' : item.type}
                            </Badge>
                          </div>

                          {/* Durability bar for equipment */}
                          {item.durability && (
                            <div className="mb-2 sm:mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400">المتانة</span>
                                <span className="text-xs text-white font-bold">{item.durability}/{item.maxDurability}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1 sm:h-1.5">
                                <div 
                                  className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${
                                    item.durability > 70 ? 'bg-green-500' :
                                    item.durability > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </CardHeader>

                        <CardContent className="p-2 sm:p-3 lg:p-4 pt-0 relative z-10">
                          <p className="text-gray-300 text-xs leading-relaxed mb-2 sm:mb-3 group-hover:text-white transition-colors duration-300 line-clamp-2 sm:line-clamp-3">
                            {item.description}
                          </p>

                          {/* Stats display - Responsive layout */}
                          {item.stats && (
                            <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                              <p className="text-xs font-semibold text-purple-300">الإحصائيات:</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {Object.entries(item.stats).slice(0, maxStats).map(([stat, value]) => (
                                  <div key={stat} className="flex items-center justify-between bg-black/20 rounded-lg px-1.5 py-1 sm:px-2">
                                    <span className="text-xs text-gray-400 truncate">
                                      {stat === 'attack' ? 'هجوم' :
                                       stat === 'defense' ? 'دفاع' :
                                       stat === 'fire' ? 'نار' :
                                       stat === 'water' ? 'ماء' :
                                       stat === 'earth' ? 'أرض' :
                                       stat === 'air' ? 'هواء' :
                                       stat === 'allElements' ? 'عناصر' :
                                       stat === 'mana' ? 'سحر' :
                                       stat === 'speed' ? 'سرعة' :
                                       stat === 'agility' ? 'رشاقة' : stat}
                                    </span>
                                    <span className="text-xs font-bold text-green-400">+{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Effect display for consumables */}
                          {item.effect && (
                            <div className="mb-2 sm:mb-3">
                              <Badge variant="outline" className="text-xs text-green-400 border-green-400 bg-green-400/10 px-1.5 py-0.5 sm:px-2 sm:py-1">
                                <Zap className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                <span className="truncate">{item.effect}</span>
                              </Badge>
                            </div>
                          )}

                          {/* Action buttons - Responsive */}
                          <div className="flex gap-1 sm:gap-2">
                            <Button 
                              size="sm" 
                              className={`flex-1 bg-gradient-to-r ${rarityGradient} hover:opacity-90 text-white font-bold text-xs py-1.5 sm:py-2 btn-ripple`}
                            >
                              {item.type === 'consumable' ? 'استخدام' : 'تجهيز'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-black/30 border-gray-500/30 text-gray-300 hover:bg-gray-500/20 text-xs p-1.5 sm:p-2 btn-ripple"
                            >
                              <MoreHorizontal className="h-2 w-2 sm:h-3 sm:w-3" />
                            </Button>
                          </div>
                        </CardContent>

                        {/* Enhanced hover border effect */}
                        <div className={`absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 border-transparent group-hover:border-opacity-60 transition-all duration-300 pointer-events-none`} 
                             style={{ borderColor: item.rarity === 'legendary' ? '#fb923c' : 
                                                    item.rarity === 'epic' ? '#a855f7' :
                                                    item.rarity === 'rare' ? '#3b82f6' :
                                                    item.rarity === 'uncommon' ? '#10b981' : '#6b7280' }} />
                      </Card>
                    )
                  })}
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

