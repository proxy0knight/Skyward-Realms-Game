export class StorySystem {
  constructor(gameEngine, playerManager, worldManager) {
    this.gameEngine = gameEngine
    this.playerManager = playerManager
    this.worldManager = worldManager
    this.currentChapter = 1
    this.activeQuests = new Map()
    this.completedQuests = new Set()
    this.storyProgress = {
      mainStoryProgress: 0,
      chaptersCompleted: 0,
      totalChapters: 5,
      sideQuestsCompleted: 0,
      totalSideQuests: 12
    }
    this.characters = new Map()
    this.dialogues = new Map()
    
    this.initializeStory()
    this.initializeCharacters()
    this.initializeQuests()
  }

  // Initialize main story
  initializeStory() {
    this.mainStory = {
      title: 'صدى العناصر',
      description: 'ملحمة عن توازن العناصر الأربعة في عالم سكايوارد ريلمز',
      chapters: {
        1: {
          title: 'الصحوة',
          description: 'يستيقظ البطل في عالم غامض مليء بالطاقة السحرية',
          objectives: [
            'اختر عنصرك الأساسي',
            'تعلم المهارات الأساسية',
            'استكشف المنطقة المحايدة',
            'التقِ بالحكيم إلدريك'
          ],
          rewards: {
            experience: 1000,
            items: ['عصا المبتدئ', 'جرعة شفاء كبيرة'],
            skillPoints: 3
          }
        },
        2: {
          title: 'التوازن المفقود',
          description: 'اكتشاف أن التوازن بين العناصر قد اختل',
          objectives: [
            'زر جميع عوالم العناصر الأربعة',
            'اجمع شظايا القوة القديمة',
            'هزم حراس العناصر الفاسدين',
            'استعد قوة العنصر المختار'
          ],
          rewards: {
            experience: 2000,
            items: ['تاج العناصر', 'درع الحماية الأسطوري'],
            skillPoints: 5
          }
        },
        3: {
          title: 'الظلال الصاعدة',
          description: 'ظهور قوة الظلام التي تهدد جميع العناصر',
          objectives: [
            'اكتشف مصدر قوة الظلام',
            'اجمع حلفاء من كل عنصر',
            'تعلم مهارات الدمج العنصري',
            'واجه جنرالات الظلام الثلاثة'
          ],
          rewards: {
            experience: 3000,
            items: ['سيف الضوء', 'عباءة النجوم'],
            skillPoints: 7
          }
        },
        4: {
          title: 'اتحاد العناصر',
          description: 'توحيد قوى العناصر الأربعة لمواجهة التهديد الأعظم',
          objectives: [
            'أتقن تقنيات الدمج العنصري',
            'اجمع أسياد العناصر الأربعة',
            'اقتحم قلعة الظلام',
            'واجه سيد الظلام الأعظم'
          ],
          rewards: {
            experience: 4000,
            items: ['تاج سيد العناصر', 'جوهرة القوة الأبدية'],
            skillPoints: 10
          }
        },
        5: {
          title: 'استعادة التوازن',
          description: 'المعركة النهائية لاستعادة التوازن إلى العالم',
          objectives: [
            'واجه إله الظلام القديم',
            'استخدم قوة العناصر المتحدة',
            'أعد التوازن إلى العالم',
            'أصبح حارس التوازن الجديد'
          ],
          rewards: {
            experience: 5000,
            items: ['عرش العناصر', 'صولجان التوازن الأبدي'],
            skillPoints: 15,
            title: 'حارس التوازن الأعظم'
          }
        }
      }
    }
  }

  // Initialize characters
  initializeCharacters() {
    const characters = {
      eldric: {
        name: 'الحكيم إلدريك',
        title: 'حارس المعرفة القديمة',
        element: 'neutral',
        role: 'mentor',
        location: { x: 0, z: 0 },
        description: 'حكيم عجوز يحمل أسرار العناصر القديمة ويرشد الأبطال الجدد',
        personality: 'حكيم، صبور، غامض',
        dialogues: {
          first_meeting: {
            text: 'أهلاً بك، أيها المختار. لقد كنت أنتظرك منذ زمن طويل. العالم في خطر، والعناصر تصرخ طلباً للمساعدة.',
            options: [
              { text: 'من أنت؟ وماذا تعني بالمختار؟', response: 'first_meeting_who' },
              { text: 'أخبرني عن هذا الخطر', response: 'first_meeting_danger' },
              { text: 'كيف يمكنني المساعدة؟', response: 'first_meeting_help' }
            ]
          },
          first_meeting_who: {
            text: 'أنا إلدريك، آخر حراس المعرفة القديمة. أنت المختار الذي تنبأت به النبوءات القديمة - الوحيد القادر على استعادة التوازن.',
            options: [
              { text: 'ما هي هذه النبوءة؟', response: 'prophecy_explanation' },
              { text: 'لست أشعر بأنني مميز', response: 'doubt_response' }
            ]
          },
          first_meeting_danger: {
            text: 'قوة الظلام القديمة تستيقظ. إنها تفسد العناصر وتخل بالتوازن الذي حافظنا عليه لآلاف السنين. إذا لم نتحرك سريعاً، فسيغرق العالم في الفوضى.',
            options: [
              { text: 'كيف بدأ هذا؟', response: 'darkness_origin' },
              { text: 'ما الذي يمكنني فعله؟', response: 'player_role' }
            ]
          },
          first_meeting_help: {
            text: 'أولاً، يجب أن تختار عنصرك الأساسي وتتقن قوته. ثم عليك زيارة عوالم العناصر الأربعة وجمع شظايا القوة القديمة.',
            options: [
              { text: 'أخبرني عن العناصر', response: 'elements_explanation' },
              { text: 'أين أجد هذه الشظايا؟', response: 'shards_location' }
            ]
          }
        },
        quests: ['main_awakening', 'tutorial_elements', 'gather_shards']
      },
      
      pyra: {
        name: 'بايرا',
        title: 'سيدة اللهب',
        element: 'fire',
        role: 'elemental_master',
        location: { x: 75, z: 75 },
        description: 'سيدة عنصر النار، محاربة شرسة بقلب دافئ',
        personality: 'شجاعة، متحمسة، وفية',
        dialogues: {
          first_meeting: {
            text: 'أشعر بقوة النار تتدفق منك! أنت تحمل شعلة الأمل التي انتظرناها طويلاً.',
            options: [
              { text: 'علميني قوة النار', response: 'fire_training' },
              { text: 'ما الذي يهدد عالم النار؟', response: 'fire_threat' }
            ]
          },
          fire_training: {
            text: 'النار ليست مجرد تدمير، بل هي الحياة والشغف والتجديد. دعني أعلمك أسرار اللهب الأبدي.',
            options: [
              { text: 'أريد أن أتعلم', response: 'accept_training' },
              { text: 'أحتاج وقتاً للتفكير', response: 'delay_training' }
            ]
          }
        },
        quests: ['fire_mastery', 'flame_guardian', 'phoenix_trial']
      },
      
      aqua: {
        name: 'أكوا',
        title: 'حارسة المياه',
        element: 'water',
        role: 'elemental_master',
        location: { x: -75, z: 75 },
        description: 'حارسة عنصر الماء، شافية حكيمة ومحاربة ماهرة',
        personality: 'هادئة، حكيمة، رحيمة',
        dialogues: {
          first_meeting: {
            text: 'المياه تهمس باسمك، أيها المختار. تعال، دعني أشفي جراحك وأعلمك أسرار التدفق الأبدي.',
            options: [
              { text: 'أحتاج إلى قوة الشفاء', response: 'water_healing' },
              { text: 'علميني التحكم في الماء', response: 'water_control' }
            ]
          }
        },
        quests: ['water_mastery', 'healing_spring', 'tide_guardian']
      },
      
      terra: {
        name: 'تيرا',
        title: 'حارس الأرض',
        element: 'earth',
        role: 'elemental_master',
        location: { x: -75, z: -75 },
        description: 'حارس عنصر الأرض، قوي كالجبال وثابت كالصخر',
        personality: 'صبور، قوي، موثوق',
        dialogues: {
          first_meeting: {
            text: 'الأرض تهتز تحت أقدامك، لكنها تهتز من الفرح لا من الخوف. أنت من ستعيد الاستقرار إلى عالمنا.',
            options: [
              { text: 'علمني قوة الأرض', response: 'earth_training' },
              { text: 'كيف أحمي الآخرين؟', response: 'earth_protection' }
            ]
          }
        },
        quests: ['earth_mastery', 'mountain_trial', 'stone_guardian']
      },
      
      zephyr: {
        name: 'زيفير',
        title: 'سيد الرياح',
        element: 'air',
        role: 'elemental_master',
        location: { x: 75, z: -75 },
        description: 'سيد عنصر الهواء، سريع كالبرق وحر كالريح',
        personality: 'مرح، سريع، مغامر',
        dialogues: {
          first_meeting: {
            text: 'الرياح تحمل أخبارك إلى كل مكان! أنت سريع التعلم، دعني أعلمك كيف تطير مع العاصفة.',
            options: [
              { text: 'أريد أن أتعلم الطيران', response: 'air_flight' },
              { text: 'علمني قوة العاصفة', response: 'air_storm' }
            ]
          }
        },
        quests: ['air_mastery', 'wind_trial', 'storm_guardian']
      },
      
      shadow_lord: {
        name: 'سيد الظلام',
        title: 'المدمر الأعظم',
        element: 'darkness',
        role: 'main_antagonist',
        location: { x: 0, z: 200 },
        description: 'كائن قديم من الظلام يسعى لتدمير التوازن وإغراق العالم في الفوضى',
        personality: 'شرير، ماكر، قوي',
        dialogues: {
          final_confrontation: {
            text: 'أخيراً، المختار الصغير يأتي ليواجهني. هل تعتقد أن قوتك الضئيلة يمكنها أن توقف الظلام الأبدي؟',
            options: [
              { text: 'سأوقفك مهما كلف الأمر!', response: 'heroic_defiance' },
              { text: 'لماذا تريد تدمير العالم؟', response: 'villain_motivation' }
            ]
          }
        },
        quests: ['final_battle', 'darkness_origin']
      }
    }

    Object.entries(characters).forEach(([id, character]) => {
      this.characters.set(id, character)
    })
  }

  // Initialize quests
  initializeQuests() {
    const quests = {
      main_awakening: {
        id: 'main_awakening',
        title: 'الصحوة',
        type: 'main',
        chapter: 1,
        description: 'ابدأ رحلتك في عالم سكايوارد ريلمز',
        objectives: [
          { id: 'choose_element', text: 'اختر عنصرك الأساسي', completed: false },
          { id: 'learn_movement', text: 'تعلم الحركة الأساسية', completed: false },
          { id: 'meet_eldric', text: 'التقِ بالحكيم إلدريك', completed: false }
        ],
        rewards: {
          experience: 500,
          items: ['جرعة شفاء', 'خريطة العالم'],
          skillPoints: 2
        },
        giver: 'eldric',
        location: { x: 0, z: 0 }
      },
      
      tutorial_elements: {
        id: 'tutorial_elements',
        title: 'أساسيات العناصر',
        type: 'tutorial',
        chapter: 1,
        description: 'تعلم أساسيات التحكم في العناصر',
        objectives: [
          { id: 'use_basic_skill', text: 'استخدم مهارتك الأساسية 5 مرات', completed: false, progress: 0, target: 5 },
          { id: 'collect_crystals', text: 'اجمع 3 بلورات عنصرية', completed: false, progress: 0, target: 3 },
          { id: 'defeat_enemies', text: 'هزم 2 من الأعداء', completed: false, progress: 0, target: 2 }
        ],
        rewards: {
          experience: 300,
          items: ['بلورة طاقة'],
          skillPoints: 1
        },
        giver: 'eldric'
      },
      
      gather_shards: {
        id: 'gather_shards',
        title: 'جمع الشظايا',
        type: 'main',
        chapter: 2,
        description: 'اجمع شظايا القوة القديمة من عوالم العناصر',
        objectives: [
          { id: 'fire_shard', text: 'احصل على شظية النار', completed: false },
          { id: 'water_shard', text: 'احصل على شظية الماء', completed: false },
          { id: 'earth_shard', text: 'احصل على شظية الأرض', completed: false },
          { id: 'air_shard', text: 'احصل على شظية الهواء', completed: false }
        ],
        rewards: {
          experience: 1500,
          items: ['تاج العناصر الصغير'],
          skillPoints: 5
        },
        giver: 'eldric'
      },
      
      fire_mastery: {
        id: 'fire_mastery',
        title: 'إتقان النار',
        type: 'elemental',
        chapter: 2,
        description: 'أتقن قوة عنصر النار مع بايرا',
        objectives: [
          { id: 'fire_training', text: 'أكمل تدريب النار', completed: false },
          { id: 'defeat_fire_guardian', text: 'هزم حارس النار الفاسد', completed: false },
          { id: 'light_eternal_flame', text: 'أشعل الشعلة الأبدية', completed: false }
        ],
        rewards: {
          experience: 800,
          items: ['عباءة اللهب', 'شظية النار'],
          skillPoints: 3
        },
        giver: 'pyra',
        location: { x: 75, z: 75 }
      },
      
      water_mastery: {
        id: 'water_mastery',
        title: 'إتقان الماء',
        type: 'elemental',
        chapter: 2,
        description: 'أتقن قوة عنصر الماء مع أكوا',
        objectives: [
          { id: 'water_training', text: 'أكمل تدريب الماء', completed: false },
          { id: 'purify_spring', text: 'طهر النبع المقدس', completed: false },
          { id: 'heal_wounded', text: 'اشف 10 جرحى', completed: false, progress: 0, target: 10 }
        ],
        rewards: {
          experience: 800,
          items: ['عصا الشفاء', 'شظية الماء'],
          skillPoints: 3
        },
        giver: 'aqua',
        location: { x: -75, z: 75 }
      },
      
      earth_mastery: {
        id: 'earth_mastery',
        title: 'إتقان الأرض',
        type: 'elemental',
        chapter: 2,
        description: 'أتقن قوة عنصر الأرض مع تيرا',
        objectives: [
          { id: 'earth_training', text: 'أكمل تدريب الأرض', completed: false },
          { id: 'move_mountain', text: 'حرك الجبل المقدس', completed: false },
          { id: 'protect_village', text: 'احم القرية من الانهيار', completed: false }
        ],
        rewards: {
          experience: 800,
          items: ['درع الصخر', 'شظية الأرض'],
          skillPoints: 3
        },
        giver: 'terra',
        location: { x: -75, z: -75 }
      },
      
      air_mastery: {
        id: 'air_mastery',
        title: 'إتقان الهواء',
        type: 'elemental',
        chapter: 2,
        description: 'أتقن قوة عنصر الهواء مع زيفير',
        objectives: [
          { id: 'air_training', text: 'أكمل تدريب الهواء', completed: false },
          { id: 'calm_storm', text: 'اهدئ العاصفة الغاضبة', completed: false },
          { id: 'reach_sky_temple', text: 'اصل إلى معبد السماء', completed: false }
        ],
        rewards: {
          experience: 800,
          items: ['أجنحة الريح', 'شظية الهواء'],
          skillPoints: 3
        },
        giver: 'zephyr',
        location: { x: 75, z: -75 }
      },
      
      unite_elements: {
        id: 'unite_elements',
        title: 'اتحاد العناصر',
        type: 'main',
        chapter: 4,
        description: 'وحد قوى العناصر الأربعة',
        objectives: [
          { id: 'master_fusion', text: 'أتقن تقنيات الدمج العنصري', completed: false },
          { id: 'gather_masters', text: 'اجمع أسياد العناصر الأربعة', completed: false },
          { id: 'forge_unity_weapon', text: 'اصنع سلاح الوحدة', completed: false }
        ],
        rewards: {
          experience: 2500,
          items: ['سيف العناصر المتحدة', 'تاج الوحدة'],
          skillPoints: 8
        },
        giver: 'eldric'
      },
      
      final_battle: {
        id: 'final_battle',
        title: 'المعركة النهائية',
        type: 'main',
        chapter: 5,
        description: 'واجه سيد الظلام واستعد التوازن',
        objectives: [
          { id: 'enter_shadow_realm', text: 'ادخل عالم الظلام', completed: false },
          { id: 'defeat_shadow_lord', text: 'هزم سيد الظلام', completed: false },
          { id: 'restore_balance', text: 'استعد التوازن إلى العالم', completed: false }
        ],
        rewards: {
          experience: 5000,
          items: ['عرش العناصر', 'صولجان التوازن'],
          skillPoints: 15,
          title: 'حارس التوازن الأعظم'
        },
        giver: 'eldric'
      }
    }

    Object.entries(quests).forEach(([id, quest]) => {
      // Add quest to appropriate character
      if (quest.giver && this.characters.has(quest.giver)) {
        const character = this.characters.get(quest.giver)
        if (!character.availableQuests) {
          character.availableQuests = []
        }
        character.availableQuests.push(quest.id)
      }
    })

    this.allQuests = new Map(Object.entries(quests))
  }

  // Start quest
  startQuest(questId, playerId = 'local_player') {
    const quest = this.allQuests.get(questId)
    if (!quest) return { success: false, message: 'مهمة غير موجودة' }

    if (this.activeQuests.has(questId)) {
      return { success: false, message: 'المهمة نشطة بالفعل' }
    }

    if (this.completedQuests.has(questId)) {
      return { success: false, message: 'المهمة مكتملة بالفعل' }
    }

    // Check chapter requirements
    if (quest.chapter > this.currentChapter) {
      return { success: false, message: 'يجب إكمال الفصول السابقة أولاً' }
    }

    // Create active quest instance
    const activeQuest = {
      ...quest,
      startTime: Date.now(),
      playerId,
      objectives: quest.objectives.map(obj => ({ ...obj })) // Deep copy
    }

    this.activeQuests.set(questId, activeQuest)
    console.log(`بدأت المهمة: ${quest.title}`)

    return { success: true, message: `بدأت المهمة: ${quest.title}`, quest: activeQuest }
  }

  // Update quest progress
  updateQuestProgress(questId, objectiveId, progress = 1) {
    const quest = this.activeQuests.get(questId)
    if (!quest) return false

    const objective = quest.objectives.find(obj => obj.id === objectiveId)
    if (!objective || objective.completed) return false

    if (objective.target) {
      objective.progress = Math.min((objective.progress || 0) + progress, objective.target)
      if (objective.progress >= objective.target) {
        objective.completed = true
        console.log(`تم إنجاز هدف: ${objective.text}`)
      }
    } else {
      objective.completed = true
      console.log(`تم إنجاز هدف: ${objective.text}`)
    }

    // Check if quest is complete
    const allCompleted = quest.objectives.every(obj => obj.completed)
    if (allCompleted) {
      this.completeQuest(questId)
    }

    return true
  }

  // Complete quest
  completeQuest(questId) {
    const quest = this.activeQuests.get(questId)
    if (!quest) return { success: false, message: 'مهمة غير نشطة' }

    // Give rewards
    const player = this.playerManager.getPlayer(quest.playerId)
    if (player) {
      // Experience
      if (quest.rewards.experience) {
        this.playerManager.addExperience(quest.playerId, quest.rewards.experience)
      }

      // Items
      if (quest.rewards.items) {
        quest.rewards.items.forEach(itemName => {
          this.playerManager.addItem(quest.playerId, {
            name: itemName,
            type: 'quest_reward',
            rarity: 'epic',
            quantity: 1
          })
        })
      }

      // Skill points
      if (quest.rewards.skillPoints) {
        player.skills.availablePoints += quest.rewards.skillPoints
      }

      // Title
      if (quest.rewards.title) {
        if (!player.titles) player.titles = []
        player.titles.push(quest.rewards.title)
      }

      this.playerManager.savePlayerData()
    }

    // Move quest to completed
    this.activeQuests.delete(questId)
    this.completedQuests.add(questId)

    // Update story progress
    if (quest.type === 'main') {
      this.storyProgress.mainStoryProgress++
      if (quest.chapter > this.storyProgress.chaptersCompleted) {
        this.storyProgress.chaptersCompleted = quest.chapter
        this.currentChapter = Math.max(this.currentChapter, quest.chapter + 1)
      }
    } else if (quest.type === 'side') {
      this.storyProgress.sideQuestsCompleted++
    }

    console.log(`تمت المهمة: ${quest.title}`)
    console.log(`المكافآت: ${quest.rewards.experience} خبرة، ${quest.rewards.skillPoints} نقاط مهارة`)

    return { 
      success: true, 
      message: `تمت المهمة: ${quest.title}`,
      rewards: quest.rewards
    }
  }

  // Get character dialogue
  getCharacterDialogue(characterId, dialogueId = 'first_meeting') {
    const character = this.characters.get(characterId)
    if (!character || !character.dialogues[dialogueId]) {
      return null
    }

    return {
      character: character.name,
      title: character.title,
      dialogue: character.dialogues[dialogueId]
    }
  }

  // Process dialogue choice
  processDialogueChoice(characterId, dialogueId, choiceIndex) {
    const dialogue = this.getCharacterDialogue(characterId, dialogueId)
    if (!dialogue || !dialogue.dialogue.options[choiceIndex]) {
      return null
    }

    const choice = dialogue.dialogue.options[choiceIndex]
    const nextDialogueId = choice.response

    return this.getCharacterDialogue(characterId, nextDialogueId)
  }

  // Get available quests from character
  getCharacterQuests(characterId) {
    const character = this.characters.get(characterId)
    if (!character || !character.availableQuests) return []

    return character.availableQuests
      .map(questId => this.allQuests.get(questId))
      .filter(quest => quest && !this.activeQuests.has(quest.id) && !this.completedQuests.has(quest.id))
      .filter(quest => quest.chapter <= this.currentChapter)
  }

  // Get active quests
  getActiveQuests() {
    return Array.from(this.activeQuests.values())
  }

  // Get quest by ID
  getQuest(questId) {
    return this.activeQuests.get(questId) || this.allQuests.get(questId)
  }

  // Get story progress
  getStoryProgress() {
    return {
      ...this.storyProgress,
      currentChapter: this.currentChapter,
      activeQuestsCount: this.activeQuests.size,
      completedQuestsCount: this.completedQuests.size,
      totalProgress: (this.storyProgress.mainStoryProgress / 8) * 100 // 8 main quests total
    }
  }

  // Get current chapter info
  getCurrentChapterInfo() {
    return this.mainStory.chapters[this.currentChapter] || null
  }

  // Check if player can access chapter
  canAccessChapter(chapterNumber) {
    return chapterNumber <= this.currentChapter
  }

  // Save story progress
  saveStoryProgress() {
    const data = {
      currentChapter: this.currentChapter,
      storyProgress: this.storyProgress,
      activeQuests: Array.from(this.activeQuests.entries()),
      completedQuests: Array.from(this.completedQuests)
    }

    try {
      localStorage.setItem('skyward_realms_story', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save story progress:', error)
    }
  }

  // Load story progress
  loadStoryProgress() {
    try {
      const savedData = localStorage.getItem('skyward_realms_story')
      if (savedData) {
        const data = JSON.parse(savedData)
        
        this.currentChapter = data.currentChapter || 1
        this.storyProgress = { ...this.storyProgress, ...data.storyProgress }
        
        if (data.activeQuests) {
          this.activeQuests = new Map(data.activeQuests)
        }
        
        if (data.completedQuests) {
          this.completedQuests = new Set(data.completedQuests)
        }
        
        console.log('Story progress loaded')
      }
    } catch (error) {
      console.error('Failed to load story progress:', error)
    }
  }

  // Auto-start initial quest
  autoStartInitialQuest() {
    if (this.activeQuests.size === 0 && this.completedQuests.size === 0) {
      this.startQuest('main_awakening')
    }
  }

  // Cleanup
  dispose() {
    this.saveStoryProgress()
    this.activeQuests.clear()
    this.completedQuests.clear()
    this.characters.clear()
    this.dialogues.clear()
    console.log('Story System disposed')
  }
}

export default StorySystem

