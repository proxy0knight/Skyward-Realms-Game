import * as THREE from 'three'

export class ExplorationSystem {
  constructor(gameEngine, playerManager, worldManager) {
    this.gameEngine = gameEngine
    this.playerManager = playerManager
    this.worldManager = worldManager
    this.discoveredAreas = new Set()
    this.questMarkers = new Map()
    this.interactableObjects = new Map()
    this.explorationData = {
      totalAreas: 5,
      discoveredAreas: 0,
      explorationPercentage: 0,
      secretsFound: 0,
      totalSecrets: 15
    }
    
    this.setupEventListeners()
    this.initializeExplorationAreas()
  }

  // Setup event listeners
  setupEventListeners() {
    this.gameEngine.on('update', (deltaTime) => {
      this.update(deltaTime)
    })
  }

  // Initialize exploration areas
  initializeExplorationAreas() {
    const areas = [
      {
        id: 'fire_realm',
        name: 'عالم النار',
        center: { x: 75, z: 75 },
        radius: 40,
        secrets: ['fire_crystal_cave', 'ancient_forge', 'phoenix_nest']
      },
      {
        id: 'water_realm', 
        name: 'عالم الماء',
        center: { x: -75, z: 75 },
        radius: 40,
        secrets: ['underwater_temple', 'healing_spring', 'ice_cavern']
      },
      {
        id: 'earth_realm',
        name: 'عالم الأرض', 
        center: { x: -75, z: -75 },
        radius: 40,
        secrets: ['crystal_mine', 'stone_circle', 'mountain_peak']
      },
      {
        id: 'air_realm',
        name: 'عالم الهواء',
        center: { x: 75, z: -75 },
        radius: 40,
        secrets: ['sky_temple', 'wind_shrine', 'floating_garden']
      },
      {
        id: 'central_hub',
        name: 'المركز المحايد',
        center: { x: 0, z: 0 },
        radius: 30,
        secrets: ['ancient_library', 'elemental_nexus', 'hidden_vault']
      }
    ]

    areas.forEach(area => {
      this.createAreaMarkers(area)
      this.createSecrets(area)
    })
  }

  // Create area markers
  createAreaMarkers(area) {
    // Create area boundary marker
    const boundaryGeometry = new THREE.RingGeometry(area.radius - 2, area.radius, 32)
    const boundaryMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
    
    const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial)
    boundary.position.set(area.center.x, 0.1, area.center.z)
    boundary.rotation.x = -Math.PI / 2
    
    boundary.userData = {
      type: 'area_boundary',
      areaId: area.id,
      areaName: area.name
    }
    
    const boundaryId = `boundary_${area.id}`
    this.gameEngine.addGameObject(boundaryId, boundary)

    // Create area name marker
    const nameGeometry = new THREE.CylinderGeometry(2, 2, 0.5)
    const nameMaterial = new THREE.MeshLambertMaterial({
      color: 0x4444ff,
      emissive: 0x2222ff,
      emissiveIntensity: 0.3
    })
    
    const nameMarker = new THREE.Mesh(nameGeometry, nameMaterial)
    nameMarker.position.set(area.center.x, 1, area.center.z)
    
    nameMarker.userData = {
      type: 'area_marker',
      areaId: area.id,
      areaName: area.name,
      update: (deltaTime) => {
        nameMarker.rotation.y += deltaTime
        nameMarker.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.3
      }
    }
    
    const markerId = `marker_${area.id}`
    this.gameEngine.addGameObject(markerId, nameMarker)
  }

  // Create secrets in area
  createSecrets(area) {
    area.secrets.forEach((secretId, index) => {
      const angle = (index / area.secrets.length) * Math.PI * 2
      const distance = area.radius * 0.7
      const x = area.center.x + Math.cos(angle) * distance
      const z = area.center.z + Math.sin(angle) * distance
      
      this.createSecret(secretId, x, z, area.id)
    })
  }

  // Create a secret object
  createSecret(secretId, x, z, areaId) {
    const geometry = new THREE.OctahedronGeometry(0.8)
    const material = new THREE.MeshLambertMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.4
    })
    
    const secret = new THREE.Mesh(geometry, material)
    secret.position.set(x, 2, z)
    secret.castShadow = true
    
    secret.userData = {
      type: 'secret',
      secretId,
      areaId,
      discovered: false,
      reward: this.generateSecretReward(),
      update: (deltaTime) => {
        secret.rotation.x += deltaTime * 0.5
        secret.rotation.y += deltaTime * 0.8
        secret.position.y = 2 + Math.sin(Date.now() * 0.003 + x + z) * 0.5
      }
    }
    
    const objectId = `secret_${secretId}`
    this.gameEngine.addGameObject(objectId, secret)
    this.interactableObjects.set(objectId, secret)
  }

  // Generate secret reward
  generateSecretReward() {
    const rewards = [
      { type: 'experience', amount: 500 },
      { type: 'item', name: 'بلورة نادرة', rarity: 'epic', quantity: 1 },
      { type: 'item', name: 'جوهرة قوة', rarity: 'legendary', quantity: 1 },
      { type: 'skill_points', amount: 2 },
      { type: 'gold', amount: 1000 }
    ]
    
    return rewards[Math.floor(Math.random() * rewards.length)]
  }

  // Create quest marker
  createQuestMarker(x, z, questData) {
    const geometry = new THREE.ConeGeometry(0.5, 2)
    const material = new THREE.MeshLambertMaterial({
      color: questData.type === 'main' ? 0xff0000 : 0x00ff00,
      emissive: questData.type === 'main' ? 0x880000 : 0x008800,
      emissiveIntensity: 0.3
    })
    
    const marker = new THREE.Mesh(geometry, material)
    marker.position.set(x, 3, z)
    
    marker.userData = {
      type: 'quest_marker',
      questId: questData.id,
      questType: questData.type,
      questName: questData.name,
      update: (deltaTime) => {
        marker.rotation.y += deltaTime * 2
        marker.position.y = 3 + Math.sin(Date.now() * 0.004) * 0.4
      }
    }
    
    const markerId = `quest_${questData.id}`
    this.gameEngine.addGameObject(markerId, marker)
    this.questMarkers.set(markerId, marker)
    
    return markerId
  }

  // Remove quest marker
  removeQuestMarker(markerId) {
    if (this.questMarkers.has(markerId)) {
      this.gameEngine.removeGameObject(markerId)
      this.questMarkers.delete(markerId)
    }
  }

  // Check area discovery
  checkAreaDiscovery(playerPosition) {
    const regions = this.worldManager.regions
    
    regions.forEach((region, regionId) => {
      if (!this.discoveredAreas.has(regionId)) {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - region.center.x, 2) +
          Math.pow(playerPosition.z - region.center.z, 2)
        )
        
        if (distance <= region.radius) {
          this.discoverArea(regionId, region.name)
        }
      }
    })
  }

  // Discover area
  discoverArea(areaId, areaName) {
    if (!this.discoveredAreas.has(areaId)) {
      this.discoveredAreas.add(areaId)
      this.explorationData.discoveredAreas++
      this.explorationData.explorationPercentage = 
        (this.explorationData.discoveredAreas / this.explorationData.totalAreas) * 100
      
      // Give exploration reward
      this.playerManager.addExperience('local_player', 200)
      
      console.log(`منطقة جديدة مكتشفة: ${areaName}`)
      console.log(`تقدم الاستكشاف: ${this.explorationData.explorationPercentage.toFixed(1)}%`)
      
      // Create discovery effect
      this.createDiscoveryEffect(areaId)
    }
  }

  // Create discovery effect
  createDiscoveryEffect(areaId) {
    const region = this.worldManager.regions.get(areaId)
    if (!region) return
    
    // Create particle burst effect
    const particleCount = 100
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const color = new THREE.Color(region.color)
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 20
      
      positions[i * 3] = region.center.x + Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.random() * 10
      positions[i * 3 + 2] = region.center.z + Math.sin(angle) * radius
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    })
    
    const particleSystem = new THREE.Points(particles, particleMaterial)
    
    const effectId = `discovery_${areaId}_${Date.now()}`
    this.gameEngine.addGameObject(effectId, particleSystem)
    
    // Remove effect after 3 seconds
    setTimeout(() => {
      this.gameEngine.removeGameObject(effectId)
    }, 3000)
  }

  // Interact with secret
  interactWithSecret(secretId) {
    const secret = this.interactableObjects.get(secretId)
    if (!secret || secret.userData.discovered) return null
    
    secret.userData.discovered = true
    this.explorationData.secretsFound++
    
    // Apply reward
    const reward = secret.userData.reward
    let rewardMessage = ''
    
    switch (reward.type) {
      case 'experience':
        this.playerManager.addExperience('local_player', reward.amount)
        rewardMessage = `حصلت على ${reward.amount} نقطة خبرة!`
        break
        
      case 'item':
        this.playerManager.addItem('local_player', {
          name: reward.name,
          type: 'material',
          rarity: reward.rarity,
          quantity: reward.quantity
        })
        rewardMessage = `حصلت على ${reward.name}!`
        break
        
      case 'skill_points':
        const player = this.playerManager.getLocalPlayer()
        player.skills.availablePoints += reward.amount
        this.playerManager.savePlayerData()
        rewardMessage = `حصلت على ${reward.amount} نقطة مهارة!`
        break
        
      case 'gold':
        const localPlayer = this.playerManager.getLocalPlayer()
        localPlayer.inventory.gold += reward.amount
        this.playerManager.savePlayerData()
        rewardMessage = `حصلت على ${reward.amount} ذهب!`
        break
    }
    
    // Change secret appearance
    secret.material.color.setHex(0x888888)
    secret.material.emissive.setHex(0x444444)
    secret.material.emissiveIntensity = 0.1
    
    console.log(`سر مكتشف! ${rewardMessage}`)
    console.log(`الأسرار المكتشفة: ${this.explorationData.secretsFound}/${this.explorationData.totalSecrets}`)
    
    return {
      secretId: secret.userData.secretId,
      reward,
      message: rewardMessage
    }
  }

  // Get nearby interactables
  getNearbyInteractables(position, radius = 3) {
    const nearby = []
    
    this.interactableObjects.forEach((object, id) => {
      const distance = position.distanceTo(object.position)
      if (distance <= radius) {
        nearby.push({
          id,
          object,
          type: object.userData.type,
          distance,
          discovered: object.userData.discovered || false
        })
      }
    })
    
    // Also check quest markers
    this.questMarkers.forEach((marker, id) => {
      const distance = position.distanceTo(marker.position)
      if (distance <= radius) {
        nearby.push({
          id,
          object: marker,
          type: 'quest_marker',
          distance,
          questData: {
            id: marker.userData.questId,
            name: marker.userData.questName,
            type: marker.userData.questType
          }
        })
      }
    })
    
    return nearby.sort((a, b) => a.distance - b.distance)
  }

  // Create waypoint
  createWaypoint(x, z, name, color = 0x00ffff) {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 4)
    const material = new THREE.MeshLambertMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3
    })
    
    const waypoint = new THREE.Mesh(geometry, material)
    waypoint.position.set(x, 2, z)
    
    waypoint.userData = {
      type: 'waypoint',
      name: name,
      update: (deltaTime) => {
        waypoint.rotation.y += deltaTime
      }
    }
    
    const waypointId = `waypoint_${Date.now()}_${Math.random()}`
    this.gameEngine.addGameObject(waypointId, waypoint)
    
    return waypointId
  }

  // Remove waypoint
  removeWaypoint(waypointId) {
    this.gameEngine.removeGameObject(waypointId)
  }

  // Get exploration statistics
  getExplorationStats() {
    return {
      ...this.explorationData,
      discoveredAreasList: Array.from(this.discoveredAreas),
      completionPercentage: (
        (this.explorationData.discoveredAreas / this.explorationData.totalAreas) * 0.6 +
        (this.explorationData.secretsFound / this.explorationData.totalSecrets) * 0.4
      ) * 100
    }
  }

  // Get current area
  getCurrentArea(position) {
    const regions = this.worldManager.regions
    
    for (const [regionId, region] of regions) {
      const distance = Math.sqrt(
        Math.pow(position.x - region.center.x, 2) +
        Math.pow(position.z - region.center.z, 2)
      )
      
      if (distance <= region.radius) {
        return {
          id: regionId,
          name: region.name,
          element: region.element,
          dangerLevel: region.dangerLevel,
          discovered: this.discoveredAreas.has(regionId)
        }
      }
    }
    
    return {
      id: 'unknown',
      name: 'منطقة مجهولة',
      element: 'neutral',
      dangerLevel: 1,
      discovered: false
    }
  }

  // Update exploration system
  update(deltaTime) {
    const player = this.gameEngine.player
    if (!player) return
    
    // Check for area discovery
    this.checkAreaDiscovery(player.position)
    
    // Update interactable objects
    this.interactableObjects.forEach((object) => {
      if (object.userData.update) {
        object.userData.update(deltaTime)
      }
    })
    
    // Update quest markers
    this.questMarkers.forEach((marker) => {
      if (marker.userData.update) {
        marker.userData.update(deltaTime)
      }
    })
  }

  // Save exploration data
  saveExplorationData() {
    const data = {
      discoveredAreas: Array.from(this.discoveredAreas),
      explorationData: this.explorationData,
      interactableStates: {}
    }
    
    this.interactableObjects.forEach((object, id) => {
      data.interactableStates[id] = {
        discovered: object.userData.discovered || false
      }
    })
    
    try {
      localStorage.setItem('skyward_realms_exploration', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save exploration data:', error)
    }
  }

  // Load exploration data
  loadExplorationData() {
    try {
      const savedData = localStorage.getItem('skyward_realms_exploration')
      if (savedData) {
        const data = JSON.parse(savedData)
        
        this.discoveredAreas = new Set(data.discoveredAreas || [])
        this.explorationData = { ...this.explorationData, ...data.explorationData }
        
        // Restore interactable states
        if (data.interactableStates) {
          Object.entries(data.interactableStates).forEach(([id, state]) => {
            const object = this.interactableObjects.get(id)
            if (object && state.discovered) {
              object.userData.discovered = true
              object.material.color.setHex(0x888888)
              object.material.emissive.setHex(0x444444)
              object.material.emissiveIntensity = 0.1
            }
          })
        }
        
        console.log('Exploration data loaded')
      }
    } catch (error) {
      console.error('Failed to load exploration data:', error)
    }
  }

  // Cleanup
  dispose() {
    this.saveExplorationData()
    this.discoveredAreas.clear()
    this.questMarkers.clear()
    this.interactableObjects.clear()
    console.log('Exploration System disposed')
  }
}

export default ExplorationSystem

