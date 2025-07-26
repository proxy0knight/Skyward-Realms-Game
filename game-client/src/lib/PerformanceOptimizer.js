/**
 * Performance Optimizer for Skyward Realms Game
 * Ensures smooth gameplay on minimum hardware requirements
 */

class PerformanceOptimizer {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.isActive = true
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      drawCalls: 0,
      triangles: 0,
      memory: { used: 0, total: 0 },
      lastFrameTime: performance.now()
    }
    
    this.thresholds = {
      lowFPS: 25,
      mediumFPS: 45,
      highDrawCalls: 1000,
      highMemory: 0.8 // 80% of available
    }
    
    this.optimizations = {
      lodDistance: 50,
      shadowQuality: 'medium',
      textureQuality: 'medium',
      particleQuality: 'medium',
      cullingDistance: 75,
      enableInstancing: true,
      enableFrustumCulling: true,
      enableOcclusion: false,
      maxDrawCalls: 750,
      targetFPS: 30 // Minimum target for smooth gameplay
    }
    
    this.systemInfo = this.detectSystemCapabilities()
    this.autoAdjustSettings()
    
    // Start monitoring
    this.monitoringInterval = setInterval(() => this.monitor(), 1000)
  }

  detectSystemCapabilities() {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    const info = {
      mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      cores: navigator.hardwareConcurrency || 4,
      memory: navigator.deviceMemory ? navigator.deviceMemory * 1024 : 4096, // MB
      gpu: 'Unknown',
      webglVersion: gl ? (gl.getParameter ? 'WebGL 1.0' : 'WebGL 2.0') : 'None',
      maxTextureSize: 2048,
      maxVertexUniforms: 128,
      performance: 'medium'
    }

    if (gl) {
      try {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          info.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        }
        info.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
        info.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)
      } catch (error) {
        console.warn('Could not detect full GPU capabilities:', error)
      }
    }

    // Classify performance tier
    if (info.mobile || info.memory < 2048 || info.cores < 4) {
      info.performance = 'low'
    } else if (info.memory > 8192 && info.cores >= 8) {
      info.performance = 'high'
    } else {
      info.performance = 'medium'
    }

    canvas.remove()
    return info
  }

  autoAdjustSettings() {
    const { performance, mobile, memory } = this.systemInfo
    
    switch (performance) {
      case 'low':
        this.optimizations = {
          ...this.optimizations,
          lodDistance: 25,
          shadowQuality: 'low',
          textureQuality: 'low',
          particleQuality: 'low',
          cullingDistance: 40,
          enableOcclusion: true,
          maxDrawCalls: 300,
          targetFPS: 24
        }
        break
        
      case 'medium':
        this.optimizations = {
          ...this.optimizations,
          lodDistance: 40,
          shadowQuality: 'medium',
          textureQuality: 'medium',
          particleQuality: 'medium',
          cullingDistance: 60,
          enableOcclusion: false,
          maxDrawCalls: 600,
          targetFPS: 30
        }
        break
        
      case 'high':
        this.optimizations = {
          ...this.optimizations,
          lodDistance: 80,
          shadowQuality: 'high',
          textureQuality: 'high',
          particleQuality: 'high',
          cullingDistance: 120,
          enableOcclusion: false,
          maxDrawCalls: 1200,
          targetFPS: 60
        }
        break
    }

    // Additional mobile optimizations
    if (mobile) {
      this.optimizations.targetFPS = Math.min(this.optimizations.targetFPS, 30)
      this.optimizations.maxDrawCalls = Math.floor(this.optimizations.maxDrawCalls * 0.7)
      this.optimizations.cullingDistance = Math.floor(this.optimizations.cullingDistance * 0.8)
    }

    console.log('Performance tier:', performance)
    console.log('Auto-adjusted settings:', this.optimizations)
  }

  monitor() {
    if (!this.isActive || !this.gameEngine?.engine) return

    const now = performance.now()
    const deltaTime = now - this.metrics.lastFrameTime
    this.metrics.lastFrameTime = now

    // Update metrics
    this.metrics.fps = this.gameEngine.engine.getFps() || 0
    this.metrics.frameTime = deltaTime
    
    if (this.gameEngine.scene) {
      const activeMeshes = this.gameEngine.scene.getActiveMeshes()
      this.metrics.drawCalls = activeMeshes.length
      this.metrics.triangles = activeMeshes.reduce((total, mesh) => {
        return total + (mesh.getTotalVertices ? Math.floor(mesh.getTotalVertices() / 3) : 0)
      }, 0)
    }

    if (performance.memory) {
      this.metrics.memory.used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      this.metrics.memory.total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
    }

    // Check if optimizations are needed
    this.checkPerformance()
  }

  checkPerformance() {
    const { fps, drawCalls, memory } = this.metrics
    let needsOptimization = false

    // FPS too low
    if (fps < this.optimizations.targetFPS) {
      console.log(`Low FPS detected: ${fps}, target: ${this.optimizations.targetFPS}`)
      needsOptimization = true
    }

    // Too many draw calls
    if (drawCalls > this.optimizations.maxDrawCalls) {
      console.log(`High draw calls: ${drawCalls}, max: ${this.optimizations.maxDrawCalls}`)
      needsOptimization = true
    }

    // Memory usage too high
    const memoryUsage = memory.total > 0 ? memory.used / memory.total : 0
    if (memoryUsage > this.thresholds.highMemory) {
      console.log(`High memory usage: ${Math.round(memoryUsage * 100)}%`)
      needsOptimization = true
    }

    if (needsOptimization) {
      this.applyDynamicOptimizations()
    }
  }

  applyDynamicOptimizations() {
    const { fps } = this.metrics

    // Reduce quality if FPS is critically low
    if (fps < this.thresholds.lowFPS) {
      this.reduceLODDistance()
      this.reduceShadowQuality()
      this.enableMoreAgggressiveCulling()
    }
    
    // Moderate optimization for medium FPS
    else if (fps < this.thresholds.mediumFPS) {
      this.reduceLODDistance(0.9) // Reduce by 10%
      this.enableFrustumCulling()
    }
  }

  reduceLODDistance(factor = 0.8) {
    this.optimizations.lodDistance = Math.max(15, this.optimizations.lodDistance * factor)
    console.log(`Reduced LOD distance to: ${this.optimizations.lodDistance}`)
    this.applyLODSettings()
  }

  reduceShadowQuality() {
    const qualities = ['ultra', 'high', 'medium', 'low', 'off']
    const current = qualities.indexOf(this.optimizations.shadowQuality)
    if (current < qualities.length - 1) {
      this.optimizations.shadowQuality = qualities[current + 1]
      console.log(`Reduced shadow quality to: ${this.optimizations.shadowQuality}`)
      this.applyShadowSettings()
    }
  }

  enableMoreAgggressiveCulling() {
    this.optimizations.cullingDistance = Math.max(20, this.optimizations.cullingDistance * 0.7)
    this.optimizations.enableOcclusion = true
    console.log(`Enabled aggressive culling: ${this.optimizations.cullingDistance}m`)
    this.applyCullingSettings()
  }

  enableFrustumCulling() {
    if (!this.optimizations.enableFrustumCulling) {
      this.optimizations.enableFrustumCulling = true
      console.log('Enabled frustum culling')
      this.applyCullingSettings()
    }
  }

  applyLODSettings() {
    if (!this.gameEngine?.scene) return

    try {
      this.gameEngine.scene.meshes.forEach(mesh => {
        if (mesh.setLODDistance) {
          mesh.setLODDistance(this.optimizations.lodDistance)
        }
      })
    } catch (error) {
      console.error('Failed to apply LOD settings:', error)
    }
  }

  applyShadowSettings() {
    if (!this.gameEngine?.shadowGenerator) return

    try {
      const { shadowQuality } = this.optimizations
      
      switch (shadowQuality) {
        case 'off':
          this.gameEngine.shadowGenerator.dispose()
          break
        case 'low':
          this.gameEngine.shadowGenerator.mapSize = 512
          this.gameEngine.shadowGenerator.useExponentialShadowMap = false
          break
        case 'medium':
          this.gameEngine.shadowGenerator.mapSize = 1024
          this.gameEngine.shadowGenerator.useExponentialShadowMap = true
          break
        case 'high':
          this.gameEngine.shadowGenerator.mapSize = 2048
          this.gameEngine.shadowGenerator.useExponentialShadowMap = true
          break
        case 'ultra':
          this.gameEngine.shadowGenerator.mapSize = 4096
          this.gameEngine.shadowGenerator.useExponentialShadowMap = true
          break
      }
    } catch (error) {
      console.error('Failed to apply shadow settings:', error)
    }
  }

  applyCullingSettings() {
    if (!this.gameEngine?.scene) return

    try {
      // Enable frustum culling
      if (this.optimizations.enableFrustumCulling) {
        this.gameEngine.scene.frustumCullingEnabled = true
      }

      // Enable occlusion culling if supported
      if (this.optimizations.enableOcclusion) {
        this.gameEngine.scene.setOcclusionCullingEnabled(true)
      }

      // Set culling distance
      this.gameEngine.scene.meshes.forEach(mesh => {
        if (mesh.position) {
          const distance = Math.sqrt(
            Math.pow(mesh.position.x, 2) + 
            Math.pow(mesh.position.z, 2)
          )
          
          if (distance > this.optimizations.cullingDistance) {
            mesh.setEnabled(false)
          } else {
            mesh.setEnabled(true)
          }
        }
      })
    } catch (error) {
      console.error('Failed to apply culling settings:', error)
    }
  }

  applyTextureOptimizations() {
    if (!this.gameEngine?.scene) return

    try {
      const { textureQuality } = this.optimizations
      let scale = 1.0

      switch (textureQuality) {
        case 'low': scale = 0.5; break
        case 'medium': scale = 0.75; break
        case 'high': scale = 1.0; break
        case 'ultra': scale = 1.0; break
      }

      this.gameEngine.scene.textures.forEach(texture => {
        if (texture.updateSize && texture.baseSize) {
          const newSize = Math.floor(texture.baseSize * scale)
          texture.updateSize(newSize, newSize)
        }
      })
    } catch (error) {
      console.error('Failed to apply texture optimizations:', error)
    }
  }

  optimizeAssetSpawning(spawnAreas) {
    // Reduce spawn rates based on performance
    const performanceMultiplier = this.metrics.fps < this.thresholds.lowFPS ? 0.5 : 
                                  this.metrics.fps < this.thresholds.mediumFPS ? 0.75 : 1.0

    return spawnAreas.map(area => ({
      ...area,
      spawnSettings: {
        ...area.spawnSettings,
        maxObjects: Math.floor(area.spawnSettings.maxObjects * performanceMultiplier),
        spawnRate: area.spawnSettings.spawnRate * performanceMultiplier,
        respawnInterval: Math.floor(area.spawnSettings.respawnInterval / performanceMultiplier)
      }
    }))
  }

  getOptimizedAssetLOD(distance, assetType) {
    const { lodDistance } = this.optimizations
    
    if (distance > lodDistance * 2) {
      return null // Cull completely
    } else if (distance > lodDistance) {
      return 'low' // Low detail
    } else if (distance > lodDistance * 0.5) {
      return 'medium' // Medium detail
    } else {
      return 'high' // High detail
    }
  }

  enablePerformanceMode() {
    console.log('Enabling emergency performance mode')
    
    this.optimizations = {
      ...this.optimizations,
      lodDistance: 20,
      shadowQuality: 'off',
      textureQuality: 'low',
      particleQuality: 'low',
      cullingDistance: 30,
      enableOcclusion: true,
      maxDrawCalls: 200,
      targetFPS: 20
    }
    
    this.applyAllOptimizations()
  }

  applyAllOptimizations() {
    this.applyLODSettings()
    this.applyShadowSettings()
    this.applyCullingSettings()
    this.applyTextureOptimizations()
  }

  getMetrics() {
    return {
      ...this.metrics,
      systemInfo: this.systemInfo,
      optimizations: this.optimizations,
      performanceGrade: this.getPerformanceGrade()
    }
  }

  getPerformanceGrade() {
    const { fps } = this.metrics
    
    if (fps >= 50) return 'A'
    if (fps >= 40) return 'B'
    if (fps >= 30) return 'C'
    if (fps >= 20) return 'D'
    return 'F'
  }

  dispose() {
    this.isActive = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
  }
}

export default PerformanceOptimizer
