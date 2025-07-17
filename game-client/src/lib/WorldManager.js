import * as THREE from 'three'

export class WorldManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.regions = new Map()
    this.npcs = new Map()
    this.resources = new Map()
    this.structures = new Map()
    this.worldSize = 200
    this.chunkSize = 50
    this.loadedChunks = new Set()
  }

  // Initialize the world
  init() {
    this.createRegions()
    this.generateEnvironment()
    this.spawnResources()
    this.spawnNPCs()
    console.log('World initialized')
  }

  // Create different regions of the world
  createRegions() {
    const regions = [
      {
        id: 'fire_realm',
        name: 'عالم النار',
        center: { x: 75, z: 75 },
        radius: 40,
        element: 'fire',
        color: 0xff4500,
        biome: 'volcanic',
        dangerLevel: 3
      },
      {
        id: 'water_realm',
        name: 'عالم الماء',
        center: { x: -75, z: 75 },
        radius: 40,
        element: 'water',
        color: 0x1e90ff,
        biome: 'oceanic',
        dangerLevel: 2
      },
      {
        id: 'earth_realm',
        name: 'عالم الأرض',
        center: { x: -75, z: -75 },
        radius: 40,
        element: 'earth',
        color: 0x8b4513,
        biome: 'mountainous',
        dangerLevel: 2
      },
      {
        id: 'air_realm',
        name: 'عالم الهواء',
        center: { x: 75, z: -75 },
        radius: 40,
        element: 'air',
        color: 0xe6e6fa,
        biome: 'floating',
        dangerLevel: 4
      },
      {
        id: 'central_hub',
        name: 'المركز المحايد',
        center: { x: 0, z: 0 },
        radius: 30,
        element: 'neutral',
        color: 0x888888,
        biome: 'plains',
        dangerLevel: 1
      }
    ]

    regions.forEach(region => {
      this.regions.set(region.id, region)
    })
  }

  // Generate environment objects
  generateEnvironment() {
    this.regions.forEach(region => {
      this.generateRegionEnvironment(region)
    })
  }

  // Generate environment for a specific region
  generateRegionEnvironment(region) {
    const objectCount = 20 + Math.floor(Math.random() * 30)
    
    for (let i = 0; i < objectCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * region.radius
      const x = region.center.x + Math.cos(angle) * distance
      const z = region.center.z + Math.sin(angle) * distance
      
      this.createEnvironmentObject(region, x, z)
    }
  }

  // Create environment object based on region type
  createEnvironmentObject(region, x, z) {
    let geometry, material, object
    
    switch (region.biome) {
      case 'volcanic':
        // Create volcanic rocks and lava pools
        if (Math.random() < 0.7) {
          geometry = new THREE.DodecahedronGeometry(1 + Math.random() * 2)
          material = new THREE.MeshLambertMaterial({ 
            color: 0x444444,
            emissive: 0x331100
          })
        } else {
          geometry = new THREE.CylinderGeometry(2, 2, 0.2)
          material = new THREE.MeshLambertMaterial({ 
            color: 0xff4500,
            emissive: 0xff2200
          })
        }
        break
        
      case 'oceanic':
        // Create water features and coral
        geometry = new THREE.OctahedronGeometry(1 + Math.random())
        material = new THREE.MeshLambertMaterial({ 
          color: 0x1e90ff,
          transparent: true,
          opacity: 0.8
        })
        break
        
      case 'mountainous':
        // Create rocks and stone formations
        geometry = new THREE.BoxGeometry(
          1 + Math.random() * 2,
          2 + Math.random() * 3,
          1 + Math.random() * 2
        )
        material = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
        break
        
      case 'floating':
        // Create floating platforms
        geometry = new THREE.CylinderGeometry(3, 2, 1)
        material = new THREE.MeshLambertMaterial({ 
          color: 0xe6e6fa,
          transparent: true,
          opacity: 0.9
        })
        break
        
      default:
        // Plains - trees and rocks
        if (Math.random() < 0.6) {
          // Tree
          geometry = new THREE.CylinderGeometry(0.3, 0.5, 4)
          material = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
        } else {
          // Rock
          geometry = new THREE.SphereGeometry(0.5 + Math.random())
          material = new THREE.MeshLambertMaterial({ color: 0x666666 })
        }
        break
    }
    
    object = new THREE.Mesh(geometry, material)
    object.position.set(x, 0, z)
    object.castShadow = true
    object.receiveShadow = true
    
    // Add some random rotation
    object.rotation.y = Math.random() * Math.PI * 2
    
    // Adjust height for floating objects
    if (region.biome === 'floating') {
      object.position.y = 5 + Math.random() * 10
    }
    
    object.userData = {
      type: 'environment',
      region: region.id,
      biome: region.biome
    }
    
    const objectId = `env_${region.id}_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(objectId, object)
    this.structures.set(objectId, object)
  }

  // Spawn resources throughout the world
  spawnResources() {
    this.regions.forEach(region => {
      this.spawnRegionResources(region)
    })
  }

  // Spawn resources in a specific region
  spawnRegionResources(region) {
    const resourceCount = 10 + Math.floor(Math.random() * 15)
    
    for (let i = 0; i < resourceCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * region.radius
      const x = region.center.x + Math.cos(angle) * distance
      const z = region.center.z + Math.sin(angle) * distance
      
      this.createResource(region, x, z)
    }
  }

  // Create a resource node
  createResource(region, x, z) {
    const resourceTypes = {
      fire: ['بلورة النار', 'حجر الحمم', 'رماد سحري'],
      water: ['بلورة الماء', 'لؤلؤة البحر', 'جليد أبدي'],
      earth: ['خام الحديد', 'حجر كريم', 'تراب مقدس'],
      air: ['ريشة الرياح', 'بلورة البرق', 'غبار النجوم'],
      neutral: ['خشب', 'حجر', 'عشب طبي']
    }
    
    const resources = resourceTypes[region.element] || resourceTypes.neutral
    const resourceName = resources[Math.floor(Math.random() * resources.length)]
    
    // Create visual representation
    const geometry = new THREE.OctahedronGeometry(0.5)
    const material = new THREE.MeshLambertMaterial({ 
      color: region.color,
      emissive: region.color,
      emissiveIntensity: 0.2
    })
    
    const resource = new THREE.Mesh(geometry, material)
    resource.position.set(x, 0.5, z)
    resource.castShadow = true
    
    // Add floating animation
    resource.userData = {
      type: 'resource',
      name: resourceName,
      element: region.element,
      rarity: this.getResourceRarity(),
      quantity: 1 + Math.floor(Math.random() * 3),
      respawnTime: 60000, // 1 minute
      originalY: 0.5,
      update: (deltaTime) => {
        resource.position.y = resource.userData.originalY + Math.sin(Date.now() * 0.002) * 0.2
        resource.rotation.y += deltaTime
      }
    }
    
    const resourceId = `resource_${region.id}_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(resourceId, resource)
    this.resources.set(resourceId, resource)
  }

  // Get random resource rarity
  getResourceRarity() {
    const rand = Math.random()
    if (rand < 0.6) return 'common'
    if (rand < 0.85) return 'uncommon'
    if (rand < 0.95) return 'rare'
    if (rand < 0.99) return 'epic'
    return 'legendary'
  }

  // Spawn NPCs
  spawnNPCs() {
    this.regions.forEach(region => {
      if (region.id !== 'central_hub') return // Only spawn in central hub for now
      
      this.spawnRegionNPCs(region)
    })
  }

  // Spawn NPCs in a specific region
  spawnRegionNPCs(region) {
    const npcCount = 3 + Math.floor(Math.random() * 5)
    
    for (let i = 0; i < npcCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * region.radius * 0.8
      const x = region.center.x + Math.cos(angle) * distance
      const z = region.center.z + Math.sin(angle) * distance
      
      this.createNPC(region, x, z)
    }
  }

  // Create an NPC
  createNPC(region, x, z) {
    const npcTypes = [
      { name: 'تاجر', color: 0x00ff00, type: 'merchant' },
      { name: 'حارس', color: 0x0000ff, type: 'guard' },
      { name: 'حكيم', color: 0xff00ff, type: 'sage' },
      { name: 'مدرب', color: 0xffff00, type: 'trainer' }
    ]
    
    const npcType = npcTypes[Math.floor(Math.random() * npcTypes.length)]
    
    // Create visual representation
    const geometry = new THREE.CapsuleGeometry(0.5, 1.5)
    const material = new THREE.MeshLambertMaterial({ color: npcType.color })
    
    const npc = new THREE.Mesh(geometry, material)
    npc.position.set(x, 1, z)
    npc.castShadow = true
    
    npc.userData = {
      type: 'npc',
      npcType: npcType.type,
      name: npcType.name,
      level: 1 + Math.floor(Math.random() * 10),
      dialogue: this.generateDialogue(npcType.type),
      interactable: true,
      health: 100,
      maxHealth: 100
    }
    
    const npcId = `npc_${region.id}_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(npcId, npc)
    this.npcs.set(npcId, npc)
  }

  // Generate dialogue for NPCs
  generateDialogue(npcType) {
    const dialogues = {
      merchant: [
        'مرحباً! لدي أفضل البضائع في المنطقة!',
        'هل تريد شراء شيء؟ لدي عروض خاصة اليوم.',
        'البضائع النادرة تحتاج لمغامرين شجعان لجلبها.'
      ],
      guard: [
        'هذه المنطقة آمنة تحت حمايتي.',
        'احذر من الوحوش في المناطق الخارجية.',
        'السلام والأمان هما أولويتي.'
      ],
      sage: [
        'المعرفة هي القوة الحقيقية يا صديقي.',
        'العناصر الأربعة تحمل أسراراً عظيمة.',
        'التوازن بين العناصر هو مفتاح القوة.'
      ],
      trainer: [
        'هل تريد تحسين مهاراتك؟',
        'التدريب المستمر هو طريق الإتقان.',
        'كل عنصر له تقنياته الخاصة.'
      ]
    }
    
    return dialogues[npcType] || ['مرحباً بك في عالم Skyward Realms!']
  }

  // Get region at position
  getRegionAtPosition(x, z) {
    for (const [id, region] of this.regions) {
      const distance = Math.sqrt(
        Math.pow(x - region.center.x, 2) + 
        Math.pow(z - region.center.z, 2)
      )
      
      if (distance <= region.radius) {
        return region
      }
    }
    
    return null
  }

  // Collect resource
  collectResource(resourceId, playerId) {
    const resource = this.resources.get(resourceId)
    if (!resource) return null
    
    const resourceData = {
      name: resource.userData.name,
      element: resource.userData.element,
      rarity: resource.userData.rarity,
      quantity: resource.userData.quantity,
      type: 'material'
    }
    
    // Remove resource from world
    this.gameEngine.removeGameObject(resourceId)
    this.resources.delete(resourceId)
    
    // Schedule respawn
    setTimeout(() => {
      this.respawnResource(resource.position, resource.userData)
    }, resource.userData.respawnTime)
    
    return resourceData
  }

  // Respawn resource
  respawnResource(position, originalData) {
    const geometry = new THREE.OctahedronGeometry(0.5)
    const material = new THREE.MeshLambertMaterial({ 
      color: this.getRegionColor(originalData.element),
      emissive: this.getRegionColor(originalData.element),
      emissiveIntensity: 0.2
    })
    
    const resource = new THREE.Mesh(geometry, material)
    resource.position.copy(position)
    resource.castShadow = true
    resource.userData = { ...originalData }
    
    const resourceId = `resource_respawn_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(resourceId, resource)
    this.resources.set(resourceId, resource)
  }

  // Get region color
  getRegionColor(element) {
    const colors = {
      fire: 0xff4500,
      water: 0x1e90ff,
      earth: 0x8b4513,
      air: 0xe6e6fa,
      neutral: 0x888888
    }
    
    return colors[element] || colors.neutral
  }

  // Interact with NPC
  interactWithNPC(npcId) {
    const npc = this.npcs.get(npcId)
    if (!npc || !npc.userData.interactable) return null
    
    const dialogue = npc.userData.dialogue
    const randomDialogue = dialogue[Math.floor(Math.random() * dialogue.length)]
    
    return {
      npcName: npc.userData.name,
      npcType: npc.userData.npcType,
      message: randomDialogue,
      level: npc.userData.level
    }
  }

  // Get nearby objects
  getNearbyObjects(position, radius = 5) {
    const nearby = []
    
    // Check resources
    this.resources.forEach((resource, id) => {
      const distance = position.distanceTo(resource.position)
      if (distance <= radius) {
        nearby.push({ id, object: resource, type: 'resource', distance })
      }
    })
    
    // Check NPCs
    this.npcs.forEach((npc, id) => {
      const distance = position.distanceTo(npc.position)
      if (distance <= radius) {
        nearby.push({ id, object: npc, type: 'npc', distance })
      }
    })
    
    return nearby.sort((a, b) => a.distance - b.distance)
  }

  // Update world
  update(deltaTime) {
    // Update any dynamic world elements here
    // This could include weather effects, day/night cycle impacts, etc.
  }

  // Cleanup
  dispose() {
    this.resources.clear()
    this.npcs.clear()
    this.structures.clear()
    this.regions.clear()
    console.log('World disposed')
  }
}

export default WorldManager

