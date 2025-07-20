import * as THREE from 'three'

class PhysicsSystem {
  constructor(scene) {
    this.scene = scene
    this.physicsBodies = new Map()
    this.staticColliders = []
    this.terrainColliders = []
    this.gravity = new THREE.Vector3(0, -9.81, 0)
    this.enabled = true
    
    this.settings = {
      gravity: -9.81,
      airResistance: 0.98,
      groundFriction: 0.92,
      waterResistance: 0.85,
      bounceDamping: 0.7,
      collisionMargin: 0.1
    }
    
    console.log('PhysicsSystem: Initialized')
  }

  /**
   * Add physics body to an object
   */
  addBody(object, options = {}) {
    const physicsBody = {
      object: object,
      type: options.type || 'dynamic', // 'dynamic', 'static', 'kinematic'
      velocity: new THREE.Vector3(0, 0, 0),
      acceleration: new THREE.Vector3(0, 0, 0),
      mass: options.mass || 1.0,
      restitution: options.restitution || 0.3, // Bounciness
      friction: options.friction || 0.5,
      isGrounded: false,
      inWater: false,
      collisionRadius: options.radius || 1.0,
      collisionHeight: options.height || 2.0,
      collisionOffset: options.offset || new THREE.Vector3(0, 0, 0),
      onGround: false,
      lastGroundContact: 0
    }
    
    // Store velocity on the object for other systems to access
    object.velocity = physicsBody.velocity
    object.physicsBody = physicsBody
    
    this.physicsBodies.set(object.id, physicsBody)
    
    console.log(`PhysicsSystem: Added physics body for ${object.name || 'Object'} (${physicsBody.type})`)
    return physicsBody
  }

  /**
   * Remove physics body from an object
   */
  removeBody(object) {
    if (this.physicsBodies.has(object.id)) {
      this.physicsBodies.delete(object.id)
      delete object.velocity
      delete object.physicsBody
    }
  }

  /**
   * Add static collider (terrain, walls, etc.)
   */
  addStaticCollider(object, options = {}) {
    const collider = {
      object: object,
      type: options.type || 'box', // 'box', 'sphere', 'plane', 'mesh'
      bounds: this.calculateBounds(object),
      material: options.material || 'default'
    }
    
    if (object.name && object.name.includes('Terrain')) {
      this.terrainColliders.push(collider)
    } else {
      this.staticColliders.push(collider)
    }
    
    console.log(`PhysicsSystem: Added static collider for ${object.name || 'Object'}`)
    return collider
  }

  /**
   * Calculate bounding box for an object
   */
  calculateBounds(object) {
    const box = new THREE.Box3().setFromObject(object)
    return {
      min: box.min.clone(),
      max: box.max.clone(),
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3())
    }
  }

  /**
   * Apply force to a physics body
   */
  applyForce(object, force, mode = 'force') {
    const body = this.physicsBodies.get(object.id)
    if (!body) return
    
    switch (mode) {
      case 'force':
        body.acceleration.add(force.clone().divideScalar(body.mass))
        break
      case 'impulse':
        body.velocity.add(force.clone().divideScalar(body.mass))
        break
      case 'velocity':
        body.velocity.copy(force)
        break
    }
  }

  /**
   * Set object velocity
   */
  setVelocity(object, velocity) {
    const body = this.physicsBodies.get(object.id)
    if (body) {
      body.velocity.copy(velocity)
    }
  }

  /**
   * Get object velocity
   */
  getVelocity(object) {
    const body = this.physicsBodies.get(object.id)
    return body ? body.velocity.clone() : new THREE.Vector3(0, 0, 0)
  }

  /**
   * Check if object is on ground
   */
  isOnGround(object) {
    const body = this.physicsBodies.get(object.id)
    return body ? body.isGrounded : false
  }

  /**
   * Main physics update loop
   */
  update(deltaTime) {
    if (!this.enabled) return
    
    // Clamp deltaTime to prevent physics instability
    deltaTime = Math.min(deltaTime, 0.016) // Max 60 FPS
    
    this.physicsBodies.forEach((body, objectId) => {
      if (body.type === 'static') return
      
      this.updateBody(body, deltaTime)
    })
  }

  /**
   * Update a single physics body
   */
  updateBody(body, deltaTime) {
    const object = body.object
    
    // Store previous position for collision resolution
    const previousPosition = object.position.clone()
    
    // Apply gravity
    if (!body.isGrounded && body.type === 'dynamic') {
      body.acceleration.y += this.settings.gravity
    }
    
    // Apply air/water resistance
    if (body.inWater) {
      body.velocity.multiplyScalar(this.settings.waterResistance)
    } else {
      body.velocity.multiplyScalar(this.settings.airResistance)
    }
    
    // Apply ground friction
    if (body.isGrounded) {
      body.velocity.x *= this.settings.groundFriction
      body.velocity.z *= this.settings.groundFriction
    }
    
    // Integrate velocity
    body.velocity.add(body.acceleration.clone().multiplyScalar(deltaTime))
    
    // Integrate position
    const deltaPosition = body.velocity.clone().multiplyScalar(deltaTime)
    object.position.add(deltaPosition)
    
    // Reset acceleration for next frame
    body.acceleration.set(0, 0, 0)
    
    // Collision detection and response
    this.handleCollisions(body, previousPosition)
    
    // Ground detection
    this.updateGroundContact(body)
  }

  /**
   * Handle collisions for a physics body
   */
  handleCollisions(body, previousPosition) {
    const object = body.object
    let hasCollision = false
    
    // Check terrain collisions
    for (const terrainCollider of this.terrainColliders) {
      const collision = this.checkTerrainCollision(body, terrainCollider)
      if (collision) {
        this.resolveTerrainCollision(body, collision, previousPosition)
        hasCollision = true
      }
    }
    
    // Check static object collisions
    for (const staticCollider of this.staticColliders) {
      const collision = this.checkStaticCollision(body, staticCollider)
      if (collision) {
        this.resolveStaticCollision(body, collision, previousPosition)
        hasCollision = true
      }
    }
    
    // Check dynamic body collisions
    this.physicsBodies.forEach((otherBody, otherId) => {
      if (otherBody === body || otherBody.type === 'static') return
      
      const collision = this.checkDynamicCollision(body, otherBody)
      if (collision) {
        this.resolveDynamicCollision(body, otherBody, collision)
        hasCollision = true
      }
    })
  }

  /**
   * Check collision with terrain
   */
  checkTerrainCollision(body, terrainCollider) {
    const object = body.object
    const terrain = terrainCollider.object
    
    // Simple terrain collision - check if object is below terrain level
    const terrainY = terrain.position.y
    const objectBottomY = object.position.y - body.collisionHeight / 2
    
    if (objectBottomY <= terrainY + 0.1) {
      return {
        normal: new THREE.Vector3(0, 1, 0),
        penetration: terrainY - objectBottomY + 0.1,
        contact: new THREE.Vector3(object.position.x, terrainY, object.position.z)
      }
    }
    
    return null
  }

  /**
   * Resolve terrain collision
   */
  resolveTerrainCollision(body, collision, previousPosition) {
    const object = body.object
    
    // Move object out of terrain
    object.position.y = collision.contact.y + body.collisionHeight / 2
    
    // Apply bounce or stop based on velocity
    if (body.velocity.y < -0.5) {
      body.velocity.y = -body.velocity.y * body.restitution
    } else {
      body.velocity.y = 0
      body.isGrounded = true
      body.lastGroundContact = Date.now()
    }
  }

  /**
   * Check collision with static objects
   */
  checkStaticCollision(body, staticCollider) {
    const object = body.object
    const staticObj = staticCollider.object
    
    // Simple sphere-box collision detection
    const objectPos = object.position.clone().add(body.collisionOffset)
    const staticBounds = staticCollider.bounds
    
    // Find closest point on the static object to the dynamic object
    const closestPoint = new THREE.Vector3(
      Math.max(staticBounds.min.x, Math.min(objectPos.x, staticBounds.max.x)),
      Math.max(staticBounds.min.y, Math.min(objectPos.y, staticBounds.max.y)),
      Math.max(staticBounds.min.z, Math.min(objectPos.z, staticBounds.max.z))
    )
    
    const distance = objectPos.distanceTo(closestPoint)
    
    if (distance < body.collisionRadius) {
      const normal = objectPos.clone().sub(closestPoint).normalize()
      if (normal.length() === 0) {
        normal.set(0, 1, 0) // Default up normal
      }
      
      return {
        normal: normal,
        penetration: body.collisionRadius - distance,
        contact: closestPoint
      }
    }
    
    return null
  }

  /**
   * Resolve static collision
   */
  resolveStaticCollision(body, collision, previousPosition) {
    const object = body.object
    
    // Move object out of collision
    object.position.add(collision.normal.clone().multiplyScalar(collision.penetration))
    
    // Reflect velocity based on collision normal
    const velocityAlongNormal = body.velocity.dot(collision.normal)
    if (velocityAlongNormal < 0) {
      body.velocity.sub(collision.normal.clone().multiplyScalar(velocityAlongNormal * (1 + body.restitution)))
    }
  }

  /**
   * Check collision between dynamic bodies
   */
  checkDynamicCollision(body1, body2) {
    const pos1 = body1.object.position.clone().add(body1.collisionOffset)
    const pos2 = body2.object.position.clone().add(body2.collisionOffset)
    
    const distance = pos1.distanceTo(pos2)
    const minDistance = body1.collisionRadius + body2.collisionRadius
    
    if (distance < minDistance) {
      const normal = pos1.clone().sub(pos2).normalize()
      if (normal.length() === 0) {
        normal.set(1, 0, 0) // Default normal
      }
      
      return {
        normal: normal,
        penetration: minDistance - distance,
        contact: pos2.clone().add(normal.clone().multiplyScalar(body2.collisionRadius))
      }
    }
    
    return null
  }

  /**
   * Resolve collision between dynamic bodies
   */
  resolveDynamicCollision(body1, body2, collision) {
    const totalMass = body1.mass + body2.mass
    const massRatio1 = body2.mass / totalMass
    const massRatio2 = body1.mass / totalMass
    
    // Separate objects
    const separation = collision.normal.clone().multiplyScalar(collision.penetration)
    body1.object.position.add(separation.clone().multiplyScalar(massRatio1))
    body2.object.position.sub(separation.clone().multiplyScalar(massRatio2))
    
    // Calculate relative velocity
    const relativeVelocity = body1.velocity.clone().sub(body2.velocity)
    const velocityAlongNormal = relativeVelocity.dot(collision.normal)
    
    if (velocityAlongNormal > 0) return // Objects separating
    
    // Calculate impulse
    const restitution = Math.min(body1.restitution, body2.restitution)
    const impulseMagnitude = -(1 + restitution) * velocityAlongNormal / totalMass
    const impulse = collision.normal.clone().multiplyScalar(impulseMagnitude)
    
    // Apply impulse
    body1.velocity.add(impulse.clone().multiplyScalar(body2.mass))
    body2.velocity.sub(impulse.clone().multiplyScalar(body1.mass))
  }

  /**
   * Update ground contact for a body
   */
  updateGroundContact(body) {
    // Check if we've been off the ground for too long
    if (body.isGrounded && Date.now() - body.lastGroundContact > 100) {
      body.isGrounded = false
    }
  }

  /**
   * Raycast from position in direction
   */
  raycast(origin, direction, maxDistance = 100) {
    const raycaster = new THREE.Raycaster(origin, direction, 0, maxDistance)
    
    // Check against terrain
    const terrainIntersects = []
    this.terrainColliders.forEach(collider => {
      const intersects = raycaster.intersectObject(collider.object, true)
      terrainIntersects.push(...intersects)
    })
    
    // Check against static objects
    const staticIntersects = []
    this.staticColliders.forEach(collider => {
      const intersects = raycaster.intersectObject(collider.object, true)
      staticIntersects.push(...intersects)
    })
    
    const allIntersects = [...terrainIntersects, ...staticIntersects]
    allIntersects.sort((a, b) => a.distance - b.distance)
    
    return allIntersects.length > 0 ? allIntersects[0] : null
  }

  /**
   * Get ground height at position
   */
  getGroundHeight(x, z) {
    const rayOrigin = new THREE.Vector3(x, 100, z)
    const rayDirection = new THREE.Vector3(0, -1, 0)
    
    const hit = this.raycast(rayOrigin, rayDirection)
    return hit ? hit.point.y : 0
  }

  /**
   * Enable/disable physics system
   */
  setEnabled(enabled) {
    this.enabled = enabled
  }

  /**
   * Clean up physics system
   */
  dispose() {
    this.physicsBodies.clear()
    this.staticColliders = []
    this.terrainColliders = []
  }
}

export default PhysicsSystem